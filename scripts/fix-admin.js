import mongoose from "mongoose";
import User from "../models/User.js";

// Use the hardcoded URI from .env.local since env vars aren't loaded in scripts
await mongoose.connect("mongodb://localhost:27017/civic-issues");

// Check if admin already exists
const existingAdmin = await User.findOne({ email: "admin@test.com" });
if (existingAdmin) {
    console.log("Admin already exists, deleting...");
    await User.deleteOne({ email: "admin@test.com" });
}

const admin = new User({
    name: "Admin",
    email: "admin@test.com",
    password: "admin123", // IMPORTANT: plain text here
    role: "admin",
});

await admin.save();

console.log("Admin created correctly");
console.log("Email: admin@test.com");
console.log("Password: admin123");
process.exit();
