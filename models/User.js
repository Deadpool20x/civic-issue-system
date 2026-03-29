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
    enum: [
      // OLD - keep for backward compatibility
      'citizen', 'department', 'municipal', 'admin', 'commissioner',
      // NEW
      'CITIZEN', 'FIELD_OFFICER', 'DEPARTMENT_MANAGER',
      'SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER'
    ],
    default: 'CITIZEN'
  },
  wardId: {
    type: String,
    default: null,
    // Valid values: 'ward-1' through 'ward-16' or null
    // Required for: FIELD_OFFICER only
    // Null for: all other roles (including Dept Managers)
  },
  departmentId: {
    type: String,
    default: null,
    // Valid values: 'roads','lighting','waste','water',
    //               'parks','traffic','health','other'
    // Required for: DEPARTMENT_MANAGER only
    // For FIELD_OFFICER: derive from wardId using getWardDepartment()
    // Null for: CITIZEN, MUNICIPAL_COMMISSIONER, SYSTEM_ADMIN
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  googleId: {
    type: String,
    default: null,
    sparse: true
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
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ phone: 1 }, { sparse: true });

// Indexes
userSchema.index({ wardId: 1, departmentId: 1 });
userSchema.index({ role: 1, departmentId: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });

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

// Pre-save hook to validate department assignment
userSchema.pre('save', function (next) {
  // If role is department/FIELD_OFFICER, ensure department/departmentId is provided if required
  // For simplicity in the transition, we'll relax the strict validation but keep the cleanup logic

  // If role is not a department role, ensure department fields are cleared
  const departmentRoles = ['department', 'municipal', 'commissioner', 'FIELD_OFFICER', 'DEPARTMENT_MANAGER', 'MUNICIPAL_COMMISSIONER'];
  if (!departmentRoles.includes(this.role)) {
    this.department = undefined;
    this.departmentId = null;
    this.wardId = null;
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
