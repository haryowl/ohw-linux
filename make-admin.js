const { User } = require('./src/models');

async function makeUserAdmin() {
  try {
    // Get the first user and make them admin
    const user = await User.findOne();
    if (user) {
      await user.update({ role: 'admin' });
      console.log(`User ${user.username} is now admin`);
    } else {
      console.log('No users found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

makeUserAdmin(); 