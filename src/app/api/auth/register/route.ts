import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { generateToken, jsonResponse, errorResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, confirmPassword, phone } = body;

    if (!name || (!email && !phone) || !password) {
      return errorResponse('Please provide your name, password, and email or phone number', 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return errorResponse('Passwords do not match', 400);
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim() : '';

    const query: any[] = [];
    if (cleanEmail) query.push({ email: cleanEmail });
    if (cleanPhone) query.push({ phone: cleanPhone });

    if (query.length > 0) {
      const existingUser = await User.findOne({ $or: query });
      if (existingUser) {
        return errorResponse('An account with this email or phone number already exists', 400);
      }
    }

    const userEmail = cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@phone.bamascollections.com`;

    const user = await User.create({
      name: name.trim(),
      email: userEmail,
      password,
      phone: cleanPhone,
      authProvider: cleanEmail ? 'local' : 'phone',
      role: 'customer',
    });

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

    try {
      await Notification.create({
        recipientRole: 'admin',
        sender: user._id,
        senderName: user.name,
        title: 'New Customer Registered',
        message: `${user.name} (${cleanEmail || cleanPhone}) created an account via ${cleanEmail ? 'Email' : 'Phone'}.`,
        type: 'registration',
        targetUrl: '/admin',
      });
    } catch {
      // Non-blocking notification
    }

    return jsonResponse(
      {
        data: userData,
        message: 'Account successfully created! Welcome to Bamas Collections',
      },
      201
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
