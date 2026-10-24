import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';
import { ErrorMessageDto, PlaceResultDto } from './place.dto';
import { PlacesService } from './places.service';
import {
  isLatitude,
  isLongitude,
  isPlaceCategory,
  readNumber,
} from './placeQuery';

@ApiTags('Places')
@Controller()
export class PlacesController {
  private readonly logger = new Logger(PlacesController.name);

  constructor(private readonly places: PlacesService) {}

  @Get('places')
  @ApiOperation({
    summary: 'List places in one category',
    description:
      'Returns places in the given category within 2 km, nearest first. Each place includes address, rating, status, opening hours, power, connectors, and distance. Coordinates more than 2 km from ARCA (−23.5358, −46.7454) are searched from that point.',
  })
  @ApiQuery({
    name: 'category',
    enum: PlaceCategory,
    example: PlaceCategory.coffee,
  })
  @ApiQuery({ name: 'latitude', example: -23.5358 })
  @ApiQuery({ name: 'longitude', example: -46.7454 })
  @ApiOkResponse({ type: PlaceResultDto, isArray: true })
  @ApiBadRequestResponse({
    type: ErrorMessageDto,
    description:
      'A missing category returns "Informe a categoria." An unknown category returns "Categoria desconhecida." A bad latitude returns "Informe a latitude." A bad longitude returns "Informe a longitude."',
  })
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
