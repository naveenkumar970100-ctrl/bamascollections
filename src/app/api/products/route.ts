import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const sort = searchParams.get('sort');

    const query: any = {};

    if (category && category !== 'All') {
      const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(escapedCategory, 'i') };
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { detail: { $regex: keyword, $options: 'i' } },
        { fabric: { $regex: keyword, $options: 'i' } },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'name-asc') sortOptions = { name: 1 };

    const products = await Product.find(query).sort(sortOptions);

    return jsonResponse({
      data: products,
      count: products.length,
      message: `Found ${products.length} product(s)`,
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
    const product = await Product.create(body);

    return jsonResponse({
      data: product,
      message: 'Product created successfully',
    }, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
