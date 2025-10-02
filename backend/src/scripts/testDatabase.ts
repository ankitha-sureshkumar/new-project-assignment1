import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Veterinarian from '../models/Veterinarian';
import Admin from '../models/Admin';

// Load environment variables
dotenv.config();

const testDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB Connected');

    // Test User data
    console.log('\n📊 Testing User data:');
    const userCount = await User.countDocuments();
    console.log(`Total Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().limit(3);
      console.log('Sample users:');
      users.forEach((user: any, index: number) => {
        console.log(`  ${index + 1}. Name: ${user.name}, Email: ${user.email}, Created: ${user.createdAt}`);
      });
    }

    // Test Veterinarian data
    console.log('\n📊 Testing Veterinarian data:');
    const vetCount = await Veterinarian.countDocuments();
    console.log(`Total Veterinarians: ${vetCount}`);
    
    if (vetCount > 0) {
      const vets = await Veterinarian.find().limit(3);
      console.log('Sample veterinarians:');
      vets.forEach((vet: any, index: number) => {
        console.log(`  ${index + 1}. Name: ${vet.name}, Email: ${vet.email}, Status: ${vet.approvalStatus}, Created: ${vet.createdAt}`);
      });
    }

    // Test Admin data
    console.log('\n📊 Testing Admin data:');
    const adminCount = await Admin.countDocuments();
    console.log(`Total Admins: ${adminCount}`);
    
    if (adminCount > 0) {
      const admins = await Admin.find();
      console.log('Admins:');
      admins.forEach((admin: any, index: number) => {
        console.log(`  ${index + 1}. Name: ${admin.name}, Email: ${admin.email}, Active: ${admin.isActive}`);
      });
    }

    // Test dashboard stats similar to controller
    console.log('\n📈 Testing Dashboard Stats (like admin controller):');
    const totalUsers = await User.countDocuments();
    const totalVeterinarians = await Veterinarian.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const blockedVeterinarians = await Veterinarian.countDocuments({ isBlocked: true });
    const pendingVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'pending' });
    const approvedVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'approved' });
    const rejectedVeterinarians = await Veterinarian.countDocuments({ approvalStatus: 'rejected' });

    console.log(`Dashboard Stats:
  - Total Users: ${totalUsers}
  - Total Veterinarians: ${totalVeterinarians}
  - Blocked Users: ${blockedUsers}
  - Blocked Veterinarians: ${blockedVeterinarians}
  - Pending Veterinarians: ${pendingVeterinarians}
  - Approved Veterinarians: ${approvedVeterinarians}
  - Rejected Veterinarians: ${rejectedVeterinarians}`);

  } catch (error) {
    console.error('❌ Database test error:', error);
  } finally {
    console.log('\n⚠️ Disconnecting from MongoDB...');
    await mongoose.disconnect();
    process.exit(0);
  }
};

testDatabase();