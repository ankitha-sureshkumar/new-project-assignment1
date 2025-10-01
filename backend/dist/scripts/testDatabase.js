"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const Admin_1 = __importDefault(require("../models/Admin"));
dotenv_1.default.config();
const testDatabase = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        console.log('\n📊 Testing User data:');
        const userCount = await User_1.default.countDocuments();
        console.log(`Total Users: ${userCount}`);
        if (userCount > 0) {
            const users = await User_1.default.find().limit(3);
            console.log('Sample users:');
            users.forEach((user, index) => {
                console.log(`  ${index + 1}. Name: ${user.name}, Email: ${user.email}, Created: ${user.createdAt}`);
            });
        }
        console.log('\n📊 Testing Veterinarian data:');
        const vetCount = await Veterinarian_1.default.countDocuments();
        console.log(`Total Veterinarians: ${vetCount}`);
        if (vetCount > 0) {
            const vets = await Veterinarian_1.default.find().limit(3);
            console.log('Sample veterinarians:');
            vets.forEach((vet, index) => {
                console.log(`  ${index + 1}. Name: ${vet.name}, Email: ${vet.email}, Status: ${vet.approvalStatus}, Created: ${vet.createdAt}`);
            });
        }
        console.log('\n📊 Testing Admin data:');
        const adminCount = await Admin_1.default.countDocuments();
        console.log(`Total Admins: ${adminCount}`);
        if (adminCount > 0) {
            const admins = await Admin_1.default.find();
            console.log('Admins:');
            admins.forEach((admin, index) => {
                console.log(`  ${index + 1}. Name: ${admin.name}, Email: ${admin.email}, Active: ${admin.isActive}`);
            });
        }
        console.log('\n📈 Testing Dashboard Stats (like admin controller):');
        const totalUsers = await User_1.default.countDocuments();
        const totalVeterinarians = await Veterinarian_1.default.countDocuments();
        const blockedUsers = await User_1.default.countDocuments({ isBlocked: true });
        const blockedVeterinarians = await Veterinarian_1.default.countDocuments({ isBlocked: true });
        const pendingVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'pending' });
        const approvedVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'approved' });
        const rejectedVeterinarians = await Veterinarian_1.default.countDocuments({ approvalStatus: 'rejected' });
        console.log(`Dashboard Stats:
  - Total Users: ${totalUsers}
  - Total Veterinarians: ${totalVeterinarians}
  - Blocked Users: ${blockedUsers}
  - Blocked Veterinarians: ${blockedVeterinarians}
  - Pending Veterinarians: ${pendingVeterinarians}
  - Approved Veterinarians: ${approvedVeterinarians}
  - Rejected Veterinarians: ${rejectedVeterinarians}`);
    }
    catch (error) {
        console.error('❌ Database test error:', error);
    }
    finally {
        console.log('\n⚠️ Disconnecting from MongoDB...');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
};
testDatabase();
//# sourceMappingURL=testDatabase.js.map