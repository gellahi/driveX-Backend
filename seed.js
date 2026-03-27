const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Car = require('./models/Car');
const Request = require('./models/Request');
require('dotenv').config();

// Sample car data
const sampleCars = [
  {
    make: 'BMW',
    model: 'M5 Competition',
    year: 2023,
    price: 120000,
    description: 'The ultimate expression of performance luxury. The BMW M5 Competition features a twin-turbo V8 engine delivering 617 horsepower, adaptive M suspension, and cutting-edge technology.',
    mileage: 1200,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Mineral Grey Metallic',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    features: ['Adaptive M Suspension', 'M Carbon Ceramic Brakes', 'Harman Kardon Audio', 'Panoramic Sunroof', 'Heated Seats', 'Navigation System'],
    status: 'available'
  },
  {
    make: 'Mercedes-Benz',
    model: 'AMG GT 63 S',
    year: 2023,
    price: 180000,
    description: 'A masterpiece of engineering and luxury. The AMG GT 63 S combines breathtaking performance with unparalleled comfort and sophistication.',
    mileage: 800,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Magnetite Black',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
    features: ['AMG Performance Seats', 'Burmester 3D Audio', 'AMG Track Pace', 'Air Suspension', 'Ambient Lighting', 'Wireless Charging'],
    status: 'available'
  },
  {
    make: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    price: 110000,
    description: 'The perfect blend of practicality and performance. This RS6 Avant features a twin-turbo V8 engine with 591 horsepower and Quattro all-wheel drive.',
    mileage: 2100,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Nardo Grey',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop',
    features: ['Quattro AWD', 'Sport Differential', 'Matrix LED Headlights', 'Virtual Cockpit Plus', 'Bang & Olufsen Audio', 'Panoramic Sunroof'],
    status: 'available'
  },
  {
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2023,
    price: 230000,
    description: 'The pinnacle of sports car engineering. The 911 Turbo S delivers 640 horsepower from its twin-turbo flat-six engine with legendary Porsche precision.',
    mileage: 500,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Racing Yellow',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    features: ['PDK Transmission', 'Active Suspension Management', 'Sport Chrono Package', 'Ceramic Composite Brakes', 'Adaptive Cruise Control', 'Bose Audio'],
    status: 'available'
  },
  {
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2023,
    price: 140000,
    description: 'The future of automotive performance. With three electric motors producing over 1,000 horsepower, this Model S Plaid redefines what\'s possible.',
    mileage: 3000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    color: 'Pearl White Multi-Coat',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
    features: ['Autopilot', 'Full Self-Driving Capability', '17-inch Touchscreen', 'Premium Audio', 'Glass Roof', 'Supercharging'],
    status: 'available'
  },
  {
    make: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2022,
    price: 280000,
    description: 'Pure Italian passion and performance. The Huracán EVO features a naturally aspirated V10 engine producing 630 horsepower with stunning design.',
    mileage: 1800,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Arancio Borealis',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0e8a89ebc?w=800&h=600&fit=crop',
    features: ['All-Wheel Drive', 'Dynamic Steering', 'Performance Traction Control', 'Alcantara Interior', 'Carbon Fiber Package', 'Lifting System'],
    status: 'available'
  },
  {
    make: 'Ferrari',
    model: 'F8 Tributo',
    year: 2022,
    price: 350000,
    description: 'The ultimate expression of Ferrari\'s racing heritage. The F8 Tributo features a twin-turbo V8 engine with 710 horsepower and iconic Italian styling.',
    mileage: 1200,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Rosso Corsa',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    features: ['Side Slip Control', 'Ferrari Dynamic Enhancer', 'Carbon Fiber Steering Wheel', 'Racing Seats', 'Premium Audio', 'Track Mode'],
    status: 'sold'
  },
  {
    make: 'McLaren',
    model: '720S',
    year: 2022,
    price: 320000,
    description: 'British engineering excellence. The 720S delivers 710 horsepower from its twin-turbo V8 with revolutionary aerodynamics and carbon fiber construction.',
    mileage: 900,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Silica White',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    features: ['Active Aerodynamics', 'Proactive Chassis Control', 'Carbon Fiber Monocoque', 'Dihedral Doors', 'Bowers & Wilkins Audio', 'Track Telemetry'],
    status: 'available'
  },
  {
    make: 'Rolls-Royce',
    model: 'Ghost',
    year: 2023,
    price: 450000,
    description: 'The pinnacle of luxury and refinement. The Ghost offers an unparalleled driving experience with its twin-turbo V12 engine and exquisite craftsmanship.',
    mileage: 600,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Arctic White',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    features: ['Magic Carpet Ride', 'Bespoke Audio', 'Starlight Headliner', 'Massage Seats', 'Champagne Cooler', 'Rear Executive Seating'],
    status: 'reserved'
  },
  {
    make: 'Bentley',
    model: 'Continental GT',
    year: 2023,
    price: 250000,
    description: 'British luxury at its finest. The Continental GT combines a twin-turbo W12 engine with handcrafted luxury and timeless design.',
    mileage: 1500,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Beluga Black',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    features: ['All-Wheel Drive', 'Air Suspension', 'Rotating Display', 'Diamond Quilted Leather', 'Naim Audio', 'Massage Seats'],
    status: 'available'
  },
  {
    make: 'Toyota',
    model: 'Supra 3.0 Premium',
    year: 2023,
    price: 55000,
    description: 'The return of a legend. The new Supra combines Toyota reliability with BMW engineering, featuring a turbocharged inline-6 engine.',
    mileage: 5000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    color: 'Renaissance Red',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
    features: ['Adaptive Suspension', 'Launch Control', 'Premium Audio', 'Alcantara Interior', 'Head-Up Display', 'Safety Sense 2.0'],
    status: 'available'
  },
  {
    make: 'Honda',
    model: 'NSX Type S',
    year: 2022,
    price: 170000,
    description: 'Japanese precision engineering. The NSX Type S features a hybrid powertrain with three electric motors and a twin-turbo V6 for incredible performance.',
    mileage: 2500,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    color: 'Thermal Orange Pearl',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    features: ['Sport Hybrid SH-AWD', 'Integrated Dynamics System', 'Carbon Fiber Body', 'Brembo Brakes', 'ELS Studio Audio', 'Track Mode'],
    status: 'available'
  }
];

