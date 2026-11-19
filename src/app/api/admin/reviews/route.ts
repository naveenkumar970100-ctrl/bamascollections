import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const productsWithReviews = await Product.find(
      { 'reviews.0': { $exists: true } },
      'name slug image reviews'
    ).lean();

    const allReviews: any[] = [];
    productsWithReviews.forEach((p: any) => {
      (p.reviews || []).forEach((r: any) => {
        allReviews.push({
          ...r,
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          productImage: p.image,
        });
      });
    });

    allReviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({ success: true, data: allReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
