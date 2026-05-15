import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Internship } from './entities/Internship.entity';
import { InternshipsService } from './internships.service';
import { InternshipsController } from './internships.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Internship])],
  providers: [InternshipsService],
  controllers: [InternshipsController],
  exports: [InternshipsService],
})
export class InternshipsModule {}
