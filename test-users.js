// Quick test to check users in database
import dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

import mongoose from 'mongoose'

// Define User schema inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  wardId: String,
  departmentId: String,
  isActive: Boolean
}, { collection: 'users' })

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/civic-issues')
  console.log('Connected to DB')
  
  const User = mongoose.model('User', userSchema)
  
  // Check admin user
  const admin = await User.findOne({ email: 'admin@civicpulse.in' })
  if (admin) {
    console.log('\nAdmin user found:')
    console.log('  Email:', admin.email)
    console.log('  Role:', admin.role)
    console.log('  Password starts with:', admin.password.substring(0, 10))
    console.log('  Is bcrypt hash:', admin.password.startsWith('$2'))
  } else {
    console.log('\nAdmin user NOT FOUND')
  }
  
  // Check roads manager
  const roads = await User.findOne({ email: 'roads.manager@civicpulse.in' })
  if (roads) {
    console.log('\nRoads Manager found:')
    console.log('  Email:', roads.email)
    console.log('  Role:', roads.role)
    console.log('  departmentId:', roads.departmentId)
    console.log('  Password starts with:', roads.password.substring(0, 10))
  }
  
  // Check field officer
  const officer = await User.findOne({ email: 'officer.ward1@civicpulse.in' })
  if (officer) {
    console.log('\nOfficer Ward 1 found:')
    console.log('  Email:', officer.email)
    console.log('  Role:', officer.role)
    console.log('  wardId:', officer.wardId)
  }
  
  // List all users
  const users = await User.find({ email: { $regex: '@civicpulse.in' } }).select('email role wardId departmentId')
  console.log('\n\nAll civicpulse.in users:')
  users.forEach(u => {
    console.log(`  ${u.email} - ${u.role} - ward:${u.wardId} - dept:${u.departmentId}`)
  })
  
  await mongoose.disconnect()
  process.exit(0)
}

test().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
