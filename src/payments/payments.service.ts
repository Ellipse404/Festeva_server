import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * Create Cashfree Order & reserve event seats for 10 minutes
   */
  async createOrder(dto: CreateOrderDto, userId?: string) {
    const event = await this.eventRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const availableSeats = event.availableSeats ?? 100;
    if (availableSeats < dto.ticketQuantity) {
      throw new BadRequestException(
        `Only ${availableSeats} seat(s) remaining for this event!`,
      );
    }

    const ticketPrice = Number(event.ticketPrice) || 0;
    const totalAmount = ticketPrice * dto.ticketQuantity;

    const cfOrderId = `cf_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const envMode = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();

    let paymentSessionId = `session_simulated_${cfOrderId}`;
    let isRealGateway = false;

    // Call Cashfree PG REST API if credentials exist
    if (appId && secretKey && !appId.includes('YOUR_')) {
      try {
        const baseUrl =
          envMode === 'PRODUCTION'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const payload = {
          order_id: cfOrderId,
          order_amount: totalAmount > 0 ? totalAmount : 1, // Minimum 1 for sandbox
          order_currency: 'INR',
          customer_details: {
            customer_id: userId || `cust_${Date.now()}`,
            customer_name: dto.customerName || 'Festeva Guest',
            customer_email: dto.customerEmail || 'guest@festeva.com',
            customer_phone: dto.customerPhone || '9876543210',
          },
          order_meta: {
            return_url: `http://localhost:5173/payment-return?order_id=${cfOrderId}`,
          },
        };

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'x-client-id': appId.trim(),
            'x-client-secret': secretKey.trim(),
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok && data?.payment_session_id) {
          paymentSessionId = data.payment_session_id;
          isRealGateway = true;
          console.log(`✅ [Cashfree API] Order created: ${cfOrderId}`);
        } else {
          console.warn('⚠️ Cashfree API Notice:', data?.message || data);
        }
      } catch (e: any) {
        console.error('❌ Cashfree Order Exception:', e?.message || e);
      }
    }

    // Save pending Order record in PostgreSQL with 10-minute expiry lock
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newOrder = this.orderRepository.create({
      userId: userId || dto.userId,
      eventId: dto.eventId,
      cfOrderId,
      paymentSessionId,
      amount: totalAmount,
      currency: 'INR',
      ticketQuantity: dto.ticketQuantity,
      status: 'PENDING',
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      expiresAt,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    return {
      success: true,
      orderId: savedOrder.id,
      cfOrderId: savedOrder.cfOrderId,
      paymentSessionId: savedOrder.paymentSessionId,
      amount: totalAmount,
      ticketQuantity: dto.ticketQuantity,
      isRealGateway,
      expiresAt,
    };
  }

  /**
   * Verify Payment Status & Generate QR Code Tickets
   */
  async verifyPayment(cfOrderId: string, userId?: string) {
    const order = await this.orderRepository.findOne({
      where: { cfOrderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'PAID') {
      const existingTickets = await this.ticketRepository.find({
        where: { orderId: order.id },
      });
      return {
        success: true,
        order,
        tickets: existingTickets,
        message: 'Order already verified and paid.',
      };
    }

    // Query Cashfree Server API
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const envMode = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
    let isPaid = false;
    let paymentId = `pay_${Date.now()}`;
    let paymentMethod = 'UPI';

    if (appId && secretKey && !appId.includes('YOUR_')) {
      try {
        const url =
          envMode === 'PRODUCTION'
            ? `https://api.cashfree.com/pg/orders/${cfOrderId}`
            : `https://sandbox.cashfree.com/pg/orders/${cfOrderId}`;

        const res = await fetch(url, {
          headers: {
            'x-client-id': appId.trim(),
            'x-client-secret': secretKey.trim(),
            'x-api-version': '2023-08-01',
          },
        });

        const data = await res.json();
        if (res.ok && data?.order_status === 'PAID') {
          isPaid = true;
          paymentId = data?.cf_order_id || cfOrderId;
        }
      } catch (e: any) {
        console.error('❌ Cashfree Verification Error:', e?.message || e);
      }
    } else {
      // Simulation / Test mode fallback
      isPaid = true;
    }

    if (!isPaid) {
      order.status = 'FAILED';
      await this.orderRepository.save(order);
      throw new BadRequestException('Payment was not completed or failed.');
    }

    // 1. Mark Order as PAID
    order.status = 'PAID';
    order.paymentId = paymentId;
    order.paymentMethod = paymentMethod;
    if (userId && !order.userId) order.userId = userId;
    await this.orderRepository.save(order);

    // 2. Decrement Event Available Seats in DB
    const event = await this.eventRepository.findOne({
      where: { id: order.eventId },
    });

    if (event) {
      event.availableSeats = Math.max(
        0,
        (event.availableSeats || 0) - order.ticketQuantity,
      );
      await this.eventRepository.save(event);
    }

    // 3. Generate QR Code Tickets for each purchased seat
    const tickets: Ticket[] = [];
    for (let i = 0; i < order.ticketQuantity; i++) {
      const ticketCode = `FESTEVA-${order.eventId.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${i + 1}`;

      const qrPayload = JSON.stringify({
        t: ticketCode,
        e: event?.title || 'Festeva Event',
        o: order.id,
        u: order.userId || 'Guest',
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      const newTicket = this.ticketRepository.create({
        orderId: order.id,
        userId: order.userId,
        eventId: order.eventId,
        ticketCode,
        qrCodeDataUrl,
        status: 'VALID',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      });

      const savedTicket = await this.ticketRepository.save(newTicket);
      tickets.push(savedTicket);
    }

    console.log(
      `🎉 [Festeva Tickets Issued] Generated ${tickets.length} QR Ticket(s) for Order: ${order.cfOrderId}`,
    );

    return {
      success: true,
      order,
      tickets,
      message: 'Payment completed & tickets generated successfully!',
    };
  }

  /**
   * Cashfree Webhook Endpoint Handler
   */
  async handleWebhook(body: any) {
    console.log('🔔 [Cashfree Webhook Received]:', body?.type || body);
    if (body?.type === 'ORDER_PAID' && body?.data?.order?.order_id) {
      const cfOrderId = body.data.order.order_id;
      try {
        await this.verifyPayment(cfOrderId);
      } catch (e) {
        console.warn('Webhook verification notice:', e);
      }
    }
    return { status: 'OK' };
  }

  /**
   * Fetch all tickets owned by logged-in user
   */
  async getUserTickets(userId: string) {
    const tickets = await this.ticketRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Populate event details for each ticket
    const enrichedTickets = await Promise.all(
      tickets.map(async (t) => {
        const event = await this.eventRepository.findOne({
          where: { id: t.eventId },
        });
        return {
          ...t,
          event: event || {
            title: 'Festeva Event',
            date: new Date().toISOString(),
            locationName: 'Venue Location',
          },
        };
      }),
    );

    return enrichedTickets;
  }
}
