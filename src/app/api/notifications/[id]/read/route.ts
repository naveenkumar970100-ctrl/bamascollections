import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const { id } = await params;

    if (id === 'all' || id === 'mark-all-read') {
      let query: any = {};
      if (user && user.role === 'admin') {
        query = { recipientRole: 'admin' };
      } else if (user) {
        query = { $or: [{ recipient: user._id }, { recipientRole: 'customer' }] };
      }
      await Notification.updateMany(query, {
        $set: { isRead: true, readAt: new Date() },
      });
      return jsonResponse({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    return jsonResponse({ data: notification, message: 'Notification marked as read' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
