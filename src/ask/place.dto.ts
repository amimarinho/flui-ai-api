import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory, PlaceStatus } from '@prisma/client';

export class AskBodyDto {
  @ApiProperty({
    example: 'postos de gasolina perto',
    description:
      'What to look for. Gemini maps this to electric-car charging, coffee, or a gas station.',
  })
  text: string;

  @ApiProperty({ example: -23.5358, minimum: -90, maximum: 90 })
  latitude: number;

  @ApiProperty({ example: -46.7454, minimum: -180, maximum: 180 })
  longitude: number;
}

export class AskedPlaceDto {
  @ApiProperty({ example: "Fran's Café" })
  name: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.coffee })
  category: PlaceCategory;

  @ApiProperty({ example: -23.5240729 })
  latitude: number;

  @ApiProperty({ example: -46.7335302 })
  longitude: number;
}

export class PlaceConnectorDto {
  @ApiProperty({ example: 'Type 2' })
  label: string;

  @ApiProperty({ example: 22 })
  powerKw: number;

  @ApiProperty({ example: 2 })
  totalChargers: number;

  @ApiProperty({ example: 2 })
  availableChargers: number;
}

export class PlaceResultDto {
  @ApiProperty({ example: 'Enel' })
  name: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.ev_charging })
  category: PlaceCategory;

  @ApiProperty({ example: -23.5485132 })
  latitude: number;

  @ApiProperty({ example: -46.7359186 })
  longitude: number;

  @ApiProperty({ example: 'São Paulo, SP' })
  address: string;

  @ApiProperty({ example: 4.6 })
  rating: number;

  @ApiProperty({ type: Number, nullable: true, example: 22 })
  powerKw: number | null;

  @ApiProperty({ enum: PlaceStatus, example: PlaceStatus.available })
  status: PlaceStatus;

  @ApiProperty({ example: '24 horas' })
  openingHours: string;

  @ApiProperty({ type: [PlaceConnectorDto] })
  connectors: PlaceConnectorDto[];

  @ApiProperty({
    example: 1.71,
    description: 'Kilometers from the point that was searched.',
  })
  distanceKm: number;
}

export class ErrorMessageDto {
  @ApiProperty({ example: 'Informe o que você quer buscar.' })
  message: string;
}
