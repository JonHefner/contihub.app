export const WEATHER_OPTIONS = [
  "Clear",
  "Partly cloudy",
  "Overcast",
  "Rain",
  "Snow",
  "High wind",
  "Fog",
] as const;

export const GROUND_OPTIONS = ["Dry", "Damp", "Mud", "Frozen", "Snow"] as const;

export const DEFAULT_FIELD_JOB = {
  companyName: "Continental Construction of Ohio",
  jobTitle: "",
  jobNumber: "",
  address: "123 Wooster Avenue, Akron, Ohio 44307",
  client: "",
  superintendent: "",
};

export const DEFAULT_SHIFT = {
  start: "07:00",
  end: "15:30",
};

export type WeatherOption = (typeof WEATHER_OPTIONS)[number];
export type GroundOption = (typeof GROUND_OPTIONS)[number];
