import type { TupleToUnion } from "type-fest";
import { SHELTER_NAMES } from "./index.constants.ts";

type Period = {
  startDate: Date;
  endDate: Date;
}

type ShelterName = TupleToUnion<typeof SHELTER_NAMES>;

type ShelterSleepingAvailability = 'more-than-5' | 'less-than-5' | 'no-availability';

type ShelterSleepingType = "bivouac" | "rent-tent" | "rent-room";

type ShelterSleeping = {
  sleepingType: ShelterSleepingType;
  availability: ShelterSleepingAvailability;
}

type ShelterAvailability = {
  date: Date;
  sleepings: ShelterSleeping[];
}

type Shelter = {
  name: ShelterName
  availability: ShelterAvailability[]
}

export type {
  Period,
  ShelterName,
  ShelterSleepingAvailability,
  ShelterSleepingType,
  ShelterSleeping,
  ShelterAvailability,
  Shelter,
};
