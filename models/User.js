import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'municipal', 'department'],
    default: 'citizen'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role === 'department';
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for department field for faster queries
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });

// Pre-save hook to validate department assignment
userSchema.pre('save', function (next) {
  // If role is department, ensure department is provided
  if (this.role === 'department' && !this.department) {
    return next(new Error('Department is required when role is "department"'));
  }

  // If role is not department, ensure department is cleared
  if (this.role !== 'department' && this.department) {
    this.department = undefined;
  }

  next();
});

// Method to populate department details
userSchema.methods.populateDepartment = async function () {
  if (this.department) {
    const Department = mongoose.model('Department');
    return await Department.findById(this.department);
  }
  return null;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
