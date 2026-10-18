import mongoose from 'mongoose';
import config from './config/default.js';

const mongoURI = config.mongoUri;

async function check() {
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('Connected to MongoDB');

  const allUsers = await mongoose.connection.db.collection('users').find({}).sort({ createdAt: -1 }).limit(30).toArray();
  console.log(`Total users found: ${allUsers.length}`);
  allUsers.forEach((u) => {
    console.log(`- ID: ${u._id}, Name: "${u.name}", Email: "${u.email}", Role: "${u.role}", CreatedAt: ${u.createdAt}`);
  });

  const recruiterProfiles = await mongoose.connection.db.collection('recruiterprofiles').find({}).toArray();
  console.log('\nRecruiter profiles count:', recruiterProfiles.length);
  recruiterProfiles.forEach((rp) => {
    console.log(`- Recruiter user: ${rp.user}, Company: "${rp.companyName}", Title: "${rp.jobTitle}"`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
