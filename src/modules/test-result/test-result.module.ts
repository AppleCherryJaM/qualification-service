import { Module } from '@nestjs/common';
import { TestResultController } from './test-result.controller';
import { TestResultService } from './test-result.service';

@Module({
  controllers: [TestResultController],
  providers: [TestResultService],
})
export class TestResultModule {}
