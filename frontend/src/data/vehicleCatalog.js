import vehicles from "./vehicles.json";

const INDIAN_MAKES = {
  "MARUTI SUZUKI": [
    "ALTO K10",
    "BALENO",
    "BREZZA",
    "CIAZ",
    "DZIRE",
    "EECO",
    "ERTIGA",
    "FRONX",
    "GRAND VITARA",
    "IGNIS",
    "JIMNY",
    "SWIFT",
    "WAGON R",
  ],
  TATA: [
    "ALTROZ",
    "CURVV",
    "HARRIER",
    "NEXON",
    "PUNCH",
    "SAFARI",
    "TIAGO",
    "TIGOR",
  ],
  MAHINDRA: [
    "BE 6",
    "BOLERO",
    "SCORPIO N",
    "THAR",
    "XUV 3XO",
    "XUV700",
  ],
  "MG MOTOR": [
    "ASTOR",
    "COMET",
    "GLOSTER",
    "HECTOR",
    "ZS EV",
  ],
  SKODA: [
    "KODIAQ",
    "KUSHAQ",
    "SLAVIA",
    "SUPERB",
  ],
  VOLKSWAGEN: [
    ...(vehicles.VOLKSWAGEN || []),
    "TAIGUN",
    "VIRTUS",
  ],
  TOYOTA: [
    ...(vehicles.TOYOTA || []),
    "FORTUNER",
    "GLANZA",
    "HILUX",
    "INNOVA CRYSTA",
    "INNOVA HYCROSS",
    "RUMION",
    "URBAN CRUISER HYRYDER",
  ],
  HYUNDAI: [
    ...(vehicles.HYUNDAI || []),
    "AURA",
    "CRETA",
    "EXTER",
    "I20",
    "IONIQ 5",
    "TUCSON",
    "VENUE",
    "VERNA",
  ],
  HONDA: [
    ...(vehicles.HONDA || []),
    "AMAZE",
    "CITY",
    "CITY HYBRID",
    "ELEVATE",
  ],
  KIA: [
    ...(vehicles.KIA || []),
    "CARENS",
    "CARNIVAL",
    "SELTOS",
    "SONET",
    "SYROS",
  ],
  RENAULT: ["KIGER", "KWID", "TRIBER"],
  NISSAN: [...(vehicles.NISSAN || []), "MAGNITE", "X-TRAIL"],
  JEEP: [...(vehicles.JEEP || []), "COMPASS", "MERIDIAN"],
};

const mergedCatalog = Object.entries({
  ...vehicles,
  ...INDIAN_MAKES,
}).reduce((acc, [make, models]) => {
  acc[make] = [...new Set(models)].sort((a, b) => a.localeCompare(b));
  return acc;
}, {});

export const vehicleCatalog = mergedCatalog;

export const makeOptions = Object.keys(vehicleCatalog)
  .sort((a, b) => a.localeCompare(b))
  .map((make) => ({
    value: make,
    label: toTitleCase(make),
  }));

export function getModelOptions(make) {
  return (vehicleCatalog[make] || []).map((model) => ({
    value: model,
    label: toTitleCase(model),
  }));
}

export function getInitialVehicleSelection() {
  const defaultMake = vehicleCatalog.ACURA ? "ACURA" : makeOptions[0]?.value || "";
  const defaultModel = vehicleCatalog[defaultMake]?.[0] || "";

  return {
    make: defaultMake,
    model: defaultModel,
  };
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
