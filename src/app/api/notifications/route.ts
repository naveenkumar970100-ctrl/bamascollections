import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);

    let query: any = {};
    if (!user) {
      query.recipientRole = 'customer';
    } else if (user.role === 'admin') {
      query = {
        $or: [
          { recipientRole: 'admin' },
          { recipientRole: 'all' },
          { recipient: user._id },
        ],
      };
    } else {
      query = {
        $or: [
          { recipientRole: 'customer' },
          { recipientRole: 'all' },
          { recipient: user._id },
        ],
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return jsonResponse({
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const body = await req.json();
    const notification = await Notification.create({
      ...body,
      sender: user._id,
      senderName: user.name,
    });

    return jsonResponse({ data: notification, message: 'Notification created' }, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
