import mongoose from 'mongoose';
import config from './config/default.js';

import User from './models/User.js';
import Profile from './models/Profile.js';
import Project from './models/Project.js';
import Skill from './models/Skill.js';
import Certificate from './models/Certificate.js';
import Resume from './models/Resume.js';
import JobApplication from './models/JobApplication.js';
import AIAnalysis from './models/AIAnalysis.js';
import CareerGoal from './models/CareerGoal.js';
import RecruiterProfile from './models/RecruiterProfile.js';
import Shortlist from './models/Shortlist.js';
import RecruiterNote from './models/RecruiterNote.js';

async function cleanProductionDatabase() {
  console.log('==================================================');
  console.log('🧹 DEVHUB AI: PRODUCTION DATABASE CLEANUP');
  console.log('==================================================\n');

  let connected = false;
  for (let i = 1; i <= 5; i++) {
    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 8000,
        tls: true,
      });
      connected = true;
      console.log('Connected to MongoDB Atlas.\n');
      break;
    } catch (err) {
      console.warn(`Connection attempt ${i}/5 failed (${err.message}). Retrying in 1s...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!connected) {
    throw new Error('Unable to connect to MongoDB Atlas cluster after 5 attempts');
  }

  // 1. Identify preserved real accounts
  const preservedEmails = ['megh2850@gmail.com', 'krisha@123gmail.com'];
  console.log('🛡️ Preserved Real Accounts to KEEP:', preservedEmails.join(', '));

  // 2. Query all users
  const allUsers = await User.find({}).lean();
  console.log(`Total users in DB before cleanup: ${allUsers.length}`);

  // 3. Filter dummy/test users
  const dummyUsers = allUsers.filter((u) => {
    const email = (u.email || '').toLowerCase().trim();
    if (preservedEmails.includes(email)) return false;

    return (
      email.includes('_1787') ||
      email.startsWith('devtester_') ||
      email.startsWith('user2_') ||
      email.startsWith('attacker_') ||
      email.startsWith('elena.rostova_') ||
      email.startsWith('qa_user_') ||
      email.startsWith('dev_p11_') ||
      email.startsWith('reca_p11_') ||
      email.startsWith('recb_p11_') ||
      email.startsWith('dev_reg_') ||
      email.startsWith('rec_reg_') ||
      email === 'alex.developer@devhub.ai' ||
      email.endsWith('@test.com') ||
      email.endsWith('@example.com')
    );
  });

  const dummyUserIds = dummyUsers.map((u) => u._id);
  console.log(`Found ${dummyUserIds.length} dummy/test accounts to remove:\n`);
  dummyUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. [${u.role}] ${u.name} <${u.email}> (${u._id})`);
  });

  if (dummyUserIds.length === 0) {
    console.log('\nNo dummy users found to delete.');
    await mongoose.disconnect();
    return;
  }

  console.log('\n--- Executing Targeted Deletions ---');

  // Delete all child records for dummy users
  const [
    delProfiles,
    delProjects,
    delSkills,
    delCerts,
    delResumes,
    delJobs,
    delAI,
    delGoals,
    delRecProfiles,
    delShortlists,
    delNotes,
    delUsers,
  ] = await Promise.all([
    Profile.deleteMany({ user: { $in: dummyUserIds } }),
    Project.deleteMany({ user: { $in: dummyUserIds } }),
    Skill.deleteMany({ user: { $in: dummyUserIds } }),
    Certificate.deleteMany({ user: { $in: dummyUserIds } }),
    Resume.deleteMany({ user: { $in: dummyUserIds } }),
    JobApplication.deleteMany({ user: { $in: dummyUserIds } }),
    AIAnalysis.deleteMany({ user: { $in: dummyUserIds } }),
    CareerGoal.deleteMany({ user: { $in: dummyUserIds } }),
    RecruiterProfile.deleteMany({ user: { $in: dummyUserIds } }),
    Shortlist.deleteMany({
      $or: [{ recruiter: { $in: dummyUserIds } }, { developer: { $in: dummyUserIds } }],
    }),
    RecruiterNote.deleteMany({
      $or: [{ recruiter: { $in: dummyUserIds } }, { developer: { $in: dummyUserIds } }],
    }),
    User.deleteMany({ _id: { $in: dummyUserIds } }),
  ]);

  console.log(`✅ Deleted Users:             ${delUsers.deletedCount}`);
  console.log(`✅ Deleted Profiles:          ${delProfiles.deletedCount}`);
  console.log(`✅ Deleted Projects:          ${delProjects.deletedCount}`);
  console.log(`✅ Deleted Skills:            ${delSkills.deletedCount}`);
  console.log(`✅ Deleted Certificates:      ${delCerts.deletedCount}`);
  console.log(`✅ Deleted Resumes:           ${delResumes.deletedCount}`);
  console.log(`✅ Deleted Job Applications:  ${delJobs.deletedCount}`);
  console.log(`✅ Deleted AI Analyses:       ${delAI.deletedCount}`);
  console.log(`✅ Deleted Career Goals:      ${delGoals.deletedCount}`);
  console.log(`✅ Deleted Recruiter Profiles:${delRecProfiles.deletedCount}`);
  console.log(`✅ Deleted Shortlists:        ${delShortlists.deletedCount}`);
  console.log(`✅ Deleted Recruiter Notes:   ${delNotes.deletedCount}`);

  // 4. Orphan Cleanup (check for any unreferenced records)
  console.log('\n--- Checking for Orphan Records ---');
  const remainingUsers = await User.find({}).lean();
  const remainingUserIds = remainingUsers.map((u) => u._id);

  const [
    orphanProfiles,
    orphanProjects,
    orphanSkills,
    orphanCerts,
    orphanResumes,
    orphanJobs,
    orphanAI,
    orphanGoals,
    orphanRecProfiles,
    orphanShortlists,
    orphanNotes,
  ] = await Promise.all([
    Profile.deleteMany({ user: { $nin: remainingUserIds } }),
    Project.deleteMany({ user: { $nin: remainingUserIds } }),
    Skill.deleteMany({ user: { $nin: remainingUserIds } }),
    Certificate.deleteMany({ user: { $nin: remainingUserIds } }),
    Resume.deleteMany({ user: { $nin: remainingUserIds } }),
    JobApplication.deleteMany({ user: { $nin: remainingUserIds } }),
    AIAnalysis.deleteMany({ user: { $nin: remainingUserIds } }),
    CareerGoal.deleteMany({ user: { $nin: remainingUserIds } }),
    RecruiterProfile.deleteMany({ user: { $nin: remainingUserIds } }),
    Shortlist.deleteMany({
      $or: [{ recruiter: { $nin: remainingUserIds } }, { developer: { $nin: remainingUserIds } }],
    }),
    RecruiterNote.deleteMany({
      $or: [{ recruiter: { $nin: remainingUserIds } }, { developer: { $nin: remainingUserIds } }],
    }),
  ]);

  console.log(`🧹 Cleaned Orphan Profiles:          ${orphanProfiles.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Projects:          ${orphanProjects.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Skills:            ${orphanSkills.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Certificates:      ${orphanCerts.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Resumes:           ${orphanResumes.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Job Applications:  ${orphanJobs.deletedCount}`);
  console.log(`🧹 Cleaned Orphan AI Analyses:       ${orphanAI.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Career Goals:      ${orphanGoals.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Recruiter Profiles:${orphanRecProfiles.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Shortlists:        ${orphanShortlists.deletedCount}`);
  console.log(`🧹 Cleaned Orphan Recruiter Notes:   ${orphanNotes.deletedCount}`);

  // 5. Final State Verification
  console.log('\n--- Final Database State ---');
  const finalUsers = await User.find({}).lean();
  console.log(`Remaining Real Users in Database (${finalUsers.length}):`);
  finalUsers.forEach((u, i) => {
    console.log(`  ${i + 1}. [${u.role}] ${u.name} <${u.email}> (${u._id})`);
  });

  await mongoose.disconnect();
  console.log('\n✨ Database cleanup complete! Clean production state achieved.\n');
}

cleanProductionDatabase().catch((err) => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
