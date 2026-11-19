import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Invalid or expired token', 401);
    }

    return jsonResponse({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || {},
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
      message: 'Token is valid',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
