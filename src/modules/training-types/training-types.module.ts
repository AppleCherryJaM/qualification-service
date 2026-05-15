import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingTypesService } from './training-types.service';
import { TrainingTypesController } from './training-types.controller';
import { TrainingType } from './entities/TrainingType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType])],
  providers: [TrainingTypesService],
  controllers: [TrainingTypesController],
  exports: [TrainingTypesService],
})
export class TrainingTypesModule {}
