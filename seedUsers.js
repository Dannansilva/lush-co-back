require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Delete existing users
    await User.deleteMany({});
    console.log('Deleted all existing users');

    // Create Owner user
    const owner = await User.create({
      name: 'Owner Lush&Co',
      email: 'ownerlushco@gmail.com',
      password: 'OwnerLush123',
      userType: 'OWNER'
    });
    console.log('Owner user created:', owner.email);

    // Create Receptionist user
    const receptionist = await User.create({
      name: 'Front Desk',
      email: 'frontdesk@gmail.com',
      password: 'frontdesk123',
      userType: 'RECEPTIONIST'
    });
    console.log('Receptionist user created:', receptionist.email);

    console.log('\n✅ Users seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('─────────────────────────────────────');
    console.log('OWNER:');
    console.log('  Email: ownerlushco@gmail.com');
    console.log('  Password: OwnerLush123');
    console.log('\nRECEPTIONIST:');
    console.log('  Email: frontdesk@gmail.com');
    console.log('  Password: frontdesk123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
