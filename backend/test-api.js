const http = require('http');

const data = JSON.stringify({
  firebaseUid: 'mock-firebase-uid-12345',
  role: 'chef',
  name: 'Chef Gordon',
  email: 'gordon@hellskitchen.mock',
  phone: '1234567890',
  location: { type: 'Point', coordinates: [77.2090, 28.6139] },
  pickupAddress: 'Hells Kitchen St'
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE:', body);
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.write(data);
req.end();
