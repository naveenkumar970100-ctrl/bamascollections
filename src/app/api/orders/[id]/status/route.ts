import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const { status, isPaid, isDelivered } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    if (status) order.status = status;
    if (typeof isPaid === 'boolean') {
      order.isPaid = isPaid;
      if (isPaid && !order.paidAt) order.paidAt = new Date();
    }
    if (typeof isDelivered === 'boolean') {
      order.isDelivered = isDelivered;
      if (isDelivered && !order.deliveredAt) order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    if (typeof isPaid === 'boolean') {
      try {
        await Payment.updateMany(
          { order: order._id },
          { $set: { status: isPaid ? 'Completed' : 'Pending' } }
        );
      } catch {
        // Non-blocking
      }
    }

    return jsonResponse({
      data: updatedOrder,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
