import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({});
    }
    return jsonResponse({ data: config });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return errorResponse('Not authorized as admin', 403);
    }

    const body = await req.json();
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create(body);
    } else {
      config = await SiteConfig.findByIdAndUpdate(config._id, body, { new: true });
    }

    return jsonResponse({ data: config, message: 'Site configuration updated' });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
