// backend/createAdmin.cjs
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User Schema (defined here to avoid import issues)
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'MExecutive'], required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Admin credentials
const adminData = {
  userId: 'admin',
  password: 'admin123',
  role: 'admin',
  location: 'Headquarters'
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livarise';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ userId: adminData.userId });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📋 Admin details:');
      console.log(`   User ID: ${existingAdmin.userId}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Location: ${existingAdmin.location}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Create admin user
    const admin = new User({
      userId: adminData.userId,
      password: hashedPassword,
      role: adminData.role,
      location: adminData.location,
      createdAt: new Date()
    });

    await admin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   ═══════════════════════════════════');
    console.log(`   User ID: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    console.log(`   Location: Headquarters`);
    console.log('   ═══════════════════════════════════');
    console.log('\n⚠️  Please change the password after first login for security!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdmin();
};

run();