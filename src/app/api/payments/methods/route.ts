import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PaymentMethod } from '@/models/PaymentMethod';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const methods = await PaymentMethod.find().sort({ isActive: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: methods });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    if (body.isActive) {
      await PaymentMethod.updateMany({}, { isActive: false });
    }

    const method = await PaymentMethod.create({
      ...body,
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, data: method }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
