import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { jsonResponse, errorResponse } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddgjubbbx',
  api_key: process.env.CLOUDINARY_API_KEY || '741746916456468',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cwCBl397PPnJZ6I561wwyd5QsIo',
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'bamascollections/products';

    if (!file) {
      return errorResponse('Please attach an image file to upload', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'image',
    });

    return jsonResponse({
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      message: 'Image uploaded to Cloudinary successfully',
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return errorResponse(`Upload error: ${error.message}`, 500);
  }
}
