const mongoose = require('mongoose');

// Define the Issue schema
const issueSchema = new mongoose.Schema({
    reportId: {
        type: String,
        unique: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for the issue'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the issue'],
        trim: true
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: undefined }
        },
        city: String,
        state: String,
        pincode: String
    },
    category: {
        type: String,
        required: [true, 'Please specify the issue category'],
        enum: [
            'roads-infrastructure',
            'street-lighting',
            'waste-management',
            'water-drainage',
            'parks-public-spaces',
            'traffic-signage',
            'public-health-safety',
            'other'
        ]
    },
    subcategory: {
        type: String,
        required: [true, 'Please specify the subcategory'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected', 'reopened', 'escalated'],
        default: 'pending'
    },
    images: [{
        url: String,
        publicId: String
    }],
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedDepartment: {
        type: String,
        enum: [
            'roads-infrastructure',
            'street-lighting',
            'waste-management',
            'water-drainage',
            'parks-public-spaces',
            'traffic-signage',
            'public-health-safety',
            'other'
        ],
        required: true
    },
    ward: {
        type: String,
        trim: true
    },
    zone: {
        type: String,
        trim: true
    },
    sla: {
        deadline: {
            type: Date,
            required: true
        }
    },
    dueTime: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add geospatial index
issueSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

async function testMongoConnection() {
    try {
        console.log('🔌 Connecting to MongoDB...');

        await mongoose.connect('mongodb://localhost:27017/civic-issues', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB successfully');

        // Test creating an issue with the exact data from the error log
        const testIssue = {
            title: 'light issue solving',
            description: 'there light issues near by last street.',
            location: {
                address: 'Anand, आणंद, Anand City Taluka, Anand, Gujarat, 388001, India',
                coordinates: {
                    type: 'Point',
                    coordinates: [72.952096, 22.547929] // [longitude, latitude]
                },
                city: 'आणंद',
                state: 'Gujarat',
                pincode: '388001'
            },
            category: 'street-lighting',
            subcategory: 'Light Not Working',
            priority: 'medium',
            images: [
                {
                    url: 'https://res.cloudinary.com/dtcpkfizb/image/upload/v1768717466/civic-issues/ewuadmq1jebs44psjji9.jpg',
                    publicId: ''
                }
            ],
            reportedBy: new mongoose.Types.ObjectId('6957985a16e5959ff3629ab8'),
            assignedDepartment: 'street-lighting',
            ward: 'Ward 17',
            zone: 'Ward 17',
            sla: {
                deadline: new Date('2026-01-21T06:24:36.234Z')
            },
            dueTime: new Date('2026-01-25T06:24:36.234Z'),
            status: 'pending'
        };

        console.log('\n🧪 Testing issue creation with exact data from error log...');
        console.log('Location data:', JSON.stringify(testIssue.location, null, 2));

        const issue = new Issue(testIssue);
        await issue.validate();
        console.log('✅ Validation passed');

        await issue.save();
        console.log('✅ Issue saved successfully');

        // Clean up - remove the test issue
        await Issue.deleteOne({ _id: issue._id });
        console.log('✅ Test issue cleaned up');

        console.log('\n🎉 All tests passed! The location format is correct.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        if (error.code) {
            console.error('MongoDB error code:', error.code);
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testMongoConnection();