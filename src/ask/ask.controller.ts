import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { AskService } from './ask.service';
import { isLatitude, isLongitude } from './placeQuery';

type AskBody = {
  text?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

@Controller()
export class AskController {
  private readonly logger = new Logger(AskController.name);

  constructor(private readonly askService: AskService) {}

  @Post('ask')
  @HttpCode(200)
  async ask(@Body() body: AskBody) {
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

