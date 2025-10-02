import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

const createAdminAccount = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@oggypethospital.com' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log('Email: admin@oggypethospital.com');
      console.log('You can use this existing account to login.');
      process.exit(0);
    }

    // Create admin account
    const adminData = {
      name: 'System Administrator',
      email: 'admin@oggypethospital.com',
      password: 'admin123456', // Change this to a secure password
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

    console.log('🎉 Admin account created successfully!');
    console.log('==========================================');
    console.log('📧 Email: admin@oggypethospital.com');
    console.log('🔑 Password: admin123456');
    console.log('==========================================');
    console.log('⚠️  SECURITY WARNING: Please change the password after first login!');
    console.log('🔐 You can now login to the admin panel using these credentials.');
    
  } catch (error: any) {
    console.error('❌ Error creating admin account:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
createAdminAccount();