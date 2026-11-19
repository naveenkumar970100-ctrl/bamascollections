import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');

    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (keyword) {
      filter.$or = [
        { transactionId: { $regex: keyword, $options: 'i' } },
        { customerName: { $regex: keyword, $options: 'i' } },
        { customerEmail: { $regex: keyword, $options: 'i' } },
        { upiId: { $regex: keyword, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('order', 'orderItems shippingAddress status totalPrice createdAt isPaid')
      .sort({ createdAt: -1 });

    const all = await Payment.find({});
    const totalVolume = all
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const completedCount = all.filter((p) => p.status === 'Completed').length;
    const pendingCount = all.filter((p) => p.status === 'Pending').length;
    const refundedCount = all.filter((p) => p.status === 'Refunded').length;

    return jsonResponse({
      data: payments,
      metrics: {
        totalVolume,
        totalTransactions: all.length,
        completedCount,
        pendingCount,
        refundedCount,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const payment = await Payment.create(body);
    return jsonResponse({ data: payment, message: 'Payment recorded' }, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
