require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Customer = require('./models/Customer');
const StaffMember = require('./models/StaffMember');
const Service = require('./models/Service');
const User = require('./models/User');

const seedAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lush-co');
    console.log('MongoDB Connected for seeding appointments...');

    // Clear existing appointments and customers
    await Appointment.deleteMany({});
    await Customer.deleteMany({});
    console.log('Deleted existing appointments and customers');

    // Get staff member (dila)
    const staff = await StaffMember.findOne({ name: 'dila' });
    if (!staff) {
      console.log('Staff member "dila" not found. Please run seedStaff.js first.');
      process.exit(1);
    }

    // Get Owner user who creates these appointments
    const ownerUser = await User.findOne({ userType: 'OWNER' });
    if (!ownerUser) {
      console.log('Owner user not found. Please run seedUsers.js first.');
      process.exit(1);
    }

    // Get services
    const classicHaircut = await Service.findOne({ name: 'Classic Haircut' });
    const facialCleanup = await Service.findOne({ name: 'Facial Cleanup' });
    const beardTrim = await Service.findOne({ name: 'Beard Trim & Shape' });
    const headMassage = await Service.findOne({ name: 'Head Massage' });

    if (!classicHaircut || !facialCleanup) {
      console.log('Services not found. Make sure your services collection is populated.');
      process.exit(1);
    }

    // Create Customers
    const janidu = await Customer.create({
      name: 'Janidu',
      phoneNumber: '0715347170',
      email: 'janidu@gmail.com',
      totalAppointments: 2,
      totalSpent: 4000
    });

    const senal = await Customer.create({
      name: 'Senal',
      phoneNumber: '0771234567',
      email: 'senal@gmail.com',
      totalAppointments: 1,
      totalSpent: 1500
    });

    const william = await Customer.create({
      name: 'William',
      phoneNumber: '0719876543',
      email: 'william@gmail.com',
      totalAppointments: 3,
      totalSpent: 6000
    });

    console.log('Mock customers created!');

    // Helper to get relative date
    const getDateWithOffset = (days, hours, minutes) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // Create Appointments
    // 1. Janidu: Classic Haircut + Beard Trim (Today at 1:30 PM)
    await Appointment.create({
      customer: janidu._id,
      staff: staff._id,
      services: [classicHaircut._id, beardTrim._id],
      appointmentDate: getDateWithOffset(0, 13, 30), // Today 1:30 PM
      duration: classicHaircut.duration + beardTrim.duration,
      price: classicHaircut.price + beardTrim.price,
      status: 'CONFIRMED',
      notes: 'Wants a styling gel suggestion.',
      createdBy: ownerUser._id
    });

    // 2. Senal: Facial Cleanup (Today at 5:30 PM)
    await Appointment.create({
      customer: senal._id,
      staff: staff._id,
      services: [facialCleanup._id],
      appointmentDate: getDateWithOffset(0, 17, 30), // Today 5:30 PM
      duration: facialCleanup.duration,
      price: facialCleanup.price,
      status: 'CONFIRMED',
      createdBy: ownerUser._id
    });

    // 3. William: Classic Haircut + Head Massage (Yesterday at 10:30 AM)
    await Appointment.create({
      customer: william._id,
      staff: staff._id,
      services: [classicHaircut._id, headMassage._id],
      appointmentDate: getDateWithOffset(-1, 10, 30), // Yesterday 10:30 AM
      duration: classicHaircut.duration + headMassage.duration,
      price: classicHaircut.price + headMassage.price,
      status: 'COMPLETED',
      createdBy: ownerUser._id
    });

    console.log('Mock appointments created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding appointments:', err);
    process.exit(1);
  }
};

seedAppointments();
