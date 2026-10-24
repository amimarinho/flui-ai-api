import { PlaceCategory, PlaceStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Connector = {
  label: string;
  powerKw: number;
  totalChargers: number;
  availableChargers: number;
};

// Coordinates come from OpenStreetMap objects within 2 km of ARCA
// (−23.5358, −46.7454). Unnamed features are omitted.
// Address, rating, status, hours, power, and connectors are demonstrative
// card fields on those same rows.
const places: {
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  status: PlaceStatus;
  openingHours: string;
  powerKw: number | null;
  connectors: Connector[];
}[] = [
  {
    name: 'Enel',
    category: PlaceCategory.ev_charging,
    latitude: -23.5485132,
    longitude: -46.7359186,
    address: 'São Paulo, SP',
    rating: 4.6,
    status: PlaceStatus.available,
    openingHours: '24 horas',
    powerKw: 22,
    connectors: [
      {
        label: 'Type 2',
        powerKw: 22,
        totalChargers: 2,
        availableChargers: 2,
      },
    ],
  },
  {
    name: "Fran's Café",
    category: PlaceCategory.coffee,
    latitude: -23.5240729,
    longitude: -46.7335302,
    address: 'São Paulo, SP',
    rating: 4.4,
    status: PlaceStatus.available,
    openingHours: '08h às 20h',
    powerKw: null,
    connectors: [],
  },
  {
    name: 'BR',
    category: PlaceCategory.gas_station,
    latitude: -23.5369512,
    longitude: -46.7460885,
    address: 'São Paulo, SP',
    rating: 4.1,
    status: PlaceStatus.available,
    openingHours: '24 horas',
    powerKw: null,
    connectors: [],
  },
  {
    name: 'Ipiranga',
    category: PlaceCategory.gas_station,
    latitude: -23.5358412,
    longitude: -46.7333073,
    address: 'São Paulo, SP',
    rating: 4.0,
    status: PlaceStatus.busy,
    openingHours: '24 horas',
    powerKw: null,
    connectors: [],
  },
  {
    name: 'Shell',
    category: PlaceCategory.gas_station,
    latitude: -23.5347783,
    longitude: -46.7332472,
    address: 'São Paulo, SP',
    rating: 4.2,
    status: PlaceStatus.available,
    openingHours: '24 horas',
    powerKw: null,
    connectors: [],
  },
  {
    name: 'Posto Shell - Cisne Branco Auto Posto',
    category: PlaceCategory.gas_station,
    latitude: -23.535908,
    longitude: -46.7323361,
    address: 'São Paulo, SP',
    rating: 4.3,
    status: PlaceStatus.available,
    openingHours: '06h às 22h',
    powerKw: null,
    connectors: [],
  },
  {
    name: 'Shell',
    category: PlaceCategory.gas_station,
    latitude: -23.5477738,
    longitude: -46.7499689,
    address: 'São Paulo, SP',
    rating: 3.9,
    status: PlaceStatus.maintenance,
    openingHours: '24 horas',
    powerKw: null,
    connectors: [],
  },
];

async function main() {
  await prisma.place.deleteMany();
  await prisma.place.createMany({ data: places });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
