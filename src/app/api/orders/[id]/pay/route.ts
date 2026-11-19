import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const body = await req.json();
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: body.id || `PAY_${Date.now()}`,
      status: body.status || 'COMPLETED',
      update_time: body.update_time || new Date().toISOString(),
      email_address: body.email_address || order.customerEmail,
      method: body.method || order.paymentMethod,
      upiId: body.upiId || '',
      paidAt: order.paidAt,
      screenshotUrl: body.screenshotUrl || '',
      utrNumber: body.utrNumber || '',
    };
    if (body.screenshotUrl) {
      order.paymentProofUrl = body.screenshotUrl;
    }
    if (order.status === 'Placed') {
      order.status = 'Confirmed';
    }

    const updatedOrder = await order.save();

    try {
      await Payment.create({
        order: updatedOrder._id,
        user: updatedOrder.user,
        transactionId: order.paymentResult.id,
        amount: updatedOrder.totalPrice,
        paymentMethod: updatedOrder.paymentMethod,
        upiId: order.paymentResult.upiId || '',
        status: 'Completed',
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        customerPhone: updatedOrder.customerPhone,
        paymentProofUrl: body.screenshotUrl || '',
        verifiedByAdmin: true,
        paidAt: order.paidAt,
      });
    } catch {
      // Non-blocking
    }

    return jsonResponse({
      data: updatedOrder,
      message: 'Order marked as paid successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
