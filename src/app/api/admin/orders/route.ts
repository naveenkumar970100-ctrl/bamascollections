import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      // Return empty array or 403
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
