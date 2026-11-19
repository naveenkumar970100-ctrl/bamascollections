import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, avatar } = body;

    if (!email) {
      return errorResponse('Google authentication requires a verified email', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: avatar || '',
        authProvider: 'google',
        role: 'customer',
      });
    }

    const token = generateToken(user._id.toString());

    return jsonResponse({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || {},
        addresses: user.addresses || [],
        token,
        createdAt: user.createdAt,
      },
      message: 'Signed in with Google successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
