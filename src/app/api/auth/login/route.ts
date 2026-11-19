import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, jsonResponse, errorResponse } from '@/lib/auth';

const ensureAdminUser = async () => {
  try {
    const adminEmail = 'admin@bamas.com';
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    if (!adminUser) {
      await User.create({
        name: 'Bamas Admin',
        email: adminEmail,
        password: 'admin@123',
        role: 'admin',
        phone: '+91 98765 43210',
      });
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
    }
  } catch (err: any) {
    console.warn('Admin ensure notice:', err.message);
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, phone, identifier, password } = body;
    const loginIdentifier = (identifier || email || phone || '').trim();

    if (!loginIdentifier || !password) {
      return errorResponse('Please provide email/phone number and password', 400);
    }

    if (loginIdentifier.toLowerCase() === 'admin@bamas.com') {
      await ensureAdminUser();
    }

    const isEmail = loginIdentifier.includes('@');
    const user = isEmail
      ? await User.findOne({ email: loginIdentifier.toLowerCase() }).select('+password')
      : await User.findOne({
          $or: [
            { phone: loginIdentifier },
            { email: `${loginIdentifier.replace(/[^0-9]/g, '')}@phone.bamascollections.com` },
            { email: loginIdentifier.toLowerCase() },
          ],
        }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse('Invalid credentials. Please verify your email/phone and password', 401);
    }

    const token = generateToken(user._id.toString());
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || {},
      addresses: user.addresses || [],
      token,
      createdAt: user.createdAt,
    };

    return jsonResponse({
      data: userData,
      message: user.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back! Signed in successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
