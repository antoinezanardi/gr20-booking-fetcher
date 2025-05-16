import { parse as parseHtml, HTMLElement } from "node-html-parser";
import { MISSING_SHELTER_DATES, PERIODS, SHELTER_NAMES } from "./index.constants.ts";
import type { Period, Shelter, ShelterSleeping, ShelterSleepingAvailability, ShelterSleepingType } from "./index.types.ts";

function getDateFromInputString(dateString: string): Date {
  const [day, month] = dateString.split("/").map(Number);

  return new Date(Date.UTC(2025, month - 1, day));
}

function getDateStringInAmericanFormat(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function fetchBookingPageHTML(period: Period): Promise<string> {
  const url = `https://pnr-resa.corsica/stock.php`;
  const startDateString = getDateStringInAmericanFormat(period.startDate);
  const endDateString = getDateStringInAmericanFormat(period.endDate);
  console.log(`📥  Fetching booking availability from ${startDateString} to ${endDateString}...`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      date_debut: startDateString,
      date_fin: endDateString,
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`Error fetching booking page: ${response.statusText}`);
  }
  return await response.text();
}

async function fetchBookingPagesFromPeriods(periods: Period[]): Promise<string[]> {
  const promises: Promise<string>[] = [];
  for (const period of periods) {
    try {
      promises.push(fetchBookingPageHTML(period));
    } catch (error) {
      throw new Error(`Error fetching booking page for period ${period.startDate} to ${period.endDate}: ${error}`);
    }
  }
  return await Promise.all(promises);
}

function getDatesFromTableHeaders(bookingTable: HTMLElement): string[] {
  const headers = bookingTable.querySelectorAll("thead th");
  const dateHeaders = headers.slice(2);

  return dateHeaders.map((header) => header.text);
}

function getShelterSleepingTypeFromRowIndex(index: number): ShelterSleepingType {
  if (index % 3 === 0) {
    return "bivouac";
  }
  if (index % 3 === 1) {
    return "rent-tent";
  }
  return "rent-room";
}

function getShelterSleepingFromTableCell(cell: HTMLElement, sleepingType: ShelterSleepingType): ShelterSleeping | undefined {
  const availabilityAttributes = cell.attributes;
  const availabilityStyles: Record<string, ShelterSleepingAvailability> = {
    "color:green": "more-than-5",
    "color:orange": "less-than-5",
    "color:darkred": "no-availability",
  }
  if (availabilityAttributes.style === undefined) {
    return undefined;
  }
  const availability = availabilityStyles[availabilityAttributes.style];
  if (availability === undefined) {
    return undefined;
  }
  return {
    sleepingType,
    availability,
  };
}

function getShelterSleepingsFromTableRow(row: HTMLElement, index: number): ShelterSleeping[] {
  const shelterSleepingType = getShelterSleepingTypeFromRowIndex(index);
  const cells = row.querySelectorAll("td");

  return cells.map(cell => getShelterSleepingFromTableCell(cell, shelterSleepingType)).filter(Boolean) as ShelterSleeping[];
}

function getSheltersWithoutAvailability(datesFromHeaders: string[]): Shelter[] {
  return SHELTER_NAMES.map((shelterName) => ({
    name: shelterName,
    availability: datesFromHeaders.map((date) => ({
      date: getDateFromInputString(date),
      sleepings: [],
    })),
  }));
}

function assignAvailabilityToShelter(shelter: Shelter, datesFromHeaders: string[], shelterSleepingForAllDates: ShelterSleeping[]): void {
  for (let i = 0; i < shelterSleepingForAllDates.length; i++) {
    const currentDate = datesFromHeaders[i];
    const shelterSleeping = shelterSleepingForAllDates[i];
    const shelterSleepingAvailability = shelterSleeping.availability;
    const shelterSleepingType = shelterSleeping.sleepingType;
    const shelterSleepingAvailabilityForDate = shelter.availability.find((s) => s.date.getTime() === getDateFromInputString(currentDate).getTime());
    if (!shelterSleepingAvailabilityForDate) {
      throw new Error(`Shelter sleeping availability for date ${currentDate} not found`);
    }
    shelterSleepingAvailabilityForDate.sleepings.push({
      sleepingType: shelterSleepingType,
      availability: shelterSleepingAvailability,
    });
  }
}

function parseBookingPage(page: string): Shelter[] {
  const root = parseHtml(page);
  const bookingTable = root.querySelector("#stockTable");
  if (!bookingTable) {
    throw new Error("Booking table not found in the HTML page");
  }
  const datesFromHeaders = getDatesFromTableHeaders(bookingTable);
  const shelters: Shelter[] = getSheltersWithoutAvailability(datesFromHeaders);
  const bookingTableRows = bookingTable.querySelectorAll("tbody > tr");
  let shelterIndex = 0;
  let currentShelterName = SHELTER_NAMES[shelterIndex];
  for (let i = 0; i < bookingTableRows.length; i++) {
    if (i !== 0 && i % 3 === 0) {
      shelterIndex++;
      currentShelterName = SHELTER_NAMES[shelterIndex];
    }
    const row = bookingTableRows[i];
    const shelterSleepingForAllDates = getShelterSleepingsFromTableRow(row, i);
    const shelter = shelters.find((s) => s.name === currentShelterName) as Shelter;
    if (shelter) {
      assignAvailabilityToShelter(shelter, datesFromHeaders, shelterSleepingForAllDates);
    }
  }
  return shelters;
}

function mergeBookingTables(bookingTables: Shelter[][]): Shelter[] {
  const mergedShelters: Shelter[] = [];
  for (const bookingTable of bookingTables) {
    for (const shelter of bookingTable) {
      const existingShelter = mergedShelters.find((s) => s.name === shelter.name);
      if (existingShelter) {
        existingShelter.availability.push(...shelter.availability);
      } else {
        mergedShelters.push(shelter);
      }
    }
  }
  return mergedShelters;
}

function printAvailableDateBasedOnMissingShelterDates(shelters: Shelter[]): void {
  let hasShelterWithAvailability = false;
  for (const shelterName in MISSING_SHELTER_DATES) {
    const shelter = shelters.find((s) => s.name === shelterName) as Shelter;
    const missingDate = MISSING_SHELTER_DATES[shelterName as keyof typeof MISSING_SHELTER_DATES] as Date;
    console.log("🔍", `Searching for availability on ${missingDate.toLocaleDateString("fr-FR")} for ${shelterName}...`);
    const shelterAvailability = shelter.availability.find((s) => s.date.getTime() === missingDate.getTime());
    const isShelterAvailable = shelterAvailability?.sleepings.some((s) => s.availability !== "no-availability");
    if (isShelterAvailable) {
      hasShelterWithAvailability = true;
      console.log("✅", `${shelterName} is available on ${missingDate.toLocaleDateString("fr-FR")}`);
    }
  }
  if (!hasShelterWithAvailability) {
    console.log("❌", "No shelters available for the specified dates.");
  } else {
    console.log("🎉  Some shelters are available for the specified dates.");
  }
}

async function printBookingAvailability(): Promise<void> {
  const bookingPagesInHtml = await fetchBookingPagesFromPeriods(PERIODS);
  const bookingTables = bookingPagesInHtml.map((page) => parseBookingPage(page));
  const mergedBookingTables = mergeBookingTables(bookingTables);
  printAvailableDateBasedOnMissingShelterDates(mergedBookingTables);
}

try {
  void printBookingAvailability();
} catch (error) {
  console.error(`❌ Error: ${error}`);
}
