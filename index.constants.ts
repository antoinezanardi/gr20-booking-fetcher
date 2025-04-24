import type { Period, ShelterName } from "./index.types.ts";

const SHELTER_NAMES = [
  "Site d'Ortu di u piobbu",
  "Refuge de Carozzu",
  "Refuge d'Ascu stagnu",
  "Refuge de Tighjettu",
  "Refuge de Ciottulu di i mori",
  "Refuge de Manganu",
  "Refuge de Petra piana",
  "Refuge de l'Onda",
  "Refuge de Prati",
  "Refuge de l'Usciolu",
  "Site d'Asinau",
  "Refuge de Paliri",
] as const;

const PERIODS: Period[] = [
  {
    startDate: new Date("2025-05-31"),
    endDate: new Date("2025-06-06"),
  },
  {
    startDate: new Date("2025-06-07"),
    endDate: new Date("2025-06-13"),
  },
  {
    startDate: new Date("2025-06-14"),
    endDate: new Date("2025-06-20"),
  },
] as const;

const MISSING_SHELTER_DATES: Partial<Record<ShelterName, Date>> = {
  "Site d'Ortu di u piobbu": new Date("2025-05-31"),
  "Refuge de Carozzu": new Date("2025-06-01"),
  "Refuge de Manganu": new Date("2025-06-05"),
  "Refuge de l'Onda": new Date("2025-06-07"),
  "Refuge de Prati": new Date("2025-06-10"),
  "Refuge de l'Usciolu": new Date("2025-06-11"),
} as const;

export {
  SHELTER_NAMES,
  PERIODS,
  MISSING_SHELTER_DATES,
};
