import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import Notification from '@/models/Notification';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (!user || user.role !== 'admin') {
      if (!user) return errorResponse('Not authorized', 401);
      query.user = user._id;
    } else if (status && status !== 'All') {
      query.status = status;
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });

    return jsonResponse({
      data: inquiries,
      count: inquiries.length,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const body = await req.json();

    const { name, email, phone, subject, message, sareeInterest } = body;
    if (!name || !email || !message) {
      return errorResponse('Name, email, and message are required', 400);
    }

    const inquiry = await Inquiry.create({
      user: user ? user._id : null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject || 'General Saree Inquiry',
      message: message.trim(),
      sareeInterest: sareeInterest || '',
      status: 'New',
      messages: [
        {
          senderRole: 'user',
          senderId: user ? user._id : null,
          senderName: name.trim(),
          text: message.trim(),
          createdAt: new Date(),
        },
      ],
    });

    try {
      await Notification.create({
        recipientRole: 'admin',
        sender: user ? user._id : null,
        senderName: name.trim(),
        title: `New Inquiry from ${name.trim()}`,
        message: message.trim().slice(0, 100),
        type: 'inquiry',
        targetUrl: '/admin',
      });
    } catch {
      // Non-blocking
    }

    return jsonResponse(
      {
        data: inquiry,
        message: 'Inquiry submitted successfully! Our styling atelier will contact you shortly.',
      },
      201
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
