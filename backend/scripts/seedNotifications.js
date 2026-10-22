import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

dotenv.config();

async function seedNotifications() {
  try {
    await connectDB();
    console.log('📡 Connected to MongoDB Atlas. Seeding sample notifications...');

    // Clear old test notifications
    await Notification.deleteMany({});

    const admin = await User.findOne({ email: 'admin@bamas.com' });
    const customer = await User.findOne({ email: 'bama@bamas.com' });

    await Notification.create([
      {
        recipientRole: 'admin',
        senderName: 'Priya Sharma',
        title: 'New Saree Inquiry: The Emerald Edit',
        message: 'Priya Sharma (priya@example.com · +91 99887 76655): "I adore The Emerald Edit saree! Can this be paired with a contrast magenta unstitched blouse piece?"',
        type: 'inquiry',
        targetUrl: '/admin',
        isRead: false,
      },
      {
        recipientRole: 'admin',
        sender: customer ? customer._id : null,
        senderName: customer ? customer.name : 'Bama Customer',
        title: 'New Order Placed: ₹17,500',
        message: 'Bama Customer placed order #ORD-9821 for 1 saree (Royal Sapphire Silk) to 45 Silk Loom Residency, Bengaluru.',
        type: 'order',
        targetUrl: '/admin',
        isRead: false,
      },
      {
        recipientRole: 'admin',
        senderName: 'Anita Rao',
        title: 'New Customer Registered',
        message: 'Anita Rao (anita.rao@gmail.com) created a new account via Google OAuth.',
        type: 'registration',
        targetUrl: '/admin',
        isRead: false,
      },
      {
        recipientRole: 'customer',
        recipient: customer ? customer._id : null,
        sender: admin ? admin._id : null,
        senderName: 'Bamas Admin',
        title: 'Order Status: Shipped via Priority Air',
        message: 'Your artisanal Royal Sapphire Silk saree has been carefully packaged with raw silk protective sleeves and dispatched.',
        type: 'status_update',
        targetUrl: '/products',
        isRead: false,
      },
      {
        recipientRole: 'customer',
        recipient: null, // Broadcast to all customers
        sender: admin ? admin._id : null,
        senderName: 'Bamas Styling Concierge',
        title: '✨ Festive Silk Collection Now Live',
        message: 'Discover our newest handloom Kanjivaram & Banarasi bridal drapes, woven with certified pure mulberry silk and antique gold zari.',
        type: 'broadcast',
        targetUrl: '/products',
        isRead: false,
      },
    ]);

    console.log('✅ Seeded 5 bidirectional notifications (User to Admin & Admin to User) in MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Notification seed error:', err);
    process.exit(1);
  }
}

seedNotifications();
