const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/login_response.json', 'utf8'));
console.log(data.access_token);
