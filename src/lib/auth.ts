import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/User';
import connectDB from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'bamas_collections_jwt_secret_key_2026';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const verifyToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
};

export async function getAuthUser(req: NextRequest) {
  await connectDB();
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return null;
  }
  try {
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch {
    return null;
  }
}

export function jsonResponse(data: any, status = 200) {
  return Response.json(
    {
      success: status >= 200 && status < 300,
      ...data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400) {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}
