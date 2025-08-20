import { Module } from '@nestjs/common';
import { HelperService } from './helper.service.js';

@Module({
  providers: [HelperService],
})
export class HelperModule {}
