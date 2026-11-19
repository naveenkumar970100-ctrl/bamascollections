import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    let products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(10);
    if (!products || products.length === 0) {
      products = await Product.find().sort({ createdAt: -1 }).limit(10);
    }
    return jsonResponse({
      data: products,
      message: 'Featured sarees',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
