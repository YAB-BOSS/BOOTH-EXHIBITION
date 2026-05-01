const http = require('https');
const options = {
  hostname: 'formsubmit.co',
  port: 443,
  path: '/ajax/yabdesigns@gmail.com',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.on('error', e => console.error(e));
req.write(JSON.stringify({name: 'Test', email: 'test@example.com'}));
req.end();
