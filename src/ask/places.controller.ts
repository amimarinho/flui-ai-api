import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  isLatitude,
  isLongitude,
  isPlaceCategory,
  readNumber,
} from './placeQuery';

@Controller()
export class PlacesController {
  private readonly logger = new Logger(PlacesController.name);

  constructor(private readonly places: PlacesService) {}

  @Get('places')
  async list(
    @Query('category') category: unknown,
    @Query('latitude') latitude: unknown,
    @Query('longitude') longitude: unknown,
  ) {
    const lat = readNumber(latitude);
    const lng = readNumber(longitude);
    this.logger.debug(
      `places ${String(category)} @ ${String(latitude)},${String(longitude)}`,
    );

    if (category === undefined || category === '') {
      throw new HttpException(
        { message: 'Informe a categoria.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isPlaceCategory(category)) {
      throw new HttpException(
        { message: 'Categoria desconhecida.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isLatitude(lat)) {
      throw new HttpException(
        { message: 'Informe a latitude.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isLongitude(lng)) {
      throw new HttpException(
        { message: 'Informe a longitude.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.places.search(category, lat, lng);
  }
}
