// Test login flow - correct way
import dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  wardId: String,
  departmentId: String,
  isActive: Boolean
}, { collection: 'users' })

async function testLogin() {
  await mongoose.connect('mongodb://127.0.0.1:27017/civic-issues')
  console.log('Connected to DB')
  
  const User = mongoose.model('User', userSchema)
  
  const email = 'admin@civicpulse.in'
  const password = 'admin123'
  
  console.log(`\nTesting login for: ${email}`)
  
  const user = await User.findOne({ email }).select('+password')
  
  if (!user) {
    console.log('User not found!')
    await mongoose.disconnect()
    process.exit(1)
  }
  
  console.log('User found in DB:')
  console.log('  email:', user.email)
  console.log('  role:', user.role)
  console.log('  stored password hash:', user.password)
  
  // Use bcrypt.compare to check if password matches
  console.log('\nTesting bcrypt.compare(password, storedHash)...')
  const isValid = await bcrypt.compare(password, user.password)
  
  console.log('Result:', isValid)
  
  if (isValid) {
    console.log('\n✓ SUCCESS: Password is correct!')
  } else {
    console.log('\n✗ FAILURE: Password does not match')
  }
  
  await mongoose.disconnect()
  process.exit(0)
}

testLogin().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
