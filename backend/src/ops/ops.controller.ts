import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OpsService, OrderStatus } from './ops.service'

@Controller('/api/ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  private assertManager(req: any) {
    if (req?.user?.role !== 'manager') {
      throw new NotFoundException('Not found')
    }
  }

  // ----- Orders -----

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  listOrders(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    this.assertManager(req)
    return this.opsService.listOrders({ status, q, dateFrom, dateTo })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/status')
  setOrderStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertManager(req)
    const status = body?.status as OrderStatus
    const warehouse = (body?.warehouse as string) || 'MSK'
    return this.opsService.setOrderStatus(id, status, warehouse)
  }

  // ----- Comments -----

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/comments')
  listComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertManager(req)
    return this.opsService.listComments(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/comments')
  addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertManager(req)
    return this.opsService.addComment(id, req.user.id, body?.text)
  }

  // ----- Warehouses & Stocks -----

  @UseGuards(JwtAuthGuard)
  @Get('warehouses')
  listWarehouses(@Req() req: any) {
    this.assertManager(req)
    return this.opsService.listWarehouses()
  }

  @UseGuards(JwtAuthGuard)
  @Post('warehouses')
  upsertWarehouse(@Req() req: any, @Body() body: any) {
    this.assertManager(req)
    return this.opsService.upsertWarehouse(body?.code, body?.name)
  }

  @UseGuards(JwtAuthGuard)
  @Get('stocks')
  listStocks(@Req() req: any, @Query('warehouse') warehouse?: string) {
    this.assertManager(req)
    return this.opsService.listStocks(warehouse || 'MSK')
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/receive')
  receive(@Req() req: any, @Body() body: any) {
    this.assertManager(req)
    return this.opsService.receiveStock(body?.warehouse || 'MSK', Number(body?.productId), Number(body?.qty), body?.note)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/issue')
  issue(@Req() req: any, @Body() body: any) {
    this.assertManager(req)
    return this.opsService.issueStock(body?.warehouse || 'MSK', Number(body?.productId), Number(body?.qty), body?.note)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/adjust')
  adjust(@Req() req: any, @Body() body: any) {
    this.assertManager(req)
    return this.opsService.adjustStock(body?.warehouse || 'MSK', Number(body?.productId), Number(body?.qty), body?.note)
  }

  // ----- Production -----

  @UseGuards(JwtAuthGuard)
  @Get('production')
  listProduction(@Req() req: any, @Query('status') status?: string) {
    this.assertManager(req)
    return this.opsService.listProduction(status)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('production/:id/status')
  setProductionStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertManager(req)
    return this.opsService.setProductionStatus(id, body?.status)
  }

  @UseGuards(JwtAuthGuard)
  @Post('production/:id/move-to-stock')
  moveToStock(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertManager(req)
    return this.opsService.moveProductionToStock(id, body?.warehouse || 'MSK')
  }
}
