import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('User profile not found', 404);
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
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const body = await req.json();
    const dbUser = await User.findById(user._id).select('+password');
    if (!dbUser) {
      return errorResponse('User not found', 404);
    }

    dbUser.name = body.name || dbUser.name;
    dbUser.phone = body.phone !== undefined ? body.phone : dbUser.phone;

    if (body.address) {
      dbUser.address = {
        ...dbUser.address,
        ...body.address,
      };
    }

    if (body.addresses && Array.isArray(body.addresses)) {
      dbUser.addresses = body.addresses;
    }

    if (body.password) {
      dbUser.password = body.password;
    }

    const updatedUser = await dbUser.save();

    return jsonResponse({
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        address: updatedUser.address || {},
        addresses: updatedUser.addresses || [],
        createdAt: updatedUser.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
