require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Package = require('./models/Package');

const seedPackages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding packages...');

    // 1. Create Services if they don't exist
    // We'll upsert services to ensure they exist for the package
    const servicesToCreate = [
      {
        name: 'Facial Cleanup',
        category: 'FACIAL',
        duration: 30,
        price: 2500,
        description: 'Deep cleansing facial for refresh skin',
        isPopular: true
      },
      {
        name: 'Classic Haircut',
        category: 'HAIR_STYLING',
        duration: 45,
        price: 1500,
        description: 'Professional haircut and styling',
        isPopular: true
      },
      {
        name: 'Beard Trim & Shape',
        category: 'BEARD',
        duration: 20,
        price: 800,
        description: 'Precise beard trimming and shaping',
        isPopular: false
      },
      {
        name: 'Head Massage',
        category: 'MASSAGE',
        duration: 30,
        price: 1200,
        description: 'Relaxing head massage to relieve stress',
        isPopular: true
      }
    ];

    const createdServices = [];

    for (const serviceData of servicesToCreate) {
      let service = await Service.findOne({ name: serviceData.name });
      if (!service) {
        service = await Service.create(serviceData);
        console.log(`Service created: ${service.name}`);
      } else {
        console.log(`Service already exists: ${service.name}`);
      }
      createdServices.push(service);
    }

    // 2. Create Packages
    await Package.deleteMany({}); // Clear existing packages to avoid duplicates for this seed
    console.log('Cleared existing packages');

    const groomPackageServices = createdServices.filter(s => 
      ['Facial Cleanup', 'Classic Haircut', 'Beard Trim & Shape'].includes(s.name)
    );
    
    // Calculate total price and duration
    const totalPrice = groomPackageServices.reduce((acc, s) => acc + s.price, 0);
    const totalDuration = groomPackageServices.reduce((acc, s) => acc + s.duration, 0);
    const discount = 0.15; // 15% discount
    const packagePrice = Math.round(totalPrice * (1 - discount));

    const groomPackage = await Package.create({
      name: 'Wedding Groom Essentials',
      description: 'Comprehensive grooming package for the groom includes Facial Cleanup, Classic Haircut, and Beard Trim.',
      services: groomPackageServices.map(s => s._id),
      duration: totalDuration,
      price: packagePrice,
      image: '', // Placeholder
      isActive: true
    });

    console.log(`Package created: ${groomPackage.name} (Price: ${packagePrice}, Valued at: ${totalPrice})`);

    const relaxationPackageServices = createdServices.filter(s => 
      ['Facial Cleanup', 'Head Massage'].includes(s.name)
    );

    const relaxTotalPrice = relaxationPackageServices.reduce((acc, s) => acc + s.price, 0);
    const relaxTotalDuration = relaxationPackageServices.reduce((acc, s) => acc + s.duration, 0);
    const relaxDiscount = 0.10;
    const relaxPrice = Math.round(relaxTotalPrice * (1 - relaxDiscount));

    const relaxPackage = await Package.create({
      name: 'Total Relaxation',
      description: 'Rejuvenate with a Facial Cleanup and a soothing Head Massage.',
      services: relaxationPackageServices.map(s => s._id),
      duration: relaxTotalDuration,
      price: relaxPrice,
      isActive: true
    });

    console.log(`Package created: ${relaxPackage.name} (Price: ${relaxPrice}, Valued at: ${relaxTotalPrice})`);

    console.log('\n✅ Packages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
};

seedPackages();
