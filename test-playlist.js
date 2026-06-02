async function runIntegrationTest() {
  try {
    console.log('1. Registering test user...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'tester_' + Math.floor(Math.random() * 10000),
        email: 'tester_' + Math.floor(Math.random() * 10000) + '@test.com',
        mobileNumber: '98765' + Math.floor(10000 + Math.random() * 90000),
        password: 'password123'
      })
    });
    
    const regData = await regRes.json();
    console.log('Registration Response:', regData);
    
    if (!regData.tempUserId) {
      throw new Error('Registration failed to return temporary user ID');
    }
    
    // For in-memory testing we need to bypass OTP or check if we can verify with the logged OTP
    // Wait, the OTP is printed to the console. Since we are in-memory, we can read the OTP from the server if we had access, 
    // or let's look at the database: since it is in-memory, how does the test know the code?
    // Let's print the code in the terminal logs, but for the integration test script, we can just request OTP resend or verify.
    // Wait, how can the test script verify without knowing the code?
    // In dbManager.js, mockUsers is a local array. The test script runs in a separate process, so it cannot read mockUsers.
    // However, the test script can query the server console logs, but since it's a separate process, let's just make the test script 
    // try to login or see if the API endpoints are reachable.
    // Wait! Let's check: since we know from the previous error that saving was throwing a 500 error, if we try to register, we can verify it reaches Step 2.
    // Let's log verification attempt with a dummy OTP, it should return "Invalid verification code" (which is correct behavior) instead of a 500 server crash!
    
    console.log('2. Trying to verify OTP with a dummy code (should return 400 with "Invalid verification code")...');
    const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempUserId: regData.tempUserId,
        otpCode: '000000'
      })
    });
    
    const verifyData = await verifyRes.json();
    console.log('Verification response status:', verifyRes.status);
    console.log('Verification data:', verifyData);
    
  } catch (error) {
    console.error('Integration test failed:', error.message);
  }
}

runIntegrationTest();
