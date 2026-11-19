import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Inquiry from '@/models/Inquiry';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalInquiries,
      orders,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Inquiry.countDocuments(),
      Order.find({}).select('totalPrice createdAt status isPaid'),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email'),
      User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email phone createdAt'),
    ]);

    const totalRevenue = orders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const pendingOrders = orders.filter(
      (o) => o.status === 'Placed' || o.status === 'Confirmed'
    ).length;

    const now = new Date();
    const revenueByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = month.toLocaleString('default', { month: 'short' });

      const monthRevenue = orders
        .filter(
          (o) =>
            o.isPaid &&
            new Date(o.createdAt) >= month &&
            new Date(o.createdAt) < nextMonth
        )
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      revenueByMonth.push({ month: label, revenue: monthRevenue });
    }

    const statusBreakdown: Record<string, number> = {
      Placed: 0,
      Accepted: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      if (statusBreakdown[o.status] !== undefined) {
        statusBreakdown[o.status]++;
      }
    });

    return jsonResponse({
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalInquiries,
          totalRevenue: Math.round(totalRevenue),
          pendingOrders,
        },
        revenueByMonth,
        statusBreakdown,
        recentOrders,
        recentCustomers,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
