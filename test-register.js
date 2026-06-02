async function runTest() {
  try {
    console.log('Sending registration request to http://localhost:5000/api/auth/register...');
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser_' + Math.floor(Math.random() * 1000),
        email: 'test_' + Math.floor(Math.random() * 1000) + '@example.com',
        mobileNumber: '9121192144',
        password: 'password123'
      })
    });

    const status = res.status;
    console.log('Error status:', status);
    
    const data = await res.json();
    console.log('Response data:', data);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

runTest();
