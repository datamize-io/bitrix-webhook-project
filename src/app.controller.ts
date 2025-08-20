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

  @Post('webhooks/')
  async webhookHandler(@Body() body: any, @Res() res: Response) {
    console.log('📨 Evento recebido em webhookhandler:', body);
    return res.status(200).send({ ok: true });

    this.appService.filterWebhookEvent(body);
  }
}
