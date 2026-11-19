import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const { status, replyText } = await req.json();

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return errorResponse('Inquiry not found', 404);
    }

    if (status) inquiry.status = status;
    if (replyText) {
      inquiry.messages.push({
        senderRole: 'admin',
        senderId: user._id,
        senderName: user.name || 'Bamas Atelier Concierge',
        text: replyText.trim(),
        createdAt: new Date(),
      });
      inquiry.status = 'Answered';
    }

    const updated = await inquiry.save();
    return jsonResponse({ data: updated, message: 'Inquiry updated' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
