const sequelize = require('./config/database');
const User = require('./models/User');

async function check() {
  await sequelize.authenticate();
  const users = await User.findAll();
  console.log('Users:');
  users.forEach(u => console.log(`ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Password: ${u.password}`));
  process.exit(0);
}

check();
