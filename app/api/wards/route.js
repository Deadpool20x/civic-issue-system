import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema({
    wardNumber: Number,
    wardId: { type: String, unique: true },
    wardName: String,
    zone: String,
});

const Ward = mongoose.models.Ward || mongoose.model('Ward', wardSchema);

export async function GET() {
    try {
        await connectDB();

        const wards = await Ward.find().sort({ wardNumber: 1 });

        const northZone = wards.filter(w => w.zone === 'North Zone');
        const southZone = wards.filter(w => w.zone === 'South Zone');

        return Response.json({
            northZone,
            southZone,
            all: wards
        });
    } catch (error) {
        console.error('Error fetching wards:', error);
        return Response.json({ error: 'Failed to fetch wards' }, { status: 500 });
    }
}
