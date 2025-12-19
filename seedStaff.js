require('dotenv').config();
const mongoose = require('mongoose');
const StaffMember = require('./models/StaffMember');
const connectDB = require('./config/database');

const seedStaff = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Delete all existing staff members
    await StaffMember.deleteMany({});
    console.log('Cleared existing staff members');

    // Create mock staff members
    const mockStaff = [
      {
        name: 'Sarah Johnson',
        phoneNumber: '+1234567890'
      },
      {
        name: 'Michael Chen',
        phoneNumber: '+1234567891'
      },
      {
        name: 'Emily Rodriguez',
        phoneNumber: '+1234567892'
      },
      {
        name: 'David Williams',
        phoneNumber: '+1234567893'
      },
      {
        name: 'Jessica Martinez',
        phoneNumber: '+1234567894'
      }
    ];

    // Insert staff members
    const staff = await StaffMember.insertMany(mockStaff);
    console.log(`\n✓ Successfully created ${staff.length} staff members:`);
    staff.forEach((member, index) => {
      console.log(`  ${index + 1}. ${member.name} - ${member.phoneNumber}`);
    });

    console.log('\n✓ Staff seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding staff:', error);
    process.exit(1);
  }
};

seedStaff();
