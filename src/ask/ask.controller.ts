import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AskService } from './ask.service';
import { isLatitude, isLongitude } from './placeQuery';
import { AskBodyDto, AskedPlaceDto, ErrorMessageDto } from './place.dto';

@ApiTags('Ask')
@Controller()
export class AskController {
  private readonly logger = new Logger(AskController.name);

  constructor(private readonly askService: AskService) {}

  @Post('ask')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Find places from a question',
    description:
      'Sends the text to Gemini. A question about electric-car charging, coffee, or a gas station returns the nearest matches. Any other question returns an empty list.',
  })
  @ApiOkResponse({ type: AskedPlaceDto, isArray: true })
  @ApiBadRequestResponse({
    type: ErrorMessageDto,
    description:
      'Empty text returns "Informe o que você quer buscar." A latitude outside -90 to 90 returns "Informe a latitude." A longitude outside -180 to 180 returns "Informe a longitude."',
  })
  @ApiBadGatewayResponse({
    type: ErrorMessageDto,
    description:
      'Gemini or the place lookup failed. The message is "Não consegui consultar os lugares."',
  })
  async ask(@Body() body: AskBodyDto) {
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    this.logger.debug(
      `ask ${JSON.stringify(text)} @ ${String(body.latitude)},${String(body.longitude)}`,
    );
    if (!text) {
      throw new HttpException(
        { message: 'Informe o que você quer buscar.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isLatitude(body.latitude)) {
      throw new HttpException(
        { message: 'Informe a latitude.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isLongitude(body.longitude)) {
      throw new HttpException(
        { message: 'Informe a longitude.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const places = await this.askService.ask(
        text,
        body.latitude,
        body.longitude,
      );
      this.logger.debug(`ask returned ${places.length}`);
      return places;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        { message: 'Não consegui consultar os lugares.' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
