import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PaymentMethod } from '@/models/PaymentMethod';
import { SiteConfig } from '@/models/SiteConfig';

export async function GET() {
  try {
    await connectDB();
    let method = await PaymentMethod.findOne({ isActive: true }).lean();

    if (!method) {
      method = await PaymentMethod.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!method) {
      const config = await SiteConfig.findOne().lean();
      const upiId = config?.upiId || 'bamascollections@okhdfcbank';
      const payeeName = config?.payeeName || 'Bamas Collections Atelier';
      const qrCodeUrl = config?.qrCodeUrl || '';

      return NextResponse.json({
        success: true,
        data: {
          title: 'Primary UPI Gateway',
          upiId,
          payeeName,
          bankName: 'HDFC Bank',
          qrCodeUrl,
          description: 'Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM)',
          isActive: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: method });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
