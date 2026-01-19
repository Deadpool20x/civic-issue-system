import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const departments = [
  {
    name: 'roads-infrastructure',
    description: 'Handles road repairs, potholes, and infrastructure',
    contactEmail: 'roads@municipal.gov',
    categories: ['roads-infrastructure']
  },
  {
    name: 'water-drainage',
    description: 'Water supply, leaks, and water quality',
    contactEmail: 'water@municipal.gov',
    categories: ['water-drainage']
  },
  {
    name: 'street-lighting',
    description: 'Power supply and street lights',
    contactEmail: 'electricity@municipal.gov',
    categories: ['street-lighting']
  },
  {
    name: 'waste-management',
    description: 'Garbage collection and waste management',
    contactEmail: 'sanitation@municipal.gov',
    categories: ['waste-management']
  },
  {
    name: 'traffic-signage',
    description: 'Public transport and traffic',
    contactEmail: 'transport@municipal.gov',
    categories: ['traffic-signage']
  },
  {
    name: 'parks-public-spaces',
    description: 'Parks and recreational facilities',
    contactEmail: 'parks@municipal.gov',
    categories: ['parks-public-spaces']
  },
  {
    name: 'public-health-safety',
    description: 'Public health and safety issues',
    contactEmail: 'health@municipal.gov',
    categories: ['public-health-safety']
  },
  {
    name: 'general-administration',
    description: 'Other issues and general administration',
    contactEmail: 'admin@municipal.gov',
    categories: ['other']
  }
];

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Import Department model - need to register the schema first
    const departmentSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      contactEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      contactPhone: {
        type: String,
        trim: true,
      },
      headOfDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      categories: [{
        type: String,
        trim: true,
      }],
      isActive: {
        type: Boolean,
        default: true,
      },
      staffCount: {
        type: Number,
        default: 0,
      },
    }, {
      timestamps: true,
    });

    // Register the model
    const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

    console.log('🌱 Seeding departments...');

    for (const dept of departments) {
      const result = await Department.findOneAndUpdate(
        { name: dept.name },
        { ...dept, isActive: true },
        { upsert: true, new: true }
      );
      console.log(`✅ ${dept.name} - ${result.contactEmail}`);
    }

    console.log('\n✅ Departments seeded successfully');
    console.log('📊 Total departments:', departments.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    process.exit(1);
  }
}

seedDepartments();
