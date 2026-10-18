import mongoose from 'mongoose';
import config from './config/default.js';
import connectDB from './config/db.js';

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

async function seedDemoData() {
  console.log('🌱 Connecting to database for demo seeding...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Could not connect to database.');
    process.exit(1);
  }

  // 1. Create or update Alex Developer demo account
  const demoEmail = 'alex.developer@devhub.ai';
  let demoUser = await User.findOne({ email: demoEmail }).select('+password');

  if (!demoUser) {
    demoUser = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      password: 'password123',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
    console.log('✅ Created demo developer user:', demoUser.email);
  } else {
    demoUser.password = 'password123';
    demoUser.name = 'Alex Morgan';
    await demoUser.save();
    console.log('✅ Updated demo developer password/info for:', demoUser.email);
  }

  const userId = demoUser._id;

  // 2. Seed Developer Profile
  let profile = await Profile.findOne({ user: userId });
  const profilePayload = {
    user: userId,
    fullName: 'Alex Morgan',
    username: 'alex-morgan',
    portfolioSlug: 'alex-morgan',
    headline: 'Senior Full-Stack Engineer & Distributed Systems Architect',
    bio: 'Passionate full-stack developer with 5+ years of experience engineering high-throughput distributed applications, modern web interfaces, and AI-assisted developer platforms.',
    location: 'San Francisco, CA (Open to Remote)',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    website: 'https://alexmorgan.dev',
    personalWebsite: 'https://alexmorgan.dev',
    github: 'https://github.com/alexmorgan-dev',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    twitter: 'https://twitter.com/alexmorgan_dev',
    currentRole: 'Senior Full-Stack Engineer',
    yearsOfExperience: 5,
    preferredRole: 'Senior Software Engineer / Lead Architect',
    preferredLocation: 'Remote or San Francisco',
    isPublic: true,
    recruiterDiscoverable: true,
    githubConnected: true,
    githubUsername: 'alexmorgan-dev',
    githubShowOnPortfolio: true,
    experience: [
      {
        company: 'CloudSphere Technologies',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA (Hybrid)',
        startDate: new Date('2023-01-15'),
        current: true,
        description: 'Led architecture and development of high-scale real-time API services serving 2M+ monthly active developers. Reduced latency by 42% through Redis caching and query optimization.',
        technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker', 'AWS'],
      },
      {
        company: 'NovaCore Solutions',
        position: 'Full Stack Engineer',
        location: 'Remote',
        startDate: new Date('2021-03-01'),
        endDate: new Date('2022-12-31'),
        current: false,
        description: 'Built responsive web applications, payment integrations, and ATS analytics workflows. Spearheaded automated testing reaching 90%+ code coverage.',
        technologies: ['React', 'Next.js', 'Express', 'PostgreSQL', 'Stripe API', 'TailwindCSS'],
      },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science (B.S.)',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2021-05-30'),
        current: false,
        grade: '3.85 GPA',
        activities: 'ACM Chapter Lead, Hackathon Organizer',
      },
    ],
  };

  if (!profile) {
    profile = await Profile.create(profilePayload);
  } else {
    Object.assign(profile, profilePayload);
    await profile.save();
  }

  if (profile.calculateCompletion) {
    profile.calculateCompletion();
    await profile.save();
  }
  console.log('✅ Seeded developer profile with completion score:', profile.profileCompletion);

  // 3. Seed Projects
  const existingProjects = await Project.find({ user: userId });
  if (existingProjects.length === 0) {
    await Project.insertMany([
      {
        user: userId,
        title: 'DevHub AI - Career & Portfolio Management',
        description: 'A comprehensive, AI-powered career platform for developers to manage verified portfolios, track job applications, optimize resumes, and showcase live engineering telemetry.',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Vite'],
        category: 'Full Stack',
        githubUrl: 'https://github.com/alexmorgan-dev/devhub-ai',
        liveUrl: 'https://devhubai.app',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        featured: true,
        isPublic: true,
        status: 'completed',
      },
      {
        user: userId,
        title: 'CloudScale - Distributed Analytics Engine',
        description: 'Real-time telemetry pipeline processing 50k events/sec with sub-second dashboard rendering, automated alerting, and anomaly detection.',
        technologies: ['TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'Docker', 'Chart.js'],
        category: 'Backend',
        githubUrl: 'https://github.com/alexmorgan-dev/cloudscale-analytics',
        liveUrl: 'https://cloudscale-demo.io',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        featured: true,
        isPublic: true,
        status: 'completed',
      },
      {
        user: userId,
        title: 'NeuralDesign - AI Design System Generator',
        description: 'Interactive component playground and theme tokens generator with automated WCAG accessibility auditing and instant code exports.',
        technologies: ['React', 'CSS Modules', 'OpenAI API', 'Vite', 'Storybook'],
        category: 'Frontend',
        githubUrl: 'https://github.com/alexmorgan-dev/neural-design',
        liveUrl: 'https://neuraldesign.dev',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        featured: false,
        isPublic: true,
        status: 'in-progress',
      },
    ]);
    console.log('✅ Seeded sample projects');
  }

  // 4. Seed Skills
  const existingSkills = await Skill.find({ user: userId });
  if (existingSkills.length === 0) {
    await Skill.insertMany([
      { user: userId, name: 'JavaScript / ES6+', category: 'Programming', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
      { user: userId, name: 'TypeScript', category: 'Programming', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
      { user: userId, name: 'React.js', category: 'Frontend', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
      { user: userId, name: 'Node.js & Express', category: 'Backend', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
      { user: userId, name: 'MongoDB & Mongoose', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
      { user: userId, name: 'PostgreSQL', category: 'Database', proficiency: 'Intermediate', yearsOfExperience: 3, verified: true },
      { user: userId, name: 'Docker & Containers', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 3, verified: true },
      { user: userId, name: 'AWS Cloud Services', category: 'Cloud', proficiency: 'Intermediate', yearsOfExperience: 3, verified: true },
      { user: userId, name: 'REST & GraphQL APIs', category: 'Backend', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
      { user: userId, name: 'Git & GitHub CI/CD', category: 'Tools', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
    ]);
    console.log('✅ Seeded technical skills matrix');
  }

  // 5. Seed Certificates
  const existingCerts = await Certificate.find({ user: userId });
  if (existingCerts.length === 0) {
    await Certificate.insertMany([
      {
        user: userId,
        title: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services (AWS)',
        issueDate: new Date('2024-04-10'),
        expiryDate: new Date('2027-04-10'),
        credentialId: 'AWS-SAA-88492019',
        credentialUrl: 'https://aws.amazon.com/verification',
        certificateImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
      },
      {
        user: userId,
        title: 'Meta Full-Stack Professional Certificate',
        issuer: 'Meta / Coursera',
        issueDate: new Date('2023-08-20'),
        credentialId: 'META-FS-942851',
        credentialUrl: 'https://coursera.org/verify/professional-cert',
        certificateImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
      },
    ]);
    console.log('✅ Seeded verified certificates');
  }

  // 6. Seed Resume
  const existingResume = await Resume.findOne({ user: userId });
  if (!existingResume) {
    await Resume.create({
      user: userId,
      title: 'Senior Full-Stack Software Engineer',
      template: 'modern',
      isDefault: true,
      personal: {
        fullName: 'Alex Morgan',
        headline: 'Senior Full-Stack Engineer',
        email: demoEmail,
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA (Remote)',
        website: 'https://alexmorgan.dev',
        github: 'https://github.com/alexmorgan-dev',
        linkedin: 'https://linkedin.com/in/alexmorgan-dev',
      },
      summary: 'Results-driven Senior Full-Stack Engineer with 5+ years of expertise architecting high-availability distributed web applications, resilient backend microservices, and reactive user interfaces.',
      skills: ['JavaScript (ES6+)', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'CI/CD'],
      experience: [
        {
          company: 'CloudSphere Technologies',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2023',
          endDate: 'Present',
          description: 'Architected high-throughput microservices using Node.js and MongoDB. Decreased API response times by 42% and mentored a team of 6 engineers.',
        },
        {
          company: 'NovaCore Solutions',
          position: 'Full Stack Engineer',
          location: 'Remote',
          startDate: '2021',
          endDate: '2023',
          description: 'Built scalable web dashboards and unified payment processing for enterprise clients.',
        },
      ],
      education: [
        {
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science (B.S.)',
          fieldOfStudy: 'Computer Science',
          year: '2021',
        },
      ],
      projects: [
        {
          title: 'DevHub AI - Career Platform',
          description: 'Full-stack platform for developer career management and portfolio publishing.',
          technologies: 'React, Node.js, Express, MongoDB, JWT',
          liveUrl: 'https://devhubai.app',
          githubUrl: 'https://github.com/alexmorgan-dev/devhub-ai',
        },
      ],
      certifications: [
        {
          title: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
        },
      ],
    });
    console.log('✅ Seeded primary developer resume');
  }

  // 7. Seed Job Applications
  const existingApps = await JobApplication.find({ user: userId });
  if (existingApps.length === 0) {
    await JobApplication.insertMany([
      {
        user: userId,
        company: 'Stripe',
        position: 'Senior Full Stack Engineer, Developer Infrastructure',
        jobTitle: 'Senior Full Stack Engineer, Developer Infrastructure',
        location: 'San Francisco / Remote',
        jobUrl: 'https://stripe.com/jobs',
        workMode: 'Remote',
        employmentType: 'Full-time',
        status: 'Interview',
        appliedDate: new Date('2026-09-15'),
        interviewDate: new Date('2026-10-12'),
        salary: '$180,000 - $210,000 + Equity',
        contactPerson: 'David Chen (Engineering Manager)',
        contactEmail: 'david.chen@stripe.com',
        source: 'Referral',
        notes: 'Round 2 Technical Architecture Interview scheduled. Prepare system design for real-time webhooks delivery.',
      },
      {
        user: userId,
        company: 'Vercel',
        position: 'Frontend Systems Engineer',
        jobTitle: 'Frontend Systems Engineer',
        location: 'Remote',
        jobUrl: 'https://vercel.com/careers',
        workMode: 'Remote',
        employmentType: 'Full-time',
        status: 'Screening',
        appliedDate: new Date('2026-09-22'),
        interviewDate: new Date('2026-10-15'),
        salary: '$175,000 - $195,000',
        contactPerson: 'Sarah Jenkins (Recruiter)',
        contactEmail: 'sarah.j@vercel.com',
        source: 'Company Careers Page',
        notes: 'Recruiter phone screen passed. Take-home framework performance review next.',
      },
      {
        user: userId,
        company: 'Netflix',
        position: 'Software Engineer - Studio Workflows',
        jobTitle: 'Software Engineer - Studio Workflows',
        location: 'Los Gatos, CA / Hybrid',
        jobUrl: 'https://jobs.netflix.com',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        status: 'Applied',
        appliedDate: new Date('2026-09-28'),
        salary: '$220,000 - $250,000 all-cash',
        source: 'LinkedIn Jobs',
        notes: 'Submitted customized resume highlighting Node.js microservices and video asset metadata processing.',
      },
      {
        user: userId,
        company: 'Linear',
        position: 'Full Stack Product Engineer',
        jobTitle: 'Full Stack Product Engineer',
        location: 'Remote',
        jobUrl: 'https://linear.app/careers',
        workMode: 'Remote',
        employmentType: 'Full-time',
        status: 'Wishlist',
        appliedDate: new Date('2026-10-01'),
        salary: '$170,000 - $200,000 + Equity',
        source: 'Twitter / X',
        notes: 'Preparing portfolio showcasing keyboard shortcuts and optimistic UI mutations.',
      },
    ]);
    console.log('✅ Seeded tracked job applications');
  }

  // 8. Seed Recruiter Demo Account
  const recruiterEmail = 'sarah.recruiter@technova.com';
  let recruiterUser = await User.findOne({ email: recruiterEmail });
  if (!recruiterUser) {
    recruiterUser = await User.create({
      name: 'Sarah Patel',
      email: recruiterEmail,
      password: 'password123',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    });
    console.log('✅ Created demo recruiter user:', recruiterUser.email);
  }

  let recProfile = await RecruiterProfile.findOne({ user: recruiterUser._id });
  if (!recProfile) {
    recProfile = await RecruiterProfile.create({
      user: recruiterUser._id,
      fullName: 'Sarah Patel',
      companyName: 'TechNova Global',
      jobTitle: 'Lead Technical Talent Partner',
      companyWebsite: 'https://technova.com',
      linkedinUrl: 'https://linkedin.com/in/sarah-patel-talent',
      bio: 'Leading technical recruitment across Cloud, Full-Stack, and AI infrastructure teams at TechNova Global.',
    });
    console.log('✅ Created demo recruiter profile');
  }

  console.log('\n🎉 Demo accounts and initial data seeded successfully!');
  await mongoose.disconnect();
}

seedDemoData().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
