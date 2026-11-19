import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string; reviewId: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { productId, reviewId } = await params;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    product.reviews = product.reviews.filter((r: any) => r._id.toString() !== reviewId);
    product.numReviews = product.reviews.length;
    if (product.numReviews > 0) {
      const totalRating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0);
      product.rating = Number((totalRating / product.numReviews).toFixed(1));
    } else {
      product.rating = 5;
    }

    await product.save();
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
