import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import * as jwt from 'jsonwebtoken';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  async createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    let targetUserId = dto.userId;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
      } catch (e) {
        // ignore decode error
      }
    }

    return this.paymentsService.createOrder(dto, targetUserId);
  }

  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@Request() req: any, @Body() dto: VerifyPaymentDto) {
    let targetUserId = dto.userId;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
      } catch (e) {
        // ignore decode error
      }
    }

    return this.paymentsService.verifyPayment(dto.cfOrderId, targetUserId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }

  @Get('my-tickets')
  async getMyTickets(@Request() req: any) {
    let targetUserId = '';

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded?.sub) targetUserId = decoded.sub;
      } catch (e) {
        // ignore decode error
      }
    }

    return this.paymentsService.getUserTickets(targetUserId);
  }
}
