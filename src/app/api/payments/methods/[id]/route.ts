import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PaymentMethod } from '@/models/PaymentMethod';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.isActive) {
      await PaymentMethod.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const method = await PaymentMethod.findByIdAndUpdate(id, body, { new: true });
    if (!method) {
      return NextResponse.json({ success: false, message: 'Payment method not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: method });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await PaymentMethod.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
