import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Payment from '@/models/Payment';
import Notification from '@/models/Notification';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse('Not authorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (user.role !== 'admin') {
      query.user = user._id;
    } else if (status && status !== 'All') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return jsonResponse({
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const body = await req.json();

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      isPaid,
      paymentResult,
      totalPrice: clientTotalPrice,
      email: clientEmail,
      phone: clientPhone,
      name: clientName,
    } = body;

    if (!orderItems || orderItems.length === 0) {
      return errorResponse('No order items supplied', 400);
    }

    const normShipping = {
      fullName:
        (shippingAddress && (shippingAddress.fullName || shippingAddress.name)) ||
        clientName ||
        (user && user.name) ||
        'Valued Patron',
      phone:
        (shippingAddress && (shippingAddress.phone || shippingAddress.mobile)) ||
        clientPhone ||
        (user && user.phone) ||
        '9876543210',
      street: (shippingAddress && shippingAddress.street) || 'Main Street, Jubilee Hills',
      city: (shippingAddress && shippingAddress.city) || 'Hyderabad',
      state: (shippingAddress && shippingAddress.state) || 'Telangana',
      postalCode:
        (shippingAddress && (shippingAddress.postalCode || shippingAddress.pincode)) || '500033',
      country: (shippingAddress && shippingAddress.country) || 'India',
    };

    const customerEmail =
      clientEmail ||
      (shippingAddress && shippingAddress.email) ||
      (user && user.email) ||
      `${normShipping.phone.replace(/[^0-9]/g, '') || 'patron'}@bamascollections.com`;

    let userId = user ? user._id : null;
    if (!userId && customerEmail) {
      const existing = await User.findOne({ email: customerEmail.toLowerCase() });
      if (existing) {
        userId = existing._id;
      }
    }

    const normItems = orderItems.map((item: any) => ({
      product: item.product || item.id || item._id || item.slug || 'saree',
      name: item.name || 'Bamas Heritage Saree',
      image: item.image || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity || item.qty) || 1,
    }));

    const itemsPrice = normItems.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 5000 ? 0 : 250;
    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const totalPrice = clientTotalPrice ? Number(clientTotalPrice) : itemsPrice + shippingPrice + taxPrice;

    const orderPaid = isPaid === true;
    const orderStatus = body.status || 'Placed';

    const order = await Order.create({
      user: userId,
      customerName: normShipping.fullName,
      customerEmail,
      customerPhone: normShipping.phone,
      orderItems: normItems,
      shippingAddress: normShipping,
      paymentMethod: paymentMethod || 'UPI / QR Code',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: orderPaid,
      paidAt: orderPaid ? (paymentResult?.paidAt ? new Date(paymentResult.paidAt) : new Date()) : undefined,
      paymentResult: paymentResult || {
        id: `PAY_${Date.now()}`,
        status: orderPaid ? 'COMPLETED' : 'PENDING',
        method: paymentMethod || 'UPI / QR Code',
        paidAt: orderPaid ? new Date() : undefined,
      },
      status: orderStatus,
    });

    if (orderPaid) {
      try {
        await Payment.create({
          order: order._id,
          user: userId,
          transactionId: (paymentResult && paymentResult.id) || `TXN_${Date.now()}`,
          amount: totalPrice,
          paymentMethod: paymentMethod || 'UPI / QR Code',
          upiId: (paymentResult && (paymentResult.upiId || paymentResult.vpa)) || '',
          status: 'Completed',
          customerName: normShipping.fullName,
          customerEmail,
          customerPhone: normShipping.phone,
          verifiedByAdmin: true,
          paidAt: order.paidAt || new Date(),
        });
      } catch {
        // Non-blocking
      }
    }

    try {
      await Notification.create({
        recipientRole: 'admin',
        sender: userId,
        senderName: normShipping.fullName,
        title: `New Order Placed: #${order._id.toString().slice(-6).toUpperCase()}`,
        message: `${normShipping.fullName} placed an order for ₹${totalPrice.toLocaleString('en-IN')}.`,
        type: 'order',
        targetUrl: `/admin`,
      });
    } catch {
      // Non-blocking
    }

    return jsonResponse(
      {
        data: order,
        message: 'Order created successfully',
      },
      201
    );
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
