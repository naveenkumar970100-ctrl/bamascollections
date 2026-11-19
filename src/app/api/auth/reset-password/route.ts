import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, newPassword, confirmPassword } = body;

    if (!email || !newPassword) {
      return errorResponse('Email and new password are required', 400);
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse('Passwords do not match', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return errorResponse('Account not found with this email', 404);
    }

    user.password = newPassword;
    await user.save();

    return jsonResponse({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
