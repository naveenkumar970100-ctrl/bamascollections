import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');

    let query: any = { role: 'customer' };
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return jsonResponse({
      data: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        address: u.address,
        addresses: u.addresses,
        createdAt: u.createdAt,
      })),
      count: users.length,
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
    const { name, email, phone, password, role, address } = body;

    if (!name || (!email && !phone) || !password) {
      return errorResponse('Please provide customer name, password, and email or phone', 400);
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim() : '';

    const query: any[] = [];
    if (cleanEmail) query.push({ email: cleanEmail });
    if (cleanPhone) query.push({ phone: cleanPhone });

    if (query.length > 0) {
      const existing = await User.findOne({ $or: query });
      if (existing) {
        return errorResponse('A customer with this email or phone number already exists', 400);
      }
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@phone.bamascollections.com`,
      phone: cleanPhone,
      password,
      role: role || 'customer',
      address: address || {},
    });

    return jsonResponse(
      {
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          address: newUser.address,
          createdAt: newUser.createdAt,
        },
        message: 'User created successfully',
      },
      201
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
