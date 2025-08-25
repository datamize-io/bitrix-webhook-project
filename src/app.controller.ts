import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test/')
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Post('datamize/webhooks/')
  async webhookHandler(@Body() body: any, @Res() res: Response) {
    await this.appService.filterWebhookEvent(body);

    return res.status(200).send({ ok: true });
  }
}
