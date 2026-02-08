const mongoose = require('mongoose');

const User = require('../models/User');
const { hashPassword } = require('./bcrypt');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log(`Database connected!`);

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        let newAdmin = new User({
            name: 'Hoàng Mai Công Đạt',
            phone: '0982785306',
            email: 'hmcdat@gmail.com',
            role: 'admin',
            username: 'admin',
            password: await hashPassword('hmcdat@123'),
            enabled: true,
        });
        await newAdmin.save();
        console.log(`Admin user created with email: ${newAdmin.email}`);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
