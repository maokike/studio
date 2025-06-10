process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require('https');

https.get('https://localhost:44314/api/Especialidad', (res) => {
  console.log('statusCode:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
