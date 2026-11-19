import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Not authorized', 401);
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    return jsonResponse({
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
