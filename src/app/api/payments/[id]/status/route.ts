import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const { status, notes } = await req.json();

    if (!['Completed', 'Pending', 'Failed', 'Refunded'].includes(status)) {
      return errorResponse('Invalid status. Must be Completed, Pending, Failed, or Refunded', 400);
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return errorResponse('Payment record not found', 404);
    }

    payment.status = status;
    if (notes) payment.notes = notes;
    if (status === 'Completed') {
      payment.verifiedByAdmin = true;
    }

    const updatedPayment = await payment.save();

    if (payment.order) {
      try {
        const order = await Order.findById(payment.order);
        if (order) {
          if (status === 'Completed') {
            order.isPaid = true;
            if (!order.paidAt) order.paidAt = new Date();
            if (order.status === 'Placed') order.status = 'Confirmed';
          } else if (status === 'Refunded' || status === 'Failed') {
            order.isPaid = false;
          }
          await order.save();
        }
      } catch {
        // Non-blocking
      }
    }

    return jsonResponse({
      data: updatedPayment,
      message: `Payment marked as ${status}`,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
