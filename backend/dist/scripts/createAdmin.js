"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_1 = __importDefault(require("../models/Admin"));
const database_1 = __importDefault(require("../config/database"));
dotenv_1.default.config();
const createAdminAccount = async () => {
    try {
        await (0, database_1.default)();
        const existingAdmin = await Admin_1.default.findOne({ email: 'admin@oggypethospital.com' });
        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            console.log('Email: admin@oggypethospital.com');
            console.log('You can use this existing account to login.');
            process.exit(0);
        }
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
        const admin = new Admin_1.default(adminData);
        await admin.save();
        console.log('🎉 Admin account created successfully!');
        console.log('==========================================');
        console.log('📧 Email: admin@oggypethospital.com');
        console.log('🔑 Password: admin123456');
        console.log('==========================================');
        console.log('⚠️  SECURITY WARNING: Please change the password after first login!');
        console.log('🔐 You can now login to the admin panel using these credentials.');
    }
    catch (error) {
        console.error('❌ Error creating admin account:', error.message);
    }
    finally {
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
};
createAdminAccount();
//# sourceMappingURL=createAdmin.js.map