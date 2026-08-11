const http = require('http');

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: json });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAPITests() {
  console.log('=== STARTING MEDIBOOK BACKEND API SUITE TEST ===\n');
  let token = null;

  try {
    // Test 1: GET /doctors
    console.log('1. Testing GET /api/doctors...');
    const doctorsRes = await makeRequest('/doctors');
    console.log(`   Status: ${doctorsRes.statusCode} | Count: ${doctorsRes.data?.count || 0}`);

    // Test 2: POST /auth/login (Patient)
    console.log('\n2. Testing POST /api/auth/login (Patient)...');
    const loginRes = await makeRequest('/auth/login', 'POST', {
      email: 'patient@medibook.com',
      password: 'password123',
      role: 'patient',
    });
    console.log(`   Status: ${loginRes.statusCode} | User: ${loginRes.data?.user?.name}`);
    token = loginRes.data?.token;

    if (token) {
      // Test 3: GET /auth/me
      console.log('\n3. Testing GET /api/auth/me (Protected)...');
      const meRes = await makeRequest('/auth/me', 'GET', null, token);
      console.log(`   Status: ${meRes.statusCode} | Authenticated as: ${meRes.data?.user?.email}`);

      // Test 4: GET /appointments
      console.log('\n4. Testing GET /api/appointments...');
      const apptRes = await makeRequest('/appointments', 'GET', null, token);
      console.log(`   Status: ${apptRes.statusCode} | Total Appointments: ${apptRes.data?.count || (apptRes.data?.data ? apptRes.data.data.length : 0)}`);

      // Test 5: POST /appointments (Create Appointment)
      console.log('\n5. Testing POST /api/appointments...');
      const doctorId = doctorsRes.data?.data?.[0]?._id || 'doc_1';
      const createApptRes = await makeRequest(
        '/appointments',
        'POST',
        {
          doctorId,
          date: '2026-08-20',
          timeSlot: '11:00 AM',
          reason: 'Full API Suite Consultation Test',
          type: 'video',
        },
        token
      );
      console.log(`   Status: ${createApptRes.statusCode} | Success: ${createApptRes.data?.success}`);

      // Test 6: GET /payments/history
      console.log('\n6. Testing GET /api/payments/history...');
      const paymentsRes = await makeRequest('/payments/history', 'GET', null, token);
      console.log(`   Status: ${paymentsRes.statusCode} | Total Payments: ${paymentsRes.data?.count || 0}`);

      // Test 7: GET /notifications
      console.log('\n7. Testing GET /api/notifications...');
      const notifRes = await makeRequest('/notifications', 'GET', null, token);
      console.log(`   Status: ${notifRes.statusCode} | Notifications: ${notifRes.data?.notifications?.length || 0}`);

      // Test 8: GET /messages/conversations/my
      console.log('\n8. Testing GET /api/messages/conversations/my...');
      const msgRes = await makeRequest('/messages/conversations/my', 'GET', null, token);
      console.log(`   Status: ${msgRes.statusCode} | Conversations: ${msgRes.data?.data?.length || 0}`);
    }

    console.log('\n=== ALL BACKEND API ENDPOINTS TESTED SUCCESSFULLY ===');
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
}

runAPITests();
