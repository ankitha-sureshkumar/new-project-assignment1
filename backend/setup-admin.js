const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string from your .env file
const MONGODB_URI = '';

// Admin schema (simplified version matching your TypeScript model)
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    default: 'admin'
  },
  permissions: {
    type: [String],
    default: [
      'user_management',
      'veterinarian_management',
      'appointment_management',
      'system_analytics',
      'content_management'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

async function setupAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@oggypethospital.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Active:', existingAdmin.isActive);
      
      // Update password if needed (uncomment if you want to reset password)
      // existingAdmin.password = 'admin123456';
      // await existingAdmin.save();
      // console.log('Admin password updated!');
      
    } else {
      // Create new admin user
      const adminData = {
        name: 'System Administrator',
        email: 'admin@oggypethospital.com',
        password: 'admin123456',
        role: 'admin',
        permissions: [
          'user_management',
          'veterinarian_management',
          'appointment_management',
          'system_analytics',
          'content_management'
        ],
        isActive: true
      };

      const admin = new Admin(adminData);
      await admin.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@oggypethospital.com');
      console.log('🔑 Password: admin123456');
      console.log('🎯 Role: admin');
      console.log('✅ Status: Active');
    }

    // Verify the admin can be found and password works
    console.log('\n🔍 Verifying admin user...');
    const admin = await Admin.findOne({ email: 'admin@oggypethospital.com' }).select('+password');
    
    if (admin) {
      const isPasswordValid = await admin.comparePassword('admin123456');
      console.log('✅ Admin found in database');
      console.log('🔑 Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');
      console.log('✅ Active status:', admin.isActive);
      
      if (isPasswordValid && admin.isActive) {
        console.log('\n🎉 Admin setup completed successfully!');
        console.log('You can now login with:');
        console.log('Email: admin@oggypethospital.com');
        console.log('Password: admin123456');
      } else {
        console.log('❌ Something went wrong with admin setup');
      }
    } else {
      console.log('❌ Admin user not found after creation');
    }

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the setup
setupAdmin();