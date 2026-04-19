import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('mensal')
  getMensal(
    @Query('ano', ParseIntPipe) ano: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.dashboardService.getMensal(ano, mes);
  }
}