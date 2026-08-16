import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { config, validateEnv } from '../config/env.js';

validateEnv();

const seedAdmin = async () => {
  const email = process.argv[2] || 'alphacutagency@gmail.com';
  const password = process.argv[3] || 'AlphaCutAdmin2026!';
  const name = process.argv[4] || 'Aymen Admin';

  if (!config.mongoUri) {
    console.error('Error: MONGODB_URI is required to seed admin user.');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB Atlas...');

    let user = await User.findOne({ email: email.toLowerCase() });
    const passwordHash = await bcrypt.hash(password, 12);

    if (user) {
      user.name = user.name || name;
      user.role = 'admin';
      user.passwordHash = passwordHash;
      user.emailVerified = true;
      await user.save();
      console.log(`Updated existing user ${email} to admin role with verified email.`);
    } else {
      user = await User.create({
        name: name || 'Aymen Admin',
        email: email.toLowerCase(),
        passwordHash,
        authProvider: 'local',
        role: 'admin',
        emailVerified: true,
      });
      console.log(`Created new Admin user ${email} successfully.`);
    }

    await mongoose.disconnect();
    console.log('Admin seeding process complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed Admin Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