// Sample users
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@drivex.com',
    password: 'password',
    role: 'admin',
    phone: '+1-555-0001'
  },
  {
    name: 'John Customer',
    email: 'customer@drivex.com',
    password: 'password',
    role: 'customer',
    phone: '+1-555-0002'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    password: 'password',
    role: 'customer',
    phone: '+1-555-0003'
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    password: 'password',
    role: 'customer',
    phone: '+1-555-0004'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    password: 'password',
    role: 'customer',
    phone: '+1-555-0005'
  }
];

const clearDatabase = async () => {
  try {
    console.log('🧹 Starting database clearing...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Request.deleteMany({});
    console.log('✅ All data cleared from database');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Car.deleteMany({});
    await Request.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create cars
    console.log('🚗 Creating cars...');
    const createdCars = await Car.insertMany(sampleCars);
    console.log(`✅ Created ${createdCars.length} cars`);

    // Create sample requests
    console.log('📋 Creating sample requests...');
    const customers = createdUsers.filter(user => user.role === 'customer');
    const availableCars = createdCars.filter(car => car.status === 'available');

    const sampleRequests = [
      {
        customer: customers[0]._id,
        car: availableCars[0]._id,
        type: 'test_drive',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        preferredTime: '10:00',
        message: 'Very interested in this BMW M5. Would love to schedule a test drive.',
        contactPhone: customers[0].phone,
        status: 'pending'
      },
      {
        customer: customers[1]._id,
        car: availableCars[1]._id,
        type: 'booking',
        preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        preferredTime: '14:00',
        message: 'Ready to purchase this Mercedes AMG GT. Please prepare the paperwork.',
        contactPhone: customers[1].phone,
        status: 'approved'
      },
      {
        customer: customers[2]._id,
        car: availableCars[2]._id,
        type: 'test_drive',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        preferredTime: '16:00',
        message: 'Looking for a family-friendly performance car. The RS6 seems perfect.',
        contactPhone: customers[2].phone,
        status: 'pending'
      },
      {
        customer: customers[3]._id,
        car: availableCars[3]._id,
        type: 'test_drive',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        preferredTime: '11:00',
        message: 'Dream car! Would love to experience the 911 Turbo S.',
        contactPhone: customers[3].phone,
        status: 'completed'
      },
      {
        customer: customers[0]._id,
        car: availableCars[4]._id,
        type: 'booking',
        preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        preferredTime: '09:00',
        message: 'Interested in the Tesla Model S Plaid for daily driving.',
        contactPhone: customers[0].phone,
        status: 'rejected'
      }
    ];

    const createdRequests = await Request.insertMany(sampleRequests);
    console.log(`✅ Created ${createdRequests.length} sample requests`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🚗 Cars: ${createdCars.length}`);
    console.log(`📋 Requests: ${createdRequests.length}`);

    console.log('\n🔐 Demo Login Credentials:');
    console.log('Admin: admin@drivex.com / password');
    console.log('Customer: customer@drivex.com / password');

    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, clearDatabase };
