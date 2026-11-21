import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    let query: any = {};
    if (user && user._id) {
      if (email) {
        query = {
          $or: [
            { user: user._id },
            { email: email.trim().toLowerCase() },
          ],
        };
      } else {
        query.user = user._id;
      }
    } else if (email) {
      query.email = email.trim().toLowerCase();
    } else {
      return jsonResponse({ data: [], count: 0 });
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

