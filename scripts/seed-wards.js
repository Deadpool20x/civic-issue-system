import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const wards = [
    { wardNumber: 1, wardId: 'ward-1', wardName: 'Ward 1', zone: 'North Zone' },
    { wardNumber: 2, wardId: 'ward-2', wardName: 'Ward 2', zone: 'North Zone' },
    { wardNumber: 3, wardId: 'ward-3', wardName: 'Ward 3', zone: 'North Zone' },
    { wardNumber: 4, wardId: 'ward-4', wardName: 'Ward 4', zone: 'North Zone' },
    { wardNumber: 5, wardId: 'ward-5', wardName: 'Ward 5', zone: 'North Zone' },
    { wardNumber: 6, wardId: 'ward-6', wardName: 'Ward 6', zone: 'North Zone' },
    { wardNumber: 7, wardId: 'ward-7', wardName: 'Ward 7', zone: 'North Zone' },
    { wardNumber: 8, wardId: 'ward-8', wardName: 'Ward 8', zone: 'North Zone' },
    { wardNumber: 9, wardId: 'ward-9', wardName: 'Ward 9', zone: 'South Zone' },
    { wardNumber: 10, wardId: 'ward-10', wardName: 'Ward 10', zone: 'South Zone' },
    { wardNumber: 11, wardId: 'ward-11', wardName: 'Ward 11', zone: 'South Zone' },
    { wardNumber: 12, wardId: 'ward-12', wardName: 'Ward 12', zone: 'South Zone' },
    { wardNumber: 13, wardId: 'ward-13', wardName: 'Ward 13', zone: 'South Zone' },
    { wardNumber: 14, wardId: 'ward-14', wardName: 'Ward 14', zone: 'South Zone' },
    { wardNumber: 15, wardId: 'ward-15', wardName: 'Ward 15', zone: 'South Zone' },
    { wardNumber: 16, wardId: 'ward-16', wardName: 'Ward 16', zone: 'South Zone' },
];

async function seedWards() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Connected to MongoDB');

        const wardSchema = new mongoose.Schema({
            wardNumber: Number,
            wardId: { type: String, unique: true },
            wardName: String,
            zone: String,
        });

        const Ward = mongoose.models.Ward || mongoose.model('Ward', wardSchema);

        console.log('🌱 Seeding wards...');

        for (const ward of wards) {
            await Ward.findOneAndUpdate(
                { wardId: ward.wardId },
                ward,
                { upsert: true, new: true }
            );
            console.log(`✅ ${ward.wardName} (${ward.zone})`);
        }

        console.log('\n✅ Wards seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding wards:', error);
        process.exit(1);
    }
}

seedWards();
