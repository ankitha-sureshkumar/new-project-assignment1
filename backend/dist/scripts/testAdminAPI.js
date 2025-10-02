"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:5001/api';
const testAdminAPI = async () => {
    try {
        console.log('🧪 Testing Admin API Endpoints...\n');
        console.log('1️⃣ Testing Admin Login...');
        const loginResponse = await axios_1.default.post(`${API_BASE}/admin/login`, {
            email: 'admin@oggypethospital.com',
            password: 'admin123456'
        });
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            const token = loginResponse.data.data.token;
            const headers = { Authorization: `Bearer ${token}` };
            console.log('\n2️⃣ Testing Dashboard Stats...');
            const dashboardResponse = await axios_1.default.get(`${API_BASE}/admin/dashboard`, { headers });
            if (dashboardResponse.data.success) {
                console.log('✅ Dashboard stats retrieved');
                console.log('📊 Stats:', JSON.stringify(dashboardResponse.data.data, null, 2));
            }
            else {
                console.log('❌ Dashboard stats failed:', dashboardResponse.data.message);
            }
            console.log('\n3️⃣ Testing Get All Users...');
            const usersResponse = await axios_1.default.get(`${API_BASE}/admin/users`, { headers });
            if (usersResponse.data.success) {
                console.log('✅ Users retrieved');
                console.log(`👥 Found ${usersResponse.data.data.users.length} users`);
                usersResponse.data.data.users.forEach((user, index) => {
                    console.log(`  ${index + 1}. ${user.name} (${user.email}) - Created: ${new Date(user.createdAt).toLocaleDateString()}`);
                });
            }
            else {
                console.log('❌ Get users failed:', usersResponse.data.message);
            }
            console.log('\n4️⃣ Testing Get All Veterinarians...');
            const vetsResponse = await axios_1.default.get(`${API_BASE}/admin/veterinarians`, { headers });
            if (vetsResponse.data.success) {
                console.log('✅ Veterinarians retrieved');
                console.log(`👨‍⚕️ Found ${vetsResponse.data.data.veterinarians.length} veterinarians`);
                vetsResponse.data.data.veterinarians.forEach((vet, index) => {
                    console.log(`  ${index + 1}. ${vet.name} (${vet.email}) - Status: ${vet.approvalStatus} - Created: ${new Date(vet.createdAt).toLocaleDateString()}`);
                });
            }
            else {
                console.log('❌ Get veterinarians failed:', vetsResponse.data.message);
            }
        }
        else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
    }
    catch (error) {
        console.error('❌ API Test Error:', error.response?.data || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running on http://localhost:5001');
            console.log('   Run: npm start');
        }
    }
};
testAdminAPI();
//# sourceMappingURL=testAdminAPI.js.map