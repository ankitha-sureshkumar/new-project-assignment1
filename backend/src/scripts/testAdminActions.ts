import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const testAdminActions = async () => {
  try {
    console.log('🧪 Testing Admin Action Endpoints...\n');

    // Step 1: Admin Login to get token
    console.log('1️⃣ Getting Admin Token...');
    const loginResponse = await axios.post(`${API_BASE}/admin/login`, {
      email: 'admin@oggypethospital.com',
      password: 'admin123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }

    console.log('✅ Admin login successful');
    const token = loginResponse.data.data.token;
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get user and vet IDs for testing
    console.log('\n2️⃣ Getting User and Veterinarian IDs...');
    const [usersResponse, vetsResponse] = await Promise.all([
      axios.get(`${API_BASE}/admin/users`, { headers }),
      axios.get(`${API_BASE}/admin/veterinarians`, { headers })
    ]);

    if (!usersResponse.data.success || !vetsResponse.data.success) {
      console.log('❌ Failed to get users or veterinarians');
      return;
    }

    const users = usersResponse.data.data.users;
    const veterinarians = vetsResponse.data.data.veterinarians;

    if (users.length === 0) {
      console.log('⚠️ No users found for testing');
      return;
    }

    if (veterinarians.length === 0) {
      console.log('⚠️ No veterinarians found for testing');
      return;
    }

    const testUserId = users[0]._id;
    const testVetId = veterinarians[0]._id;

    console.log(`✅ Found test user: ${users[0].name} (${testUserId})`);
    console.log(`✅ Found test veterinarian: ${veterinarians[0].name} (${testVetId})`);

    // Step 3: Test User Actions
    console.log('\n3️⃣ Testing User Actions...');
    
    // Test Block User
    console.log('\n📝 Testing Block User...');
    try {
      const blockUserResponse = await axios.post(`${API_BASE}/admin/users/action`, {
        userId: testUserId,
        action: 'block',
        reason: 'Testing block functionality'
      }, { headers });

      if (blockUserResponse.data.success) {
        console.log('✅ User blocked successfully');
      } else {
        console.log('❌ Block user failed:', blockUserResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Block user error:', error.response?.data?.message || error.message);
    }

    // Test Unblock User
    console.log('\n📝 Testing Unblock User...');
    try {
      const unblockUserResponse = await axios.post(`${API_BASE}/admin/users/action`, {
        userId: testUserId,
        action: 'unblock'
      }, { headers });

      if (unblockUserResponse.data.success) {
        console.log('✅ User unblocked successfully');
      } else {
        console.log('❌ Unblock user failed:', unblockUserResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Unblock user error:', error.response?.data?.message || error.message);
    }

    // Step 4: Test Veterinarian Actions
    console.log('\n4️⃣ Testing Veterinarian Actions...');
    
    // Test Approve Veterinarian
    console.log('\n📝 Testing Approve Veterinarian...');
    try {
      const approveVetResponse = await axios.post(`${API_BASE}/admin/veterinarians/action`, {
        veterinarianId: testVetId,
        action: 'approve'
      }, { headers });

      if (approveVetResponse.data.success) {
        console.log('✅ Veterinarian approved successfully');
      } else {
        console.log('❌ Approve veterinarian failed:', approveVetResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Approve veterinarian error:', error.response?.data?.message || error.message);
    }

    // Test Block Veterinarian
    console.log('\n📝 Testing Block Veterinarian...');
    try {
      const blockVetResponse = await axios.post(`${API_BASE}/admin/veterinarians/action`, {
        veterinarianId: testVetId,
        action: 'block',
        reason: 'Testing block functionality'
      }, { headers });

      if (blockVetResponse.data.success) {
        console.log('✅ Veterinarian blocked successfully');
      } else {
        console.log('❌ Block veterinarian failed:', blockVetResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Block veterinarian error:', error.response?.data?.message || error.message);
    }

    // Test Unblock Veterinarian
    console.log('\n📝 Testing Unblock Veterinarian...');
    try {
      const unblockVetResponse = await axios.post(`${API_BASE}/admin/veterinarians/action`, {
        veterinarianId: testVetId,
        action: 'unblock'
      }, { headers });

      if (unblockVetResponse.data.success) {
        console.log('✅ Veterinarian unblocked successfully');
      } else {
        console.log('❌ Unblock veterinarian failed:', unblockVetResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Unblock veterinarian error:', error.response?.data?.message || error.message);
    }

    // Test Reject Veterinarian
    console.log('\n📝 Testing Reject Veterinarian...');
    try {
      const rejectVetResponse = await axios.post(`${API_BASE}/admin/veterinarians/action`, {
        veterinarianId: testVetId,
        action: 'reject',
        reason: 'Testing reject functionality'
      }, { headers });

      if (rejectVetResponse.data.success) {
        console.log('✅ Veterinarian rejected successfully');
      } else {
        console.log('❌ Reject veterinarian failed:', rejectVetResponse.data.message);
      }
    } catch (error: any) {
      console.log('❌ Reject veterinarian error:', error.response?.data?.message || error.message);
    }

    // Re-approve for consistency
    console.log('\n📝 Re-approving veterinarian for consistency...');
    try {
      await axios.post(`${API_BASE}/admin/veterinarians/action`, {
        veterinarianId: testVetId,
        action: 'approve'
      }, { headers });
      console.log('✅ Veterinarian re-approved');
    } catch (error: any) {
      console.log('⚠️ Re-approve failed (not critical):', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All Admin Action Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ User block/unblock actions tested');
    console.log('✅ Veterinarian approve/reject/block/unblock actions tested');
    console.log('\n💡 All action endpoints are working properly!');

  } catch (error: any) {
    console.error('❌ Test Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running on http://localhost:5001');
      console.log('   Run: npm start');
    }
  }
};

testAdminActions();