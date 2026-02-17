import { authMiddleware } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = authMiddleware(async (req) => {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'No file provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your-actual-cloud-name-here' ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your-cloudinary-cloud-name') {

            // Return mock response for development
            console.warn('Cloudinary not configured, returning mock upload response');
            return new Response(JSON.stringify({
                url: '/api/placeholder-image',
                publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await uploadImage(base64String);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(
            JSON.stringify({ error: 'Upload failed: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

export const DELETE = authMiddleware(async (req) => {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return new Response(
                JSON.stringify({ error: 'Public ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if this is a mock upload
        if (publicId.startsWith('mock_')) {
            console.log('Mock image deletion:', publicId);
            return new Response(
                JSON.stringify({ message: 'Mock image deleted successfully' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your-actual-cloud-name-here' ||
            process.env.CLOUDINARY_CLOUD_NAME === 'your-cloudinary-cloud-name') {

            console.warn('Cloudinary not configured, skipping actual deletion');
            return new Response(
                JSON.stringify({ message: 'Image deleted successfully (mock)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await deleteImage(publicId);

        return new Response(
            JSON.stringify({ message: 'Image deleted successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Delete error:', error);
        return new Response(
            JSON.stringify({ error: 'Delete failed: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});