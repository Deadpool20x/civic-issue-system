import mongoose from 'mongoose';
import User from './models/User.js';

const accounts = [
    { email: 'admin@civicpulse.in', name: 'Admin', role: 'SYSTEM_ADMIN' },
    { email: 'commissioner@civicpulse.in', name: 'Commissioner', role: 'MUNICIPAL_COMMISSIONER' },
    { email: 'roads.manager@civicpulse.in', name: 'Roads Manager', role: 'DEPARTMENT_MANAGER', departmentId: 'roads' },
    { email: 'officer.w3.roads@civicpulse.in', name: 'Officer', role: 'FIELD_OFFICER', wardId: 'ward-3', departmentId: 'roads' }
];

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        for (const acc of accounts) {
            let user = await User.findOne({ email: acc.email });
            if (!user) user = new User(acc);
            else Object.assign(user, acc);
            user.password = 'Admin@123';
            await user.save();
            console.log('Processed: ' + acc.email);
        }
    } catch (e) { console.error(e); }
    finally { process.exit(0); }
}
run();
