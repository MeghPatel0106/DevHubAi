import mongoose from 'mongoose';
import config from './config/default.js';
import connectDB from './config/db.js';

async function auditDatabase() {
  let conn = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      conn = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      if (conn) break;
    } catch (e) {
      console.warn(`Connection attempt ${attempt} failed: ${e.message}. Retrying in 1s...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!conn) {
    console.error('Could not connect to MongoDB after 3 attempts.');
    return;
  }

  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const collNames = collections.map((c) => c.name);
  console.log('Active Collections:', collNames.sort().join(', '));

  const users = await db.collection('users').find({}).sort({ createdAt: 1 }).toArray();
  console.log(`\nTotal Users Registered: ${users.length}\n`);

  const results = [];

  for (const user of users) {
    const userId = user._id;

    // Check records in each collection referencing this user
    const [
      profilesCount,
      projectsCount,
      skillsCount,
      certificatesCount,
      resumesCount,
      applicationsCount,
      aiAnalysesCount,
      careerGoalsCount,
      recruiterProfilesCount,
      shortlistsAsRecruiter,
      shortlistsAsDeveloper,
      recruiterNotesAsRecruiter,
      recruiterNotesAsDeveloper,
    ] = await Promise.all([
      db.collection('profiles').countDocuments({ user: userId }),
      db.collection('projects').countDocuments({ user: userId }),
      db.collection('skills').countDocuments({ user: userId }),
      db.collection('certificates').countDocuments({ user: userId }),
      db.collection('resumes').countDocuments({ user: userId }),
      db.collection('jobapplications').countDocuments({ user: userId }),
      db.collection('aianalyses').countDocuments({ user: userId }),
      db.collection('careergoals').countDocuments({ user: userId }),
      db.collection('recruiterprofiles').countDocuments({ user: userId }),
      db.collection('shortlists').countDocuments({ recruiter: userId }),
      db.collection('shortlists').countDocuments({ developer: userId }),
      db.collection('recruiternotes').countDocuments({ recruiter: userId }),
      db.collection('recruiternotes').countDocuments({ developer: userId }),
    ]);

    // Check if this looks like an automated/test/dummy account or real account
    const isTestPattern =
      user.email.includes('_1787') ||
      user.email.startsWith('devtester_') ||
      user.email.startsWith('user2_') ||
      user.email.startsWith('attacker_') ||
      user.email.startsWith('elena.rostova_') ||
      user.email.startsWith('qa_user_') ||
      user.email.startsWith('dev_p11_') ||
      user.email.startsWith('reca_p11_') ||
      user.email.startsWith('recb_p11_') ||
      user.email.startsWith('dev_reg_') ||
      user.email.startsWith('rec_reg_') ||
      user.email === 'alex.developer@devhub.ai';

    results.push({
      id: userId.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isLikelyDummyOrTest: isTestPattern,
      counts: {
        profiles: profilesCount,
        projects: projectsCount,
        skills: skillsCount,
        certificates: certificatesCount,
        resumes: resumesCount,
        jobApplications: applicationsCount,
        aiAnalyses: aiAnalysesCount,
        careerGoals: careerGoalsCount,
        recruiterProfiles: recruiterProfilesCount,
        shortlists: shortlistsAsRecruiter + shortlistsAsDeveloper,
        recruiterNotes: recruiterNotesAsRecruiter + recruiterNotesAsDeveloper,
      },
    });
  }

  // Check orphaned records (records whose user ObjectId is not in users table)
  const validUserIds = users.map((u) => u._id);
  const [
    orphanProfiles,
    orphanProjects,
    orphanSkills,
    orphanCertificates,
    orphanResumes,
    orphanJobApplications,
    orphanAIAnalyses,
    orphanCareerGoals,
    orphanRecruiterProfiles,
    orphanShortlists,
    orphanRecruiterNotes,
  ] = await Promise.all([
    db.collection('profiles').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('projects').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('skills').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('certificates').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('resumes').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('jobapplications').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('aianalyses').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('careergoals').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('recruiterprofiles').countDocuments({ user: { $nin: validUserIds } }),
    db.collection('shortlists').countDocuments({
      $or: [{ recruiter: { $nin: validUserIds } }, { developer: { $nin: validUserIds } }],
    }),
    db.collection('recruiternotes').countDocuments({
      $or: [{ recruiter: { $nin: validUserIds } }, { developer: { $nin: validUserIds } }],
    }),
  ]);

  console.log('=== USER AUDIT REPORT ===\n');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n=== ORPHANED RECORDS REPORT ===');
  console.log({
    orphanProfiles,
    orphanProjects,
    orphanSkills,
    orphanCertificates,
    orphanResumes,
    orphanJobApplications,
    orphanAIAnalyses,
    orphanCareerGoals,
    orphanRecruiterProfiles,
    orphanShortlists,
    orphanRecruiterNotes,
  });

  await mongoose.disconnect();
}

auditDatabase().catch(console.error);
