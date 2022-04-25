import { Controller, Get, Logger, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private logger:Logger = new Logger('AppController');

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('info')
  async getResumenEmployee(
    @Session() session,
    @Res() res
  ){
    try {
      let param = {}
    } catch (error) {
      this.logger.error(error);
    }
  }
}
