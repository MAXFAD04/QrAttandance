node -e 
const c=require('crypto');
console.log('JWT_SECRET='+c.randomBytes(64).toString('hex'));
console.log('JWT_REFRESH_SECRET='+c.randomBytes(64).toString('hex'));