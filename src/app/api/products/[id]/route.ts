import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase() });
    }

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({ data: product });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      message: 'Product deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
