import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BriefingsService } from './briefings.service';
import { BriefingsController } from './briefings.controller';
import { Briefing } from './entities/Briefing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Briefing])],
  providers: [BriefingsService],
  controllers: [BriefingsController],
  exports: [BriefingsService],
})
export class BriefingsModule {}
