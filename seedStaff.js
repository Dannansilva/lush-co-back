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
