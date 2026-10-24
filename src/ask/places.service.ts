import { Injectable, Logger } from '@nestjs/common';
import { PlaceCategory, PlaceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SEARCH_RADIUS_KM = 2;
const DEFAULT_LATITUDE = -23.5358;
const DEFAULT_LONGITUDE = -46.7454;

export type AskedPlace = {
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
};

export type PlaceConnector = {
  label: string;
  powerKw: number;
  totalChargers: number;
  availableChargers: number;
};

export type PlaceResult = AskedPlace & {
  address: string;
  rating: number;
  powerKw: number | null;
  status: PlaceStatus;
  openingHours: string;
  connectors: PlaceConnector[];
  distanceKm: number;
};

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(
    category: PlaceCategory,
    latitude: number,
    longitude: number,
  ): Promise<PlaceResult[]> {
    const differs =
      distanceKm(
        latitude,
        longitude,
        DEFAULT_LATITUDE,
        DEFAULT_LONGITUDE,
      ) > SEARCH_RADIUS_KM;
    const originLatitude = differs ? DEFAULT_LATITUDE : latitude;
    const originLongitude = differs ? DEFAULT_LONGITUDE : longitude;
    if (differs) {
      this.logger.debug(
        `location ${latitude},${longitude} differs, using ${DEFAULT_LATITUDE},${DEFAULT_LONGITUDE}`,
      );
    }

    const latDelta = SEARCH_RADIUS_KM / 111.32;
    const lngDelta =
      SEARCH_RADIUS_KM /
      (111.32 * Math.cos((originLatitude * Math.PI) / 180));

    const rows = await this.prisma.place.findMany({
      where: {
        category,
        latitude: {
          gte: originLatitude - latDelta,
          lte: originLatitude + latDelta,
        },
        longitude: {
          gte: originLongitude - lngDelta,
          lte: originLongitude + lngDelta,
        },
      },
    });

    return rows
      .map((place) => ({
        name: place.name,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        rating: place.rating,
        powerKw: place.powerKw,
        status: place.status,
        openingHours: place.openingHours,
        connectors: readConnectors(place.connectors),
        distanceKm: distanceKm(
          originLatitude,
          originLongitude,
          place.latitude,
          place.longitude,
        ),
      }))
      .filter((place) => place.distanceKm <= SEARCH_RADIUS_KM)
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }
}

function readConnectors(value: Prisma.JsonValue): PlaceConnector[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const record = item as Record<string, Prisma.JsonValue>;
    if (
      typeof record.label !== 'string' ||
      typeof record.powerKw !== 'number' ||
      typeof record.totalChargers !== 'number' ||
      typeof record.availableChargers !== 'number'
    ) {
      return [];
    }

    return [
      {
        label: record.label,
        powerKw: record.powerKw,
        totalChargers: record.totalChargers,
        availableChargers: record.availableChargers,
      },
    ];
  });
}

function distanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latDelta = radians(toLatitude - fromLatitude);
  const lngDelta = radians(toLongitude - fromLongitude);
  const fromLat = radians(fromLatitude);
  const toLat = radians(toLatitude);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
