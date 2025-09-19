import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('MONGODB_URI:', process.env.MONGODB_URI);

import { connectDB } from '../lib/mongodb.js';
import Department from '../lib/models/Department.js';
import User from '../models/User.js';

const sampleDepartments = [
    {
        name: 'Public Works',
        description: 'Responsible for road maintenance, water supply, and public infrastructure',
        contactEmail: 'publicworks@city.gov',
        contactPhone: '+1-555-0101'
    },
    {
        name: 'Parks and Recreation',
        description: 'Manages public parks, recreational facilities, and community events',
        contactEmail: 'parks@city.gov',
        contactPhone: '+1-555-0102'
    },
    {
        name: 'Traffic Management',
        description: 'Handles traffic signals, parking enforcement, and road safety',
        contactEmail: 'traffic@city.gov',
        contactPhone: '+1-555-0103'
    },
    {
        name: 'Environmental Services',
        description: 'Waste management, recycling programs, and environmental protection',
        contactEmail: 'environment@city.gov',
        contactPhone: '+1-555-0104'
    },
    {
        name: 'Building & Planning',
        description: 'Building permits, zoning, and urban planning',
        contactEmail: 'planning@city.gov',
        contactPhone: '+1-555-0105'
    }
];

async function seedDepartments() {
    try {
        await connectDB();

        console.log('Seeding departments...');

        // Clear existing departments
        await Department.deleteMany({});

        // Insert sample departments
        await Department.insertMany(sampleDepartments);

        console.log('Sample departments created successfully!');

        // Show created departments
        const departments = await Department.find({});
        console.log('\\nCreated departments:');
        departments.forEach(dept => {
            console.log(`- ${dept.name}: ${dept.description}`);
        });

    } catch (error) {
        console.error('Error seeding departments:', error);
    } finally {
        process.exit(0);
    }
}

seedDepartments();