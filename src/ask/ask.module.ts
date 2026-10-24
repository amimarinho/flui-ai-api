import { Module } from '@nestjs/common';
import { AskController } from './ask.controller';
import { AskService } from './ask.service';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  controllers: [AskController, PlacesController],
  providers: [AskService, PlacesService],
})
export class AskModule {}
