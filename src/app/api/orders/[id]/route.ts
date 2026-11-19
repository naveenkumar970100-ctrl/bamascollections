import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).populate('user', 'name email phone');
    if (!order) {
      return errorResponse('Order not found', 404);
    }
    return jsonResponse({ data: order });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const body = await req.json();

    const order = await Order.findByIdAndUpdate(id, body, { new: true });
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return jsonResponse({ data: order, message: 'Order updated' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return jsonResponse({ message: 'Order deleted successfully' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
