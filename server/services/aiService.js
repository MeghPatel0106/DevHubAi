import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Resume from '../models/Resume.js';
import Certificate from '../models/Certificate.js';
import JobApplication from '../models/JobApplication.js';
import CareerGoal from '../models/CareerGoal.js';
import User from '../models/User.js';

// Benchmark skill expectations by target role
const ROLE_SKILL_BENCHMARKS = {
  'Full Stack Developer': [
    { name: 'React', priority: 'High', reason: 'Industry standard for modern interactive user interfaces', learning: 'Build component trees with custom hooks and context state management.' },
    { name: 'Node.js', priority: 'High', reason: 'Core server-side JavaScript runtime powering backend services', learning: 'Implement RESTful APIs with Express, middleware, and async error handling.' },
    { name: 'TypeScript', priority: 'High', reason: 'Type safety and enterprise code maintainability', learning: 'Migrate React and Node codebases to strict TypeScript.' },
    { name: 'MongoDB', priority: 'Medium', reason: 'Popular document database for rapid JSON data persistence', learning: 'Master Mongoose schemas, compound indexes, and aggregation pipelines.' },
    { name: 'PostgreSQL', priority: 'High', reason: 'Standard relational database for structured and transactional data', learning: 'Learn relational schemas, joins, indexing, and ORMs like Prisma.' },
    { name: 'Docker', priority: 'High', reason: 'Containerization is essential for consistent development and deployment', learning: 'Write multi-stage Dockerfiles and compose microservices with Docker Compose.' },
    { name: 'REST APIs', priority: 'High', reason: 'Standard protocol for client-server communication', learning: 'Design clean REST endpoints with proper HTTP status codes, validation, and JWT auth.' },
    { name: 'CI/CD', priority: 'Medium', reason: 'Automated testing and continuous delivery pipelines', learning: 'Configure GitHub Actions workflows for automated linting, testing, and deployment.' },
    { name: 'Testing', priority: 'Medium', reason: 'Ensures system reliability and regression prevention', learning: 'Write unit and integration tests using Jest, Vitest, and Supertest.' },
    { name: 'System Design', priority: 'Medium', reason: 'Crucial for scaling web architectures and technical interviews', learning: 'Study caching strategies (Redis), load balancing, database replication, and rate limiting.' },
  ],
  'Frontend Developer': [
    { name: 'React', priority: 'High', reason: 'Core frontend library for modern dynamic web applications', learning: 'Master React 18/19 hooks, component composition, and memoization.' },
    { name: 'TypeScript', priority: 'High', reason: 'Essential for scalable, bug-free frontend codebases', learning: 'Type complex props, async API responses, and global state managers.' },
    { name: 'CSS3 / Tailwind', priority: 'High', reason: 'Responsive design and modern layout systems', learning: 'Build fluid layouts with Flexbox, CSS Grid, and responsive breakpoints.' },
    { name: 'Next.js', priority: 'High', reason: 'Leading React framework for SSR, SSG, and SEO optimization', learning: 'Learn App Router, Server Components, dynamic routes, and caching.' },
    { name: 'State Management', priority: 'Medium', reason: 'Handling global application state across complex views', learning: 'Learn Zustand, Redux Toolkit, or React Context patterns.' },
    { name: 'Web Performance', priority: 'Medium', reason: 'Crucial for smooth user experience and Core Web Vitals', learning: 'Implement lazy loading, image optimization, code splitting, and bundle analysis.' },
    { name: 'Testing / Vitest', priority: 'Medium', reason: 'Validating component behavior and user interactions', learning: 'Write tests with React Testing Library and Vitest.' },
    { name: 'Git', priority: 'High', reason: 'Standard version control for engineering teams', learning: 'Master branching workflows, pull request reviews, and rebasing.' },
  ],
  'Backend Developer': [
    { name: 'Node.js', priority: 'High', reason: 'High-throughput asynchronous server runtime', learning: 'Master event loop mechanics, streaming, and clustering.' },
    { name: 'PostgreSQL', priority: 'High', reason: 'Enterprise relational database for structured business data', learning: 'Study ACID transactions, indexing strategies, and query optimization.' },
    { name: 'MongoDB', priority: 'Medium', reason: 'Document database for flexible, schema-free storage', learning: 'Design scalable schemas and execute aggregation pipelines.' },
    { name: 'Redis', priority: 'High', reason: 'In-memory data store for caching and rate limiting', learning: 'Implement caching layers, session management, and pub/sub message brokers.' },
    { name: 'Docker', priority: 'High', reason: 'Containerizing backend services for production parity', learning: 'Containerize Node/Python services and configure production environment variables.' },
    { name: 'System Design', priority: 'High', reason: 'Designing fault-tolerant, scalable distributed systems', learning: 'Study horizontal scaling, load balancing, message queues (RabbitMQ/Kafka), and sharding.' },
    { name: 'API Security', priority: 'High', reason: 'Protecting user data and preventing common vulnerabilities', learning: 'Implement JWT refresh tokens, CORS, helmet, rate limiters, and input sanitization.' },
    { name: 'CI/CD & Cloud', priority: 'Medium', reason: 'Automated deployment to cloud providers', learning: 'Deploy containerized services to AWS ECS, Render, or Railway with GitHub Actions.' },
  ],
  'DevOps Engineer': [
    { name: 'Docker', priority: 'High', reason: 'Containerization standard across software engineering', learning: 'Create lightweight multi-stage builds and optimize container security.' },
    { name: 'Kubernetes', priority: 'High', reason: 'Container orchestration for enterprise clusters', learning: 'Deploy Pods, Deployments, Services, and Ingress controllers.' },
    { name: 'CI/CD Pipelines', priority: 'High', reason: 'Automating build, test, and release cycles', learning: 'Construct robust GitHub Actions / GitLab CI pipelines with secret management.' },
    { name: 'Linux', priority: 'High', reason: 'Primary operating system for cloud servers and containers', learning: 'Master bash scripting, systemd services, permissions, and network troubleshooting.' },
    { name: 'Terraform / IaC', priority: 'High', reason: 'Infrastructure as Code for automated cloud provisioning', learning: 'Write declarative infrastructure configs for AWS/GCP resources.' },
    { name: 'Monitoring & Metrics', priority: 'Medium', reason: 'System observability and proactive incident detection', learning: 'Set up Prometheus, Grafana, and structured logging.' },
    { name: 'AWS / Cloud', priority: 'High', reason: 'Leading public cloud infrastructure platform', learning: 'Configure VPCs, IAM roles, EC2, S3, and serverless Lambda functions.' },
  ],
  'Data Scientist': [
    { name: 'Python', priority: 'High', reason: 'Primary language for data manipulation and modeling', learning: 'Master functional programming, list comprehensions, and data structures in Python.' },
    { name: 'Pandas & NumPy', priority: 'High', reason: 'Standard libraries for array computing and tabular data analysis', learning: 'Perform complex data transformations, grouping, and aggregations.' },
    { name: 'SQL', priority: 'High', reason: 'Querying relational data warehouses and analytics databases', learning: 'Master window functions, CTEs, complex subqueries, and execution plans.' },
    { name: 'Scikit-Learn', priority: 'High', reason: 'Classical machine learning models and feature engineering', learning: 'Build regression, classification, and clustering pipelines with cross-validation.' },
    { name: 'Data Visualization', priority: 'Medium', reason: 'Communicating data insights clearly to stakeholders', learning: 'Create interactive charts and dashboards with Matplotlib, Seaborn, and Plotly.' },
    { name: 'Statistics & Math', priority: 'High', reason: 'Theoretical foundation for hypothesis testing and modeling', learning: 'Study probability distributions, A/B testing, and regression analysis.' },
  ],
  'ML Engineer': [
    { name: 'Python', priority: 'High', reason: 'Core language for machine learning and deep learning pipelines', learning: 'Write clean, vectorized numerical Python code.' },
    { name: 'PyTorch / TensorFlow', priority: 'High', reason: 'Deep learning frameworks for neural network training', learning: 'Train convolutional and transformer models from scratch or fine-tune.' },
    { name: 'MLOps', priority: 'High', reason: 'Operationalizing and monitoring ML models in production', learning: 'Use MLflow for experiment tracking and model registries.' },
    { name: 'FastAPI / Model Serving', priority: 'High', reason: 'Deploying low-latency inference APIs', learning: 'Package models into asynchronous FastAPI services containerized with Docker.' },
    { name: 'Docker', priority: 'High', reason: 'Reproducible GPU and CPU model training environments', learning: 'Configure CUDA-enabled Docker containers for model execution.' },
    { name: 'SQL & Data Pipelines', priority: 'Medium', reason: 'Extracting and cleaning large feature datasets', learning: 'Build automated feature pipelines and store datasets efficiently.' },
  ],
};

/**
 * Normalize skill string for accurate comparisons
 */
export const normalizeSkillName = (str = '') => {
  const clean = str.trim().toLowerCase();
  const mapping = {
    js: 'javascript',
    ts: 'typescript',
    reactjs: 'react',
    'react.js': 'react',
    nodejs: 'node.js',
    'node js': 'node.js',
    node: 'node.js',
    py: 'python',
    mongo: 'mongodb',
    postgres: 'postgresql',
    dockerized: 'docker',
    k8s: 'kubernetes',
    'rest api': 'rest apis',
    'restful api': 'rest apis',
    'restful apis': 'rest apis',
  };
  return mapping[clean] || clean;
};

/**
 * Gather and sanitize 100% real user data across all DevHub AI modules
 */
export const aggregateUserContext = async (userId) => {
  const [user, profile, skills, projects, resumes, certificates, applications, careerGoal] =
    await Promise.all([
      User.findById(userId).select('name email avatar').lean(),
      Profile.findOne({ user: userId }).lean(),
      Skill.find({ user: userId }).lean(),
      Project.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      Resume.find({ user: userId }).sort({ updatedAt: -1 }).lean(),
      Certificate.find({ user: userId }).lean(),
      JobApplication.find({ user: userId }).lean(),
      CareerGoal.findOne({ user: userId }).lean(),
    ]);

  const defaultResume = resumes?.find((r) => r.isDefault) || resumes?.[0] || null;

  return {
    user: {
      name: user?.name || 'Developer',
      email: user?.email || '',
    },
    profile: {
      fullName: profile?.fullName || user?.name || 'Developer',
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      currentRole: profile?.currentRole || '',
      preferredRole: profile?.preferredRole || '',
      github: profile?.github || '',
      linkedin: profile?.linkedin || '',
      personalWebsite: profile?.personalWebsite || profile?.website || '',
      profileCompletion: profile?.profileCompletion || 20,
      githubConnected: Boolean(profile?.githubConnected),
      githubUsername: profile?.githubUsername || '',
      githubData: profile?.githubData || null,
    },
    skills: (skills || []).map((s) => ({
      name: s.name,
      normalized: normalizeSkillName(s.name),
      category: s.category || 'Technical',
      proficiency: s.proficiency || 'Intermediate',
      verified: Boolean(s.verified),
    })),
    projects: (projects || []).map((p) => ({
      title: p.title,
      description: p.description || '',
      techStack: p.techStack || [],
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || '',
      featured: Boolean(p.featured),
    })),
    experience: profile?.experience || [],
    education: profile?.education || [],
    certificates: (certificates || []).map((c) => ({
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate,
    })),
    resume: defaultResume
      ? {
          title: defaultResume.title,
          summary: defaultResume.summary,
          skillsCount: defaultResume.skills?.length || 0,
          experienceCount: defaultResume.experience?.length || 0,
          projectsCount: defaultResume.projects?.length || 0,
        }
      : null,
    applications: {
      total: applications?.length || 0,
      applied: applications?.filter((a) => a.status === 'Applied').length || 0,
      interviewing: applications?.filter((a) => ['Screening', 'Interview'].includes(a.status)).length || 0,
      offers: applications?.filter((a) => a.status === 'Offer').length || 0,
      rejected: applications?.filter((a) => a.status === 'Rejected').length || 0,
    },
    careerGoal: {
      targetRole: careerGoal?.targetRole || profile?.preferredRole || 'Full Stack Developer',
      experienceLevel: careerGoal?.experienceLevel || 'Junior',
      preferredLocation: careerGoal?.preferredLocation || 'Remote',
      targetIndustry: careerGoal?.targetIndustry || 'SaaS & Web Engineering',
      primaryGoal: careerGoal?.primaryGoal || 'Get first job',
      targetCompanies: careerGoal?.targetCompanies || [],
    },
  };
};

/**
 * Calculate deterministic, real category scores and overall readiness
 */
export const calculateReadinessScores = (context, targetRole = 'Full Stack Developer') => {
  const { profile, skills, projects, experience, resume } = context;

  // 1. Profile Completeness Score (0-100)
  let profileScore = 0;
  if (profile.fullName && profile.fullName.trim()) profileScore += 15;
  if (profile.headline && profile.headline.trim()) profileScore += 20;
  if (profile.bio && profile.bio.trim().length > 20) profileScore += 25;
  if (profile.location && profile.location.trim()) profileScore += 15;
  if (profile.github || profile.linkedin || profile.personalWebsite) profileScore += 15;
  if (profile.yearsOfExperience > 0) profileScore += 10;
  profileScore = Math.min(profileScore, 100);

  // 2. Role-Specific Skills Alignment Score (0-100)
  let skillsScore = 0;
  if (skills.length > 0) {
    const benchmarks = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'];
    const userSkillMap = new Map();
    skills.forEach((s) => {
      userSkillMap.set(s.normalized, s);
    });

    let matchedWeight = 0;
    let totalMaxBenchmarkWeight = 0;

    benchmarks.forEach((bench) => {
      const benchNorm = normalizeSkillName(bench.name);
      const weight = bench.priority === 'High' ? 15 : 10;
      totalMaxBenchmarkWeight += weight;

      if (userSkillMap.has(benchNorm)) {
        const userSkill = userSkillMap.get(benchNorm);
        let earned = weight;
        if (['Advanced', 'Expert'].includes(userSkill.proficiency)) {
          earned += 3;
        }
        if (userSkill.verified) {
          earned += 2;
        }
        matchedWeight += earned;
      }
    });

    const benchmarkRatio = totalMaxBenchmarkWeight > 0 ? matchedWeight / totalMaxBenchmarkWeight : 0;
    skillsScore = Math.round(benchmarkRatio * 85);

    // General breadth bonus for total mapped skills
    const generalBreadthBonus = Math.min(skills.length * 3, 15);
    skillsScore = Math.min(skillsScore + generalBreadthBonus, 100);
  }

  // 3. Projects Depth Score (0-100)
  let projectsScore = 0;
  if (projects.length > 0) {
    if (projects.length === 1) projectsScore += 25;
    else if (projects.length === 2) projectsScore += 45;
    else if (projects.length >= 3) projectsScore += 60;

    const liveDemoCount = projects.filter((p) => p.liveUrl && p.liveUrl.trim()).length;
    const repoCount = projects.filter((p) => p.githubUrl && p.githubUrl.trim()).length;
    const descCount = projects.filter((p) => p.description && p.description.trim().length > 30).length;
    const techStackCount = projects.filter((p) => Array.isArray(p.techStack) && p.techStack.length >= 2).length;

    projectsScore += Math.min(liveDemoCount * 10, 20);
    projectsScore += Math.min(repoCount * 5, 10);
    projectsScore += Math.min(descCount * 5, 10);
    projectsScore += Math.min(techStackCount * 5, 10);

    projectsScore = Math.min(projectsScore, 100);
  }

  // 4. Experience & Credentials Score (0-100)
  let experienceScore = 0;
  if (experience.length > 0 || (context.certificates && context.certificates.length > 0)) {
    if (experience.length === 1) experienceScore += 45;
    else if (experience.length >= 2) experienceScore += 70;

    if (context.certificates && context.certificates.length > 0) {
      experienceScore += Math.min(context.certificates.length * 15, 30);
    }
    experienceScore = Math.min(experienceScore, 100);
  }

  // 5. GitHub Telemetry Score (0-100)
  let githubScore = 0;
  if (profile.githubConnected && profile.githubData) {
    const repos = profile.githubData.metrics?.publicRepos || 0;
    const stars = profile.githubData.metrics?.totalStars || 0;
    const forks = profile.githubData.metrics?.totalForks || 0;

    githubScore += 30;
    if (repos >= 1) githubScore += 15;
    if (repos >= 3) githubScore += 15;
    if (repos >= 6) githubScore += 15;
    if (stars >= 1) githubScore += 15;
    if (stars >= 10 || forks >= 2) githubScore += 10;

    githubScore = Math.min(githubScore, 100);
  }

  // 6. Resume Score (0-100)
  let resumeScore = 0;
  if (resume) {
    resumeScore += 40;
    if (resume.summary && resume.summary.trim().length > 20) resumeScore += 20;
    if (resume.skillsCount >= 3) resumeScore += 20;
    if (resume.projectsCount >= 1 || resume.experienceCount >= 1) resumeScore += 20;
    resumeScore = Math.min(resumeScore, 100);
  }

  // Overall Weighted Score (0-100)
  const overallScore = Math.round(
    profileScore * 0.15 +
      skillsScore * 0.30 +
      projectsScore * 0.25 +
      experienceScore * 0.15 +
      githubScore * 0.08 +
      resumeScore * 0.07
  );

  return {
    overallScore: Math.min(overallScore, 100),
    categoryScores: {
      profile: profileScore,
      skills: skillsScore,
      projects: projectsScore,
      experience: experienceScore,
      github: githubScore,
      resume: resumeScore,
    },
  };
};

/**
 * Generate deep, personalized AI profile analysis and actionable roadmap
 */
export const generateProfileAnalysis = async (context) => {
  const targetRole = context.careerGoal?.targetRole || 'Full Stack Developer';
  const experienceLevel = context.careerGoal?.experienceLevel || 'Junior';
  const { overallScore, categoryScores } = calculateReadinessScores(context, targetRole);

  // Identify skill gaps by comparing normalized user skills against target role benchmarks
  const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'];
  const userSkillNorms = new Set(context.skills.map((s) => s.normalized));

  const skillGaps = [];
  benchmarkSkills.forEach((item) => {
    const norm = normalizeSkillName(item.name);
    if (!userSkillNorms.has(norm)) {
      skillGaps.push({
        skill: item.name,
        priority: item.priority,
        reason: item.reason,
        recommendedLearning: item.learning,
        targetProficiency: item.priority === 'High' ? 'Advanced' : 'Intermediate',
      });
    }
  });

  // Calculate Strengths from actual data
  const strengths = [];
  if (context.skills.length >= 4) {
    const topSkills = context.skills.slice(0, 3).map((s) => s.name).join(', ');
    strengths.push({
      title: 'Strong Technical Foundation',
      description: `Demonstrates verified proficiencies across ${context.skills.length} core technologies including ${topSkills}.`,
      impact: 'Allows rapid onboarding into complex engineering workflows.',
    });
  }
  if (context.projects.length >= 2) {
    strengths.push({
      title: 'Active Portfolio Demonstrations',
      description: `Showcases ${context.projects.length} practical projects with documented tech stacks and architectures.`,
      impact: 'Proves tangible ability to build and deploy functional systems.',
    });
  }
  if (context.profile.githubConnected && (context.profile.githubData?.metrics?.publicRepos || 0) > 0) {
    strengths.push({
      title: 'Verified Open Source Activity',
      description: `Connected GitHub account (@${context.profile.githubUsername}) with ${context.profile.githubData.metrics.publicRepos} public repositories.`,
      impact: 'Signals transparent code quality and engineering passion to hiring managers.',
    });
  }
  if (context.certificates.length > 0) {
    strengths.push({
      title: 'Verified Industry Credentials',
      description: `Possesses ${context.certificates.length} industry certification(s) indicating continuous professional learning.`,
      impact: 'Validates specialized domain knowledge beyond baseline curriculum.',
    });
  }
  if (strengths.length === 0) {
    strengths.push({
      title: 'Clear Career Direction',
      description: `Targeting a ${targetRole} trajectory at ${experienceLevel} level.`,
      impact: 'Provides focus for structured skill acquisition and project building.',
    });
  }

  // Calculate Weaknesses / Improvement Areas from actual data
  const weaknesses = [];
  if (skillGaps.length > 0) {
    const highPriorityGaps = skillGaps.filter((g) => g.priority === 'High').map((g) => g.skill).join(', ');
    if (highPriorityGaps) {
      weaknesses.push({
        title: 'Missing Core Role Technologies',
        description: `Your profile lacks standard technologies expected for a ${targetRole}: ${highPriorityGaps}.`,
        suggestion: 'Build a dedicated showcase project incorporating these specific tools.',
      });
    }
  }
  if (context.projects.length < 2) {
    weaknesses.push({
      title: 'Limited Project Depth',
      description: 'You currently have fewer than 2 showcase projects on your profile.',
      suggestion: 'Add at least 2 full-featured projects with live demo URLs and GitHub repository links.',
    });
  }
  if (!context.profile.githubConnected) {
    weaknesses.push({
      title: 'Unlinked GitHub Telemetry',
      description: 'Your public portfolio does not display verified GitHub code activity.',
      suggestion: 'Connect your public GitHub account in the GitHub Analytics tab to showcase real repositories.',
    });
  }
  if (!context.resume) {
    weaknesses.push({
      title: 'No Active ATS Resume',
      description: 'You have not built or set a default ATS-optimized resume.',
      suggestion: 'Create an ATS resume using the DevHub AI Resume Builder to generate recruiter-ready PDFs.',
    });
  }

  // Career Summary
  const summary = `Based on your profile analysis, you are currently at a ${overallScore}% readiness score for a ${experienceLevel} ${targetRole} role. You demonstrate strong momentum in ${context.skills.slice(0, 3).map((s) => s.name).join(', ') || 'software development fundamentals'}. To become fully competitive for top engineering opportunities, prioritize closing identified gaps in ${skillGaps.slice(0, 2).map((g) => g.skill).join(' and ') || 'system architecture'} and showcasing end-to-end deployed architectures.`;

  // Gap-Filling Project Ideas
  const recommendedProjects = [
    {
      title: `${targetRole.split(' ')[0]} Enterprise Telemetry & Distributed Service`,
      description: `Build a high-throughput backend service with automated CI/CD and caching layers to bridge gaps in ${skillGaps.slice(0, 2).map((g) => g.skill).join(' and ') || 'Docker and PostgreSQL'}.`,
      techStack: [
        skillGaps[0]?.skill || 'TypeScript',
        skillGaps[1]?.skill || 'Docker',
        'PostgreSQL',
        'Redis',
      ],
      fillsGap: `Addresses ${skillGaps.slice(0, 2).map((g) => g.skill).join(', ') || 'containerization & data modeling'}`,
      difficulty: 'Advanced',
    },
    {
      title: 'Full-Stack Real-Time Collaboration Workspace',
      description: 'Develop a responsive web application featuring real-time state synchronization, role-based access control, and automated testing suites.',
      techStack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'Jest'],
      fillsGap: 'Demonstrates concurrency, clean component architecture, and automated test coverage.',
      difficulty: 'Intermediate',
    },
  ];

  // 4-Phase Career Roadmap
  const roadmap = [
    {
      phaseNumber: 1,
      title: 'Solidify Core Stack & Fill Immediate Gaps',
      duration: 'Weeks 1 – 3',
      goals: [
        `Learn and practice ${skillGaps[0]?.skill || 'TypeScript'} fundamentals`,
        'Map all technical proficiencies in DevHub AI Skills Matrix',
        'Complete profile personal details and professional bio',
      ],
      skillsToLearn: skillGaps.slice(0, 2).map((g) => g.skill),
      actionItems: [
        'Complete hands-on tutorials for missing high-priority skills',
        'Refactor existing codebases to strict TypeScript standards',
      ],
    },
    {
      phaseNumber: 2,
      title: 'Build & Deploy Standout Production Project',
      duration: 'Weeks 4 – 7',
      goals: [
        'Architect a multi-container full-stack application with Docker',
        'Implement authentication, database indexing, and caching',
        'Deploy live application to cloud hosting with custom domain',
      ],
      skillsToLearn: ['Docker', 'PostgreSQL', 'CI/CD'],
      actionItems: [
        'Create a GitHub repository with comprehensive README and architecture diagram',
        'Link project live demo and source code in DevHub AI Projects showcase',
      ],
    },
    {
      phaseNumber: 3,
      title: 'ATS Resume Optimization & Portfolio Polishing',
      duration: 'Weeks 8 – 9',
      goals: [
        'Build structured ATS resume emphasizing measurable impact',
        'Sync GitHub repository telemetry with public developer portfolio',
        'Enable public portfolio link and share with recruiters',
      ],
      skillsToLearn: ['Technical Writing', 'Impact Quantification', 'System Documentation'],
      actionItems: [
        'Quantify achievements in resume project bullet points with metrics',
        'Verify public portfolio link at /u/:your-slug',
      ],
    },
    {
      phaseNumber: 4,
      title: 'Targeted Applications & Interview Execution',
      duration: 'Weeks 10 – 12',
      goals: [
        'Track active applications in DevHub AI Job Application Pipeline',
        'Master system design and live coding interview patterns',
        'Convert screenings into high-conviction engineering offers',
      ],
      skillsToLearn: ['System Design', 'Algorithms', 'Behavioral STAR Method'],
      actionItems: [
        'Target 5–10 high-fit roles weekly and track in Kanban pipeline',
        'Conduct mock coding sessions and technical interview drills',
      ],
    },
  ];

  // Interview Preparation Focus Areas
  const interviewTopics = [
    {
      category: 'Technical Core & Architecture',
      topics: [
        'Asynchronous JavaScript event loop, microtasks, and promises',
        'React render lifecycle, custom hooks, and state reconciliation',
        'RESTful API status codes, idempotent methods, and middleware chaining',
      ],
      practiceTips: 'Explain design tradeoffs aloud while live coding without relying on autofill.',
    },
    {
      category: 'Data Modeling & System Design',
      topics: [
        'SQL vs NoSQL schema design decisions and data normalization',
        'Redis caching layers: Cache-Aside vs Write-Through strategies',
        'Horizontal scaling, load balancing, and stateless session tokens',
      ],
      practiceTips: 'Draw block diagrams illustrating request lifecycles from DNS to database.',
    },
    {
      category: 'Behavioral & Project Deep-Dives',
      topics: [
        'Structuring answers with Situation-Task-Action-Result (STAR) framework',
        'Explaining tough technical bugs you solved and lessons learned',
        'Collaborative conflict resolution and engineering tradeoff negotiation',
      ],
      practiceTips: 'Have 3 detailed project stories ready highlighting personal technical ownership.',
    },
  ];

  // Actionable Next Steps with Platform Page Links
  const nextActions = [];
  if (skillGaps.length > 0) {
    nextActions.push({
      action: `Map or learn ${skillGaps[0].skill} to close your highest priority role gap.`,
      priority: 'High',
      category: 'Skills',
      pageLink: 'skills',
    });
  }
  if (context.projects.length < 2) {
    nextActions.push({
      action: 'Add a new showcase project with live demo and GitHub repository links.',
      priority: 'High',
      category: 'Projects',
      pageLink: 'projects',
    });
  }
  if (!context.profile.githubConnected) {
    nextActions.push({
      action: 'Connect your GitHub profile to showcase real code telemetry.',
      priority: 'Medium',
      category: 'GitHub',
      pageLink: 'github',
    });
  }
  if (!context.resume) {
    nextActions.push({
      action: 'Create a tailored ATS resume using the DevHub AI Resume Builder.',
      priority: 'High',
      category: 'Resume',
      pageLink: 'resume',
    });
  }
  if (context.applications.total === 0) {
    nextActions.push({
      action: 'Track your target opportunities in the Job Applications Tracker.',
      priority: 'Medium',
      category: 'Applications',
      pageLink: 'applications',
    });
  }
  if (nextActions.length < 4) {
    nextActions.push({
      action: 'Review and share your verified public portfolio URL with engineering recruiters.',
      priority: 'Medium',
      category: 'Portfolio',
      pageLink: 'portfolio',
    });
  }

  return {
    targetRole,
    overallScore,
    categoryScores,
    summary,
    strengths,
    weaknesses,
    skillGaps,
    roadmap,
    recommendedProjects,
    interviewTopics,
    nextActions: nextActions.slice(0, 5),
    lastAnalyzedAt: new Date(),
  };
};

/**
 * Answer developer career questions with live context and safety boundaries
 */
export const answerCareerQuestion = async (context, question) => {
  const cleanQ = (question || '').trim();
  if (!cleanQ) {
    throw new Error('Please provide a question for the AI Career Advisor.');
  }

  const lower = cleanQ.toLowerCase();
  const nonCareerTopics = [
    'medical',
    'medicine',
    'headache',
    'doctor',
    'prescription',
    'health',
    'disease',
    'diagnosis',
    'politics',
    'election',
    'legal advice',
    'legal',
    'lawsuit',
    'stock pick',
    'cryptocurrency trade',
    'crypto trade',
  ];

  if (nonCareerTopics.some((topic) => lower.includes(topic))) {
    return `I am your DevHub AI Career Advisor specializing in software engineering career development, technical profiles, and interview readiness. I cannot provide guidance on non-career topics. How can I help you improve your engineering skills, resume, projects, or interview strategy?`;
  }

  const { profile, skills, projects, careerGoal } = context;
  const targetRole = careerGoal.targetRole || 'Full Stack Developer';
  const skillList = skills.map((s) => s.name).join(', ') || 'JavaScript, React, Node.js';
  const projectList = projects.map((p) => p.title).join(', ') || 'Web development prototypes';

  if (lower.includes('resume') || lower.includes('cv') || lower.includes('bullet')) {
    return `For a **${targetRole}** target role, your resume should directly highlight your experience with ${skillList}.\n\n### 3 Key Recommendations for Your Resume:\n1. **Lead with Technical Verbs**: Begin bullet points with active verbs like *Architected, Engineered, Implemented, Streamlined, Reduced*.\n2. **Quantify Business & Performance Impact**: Transform *"Built project"* into *"Architected responsive web application using ${skills[0]?.name || 'React'} and ${skills[1]?.name || 'Node.js'}, decreasing load time by 35% across 500+ active sessions"*.\n3. **Tailor to Job Descriptions**: Ensure keywords for your target role (${targetRole}) appear naturally across your Skills and Project descriptions.`;
  }

  if (lower.includes('project') || lower.includes('portfolio') || lower.includes('build')) {
    return `Based on your current projects (${projectList}) and your goal of becoming a **${targetRole}**, here are standout project concepts that will elevate your portfolio:\n\n1. **Distributed Task Queue & Telemetry Platform**:\n- **Tech Stack**: ${skills[0]?.name || 'TypeScript'}, Node.js, Redis, Docker, WebSocket live updates.\n- **Why it stands out**: Demonstrates concurrency, asynchronous task processing, and real-time frontend synchronization.\n\n2. **Role-Based Cloud Resource Management Portal**:\n- **Tech Stack**: ${skills[1]?.name || 'React'}, Express, PostgreSQL / MongoDB, Automated Jest tests.\n- **Why it stands out**: Proves depth in security, relational data modeling, and robust automated test suites.`;
  }

  if (lower.includes('interview') || lower.includes('system design') || lower.includes('prepare')) {
    return `To prepare for **${targetRole}** technical interviews, focus on these core areas:\n\n1. **Core Data Structures & Algorithms**: Focus on Hash Maps, Two-Pointer technique, Binary Trees, and Breadth-First Search.\n2. **System Architecture Deep-Dives**: Be ready to discuss the architecture of your strongest project, explaining why you chose your specific database and how you handled authentication and state.\n3. **System Design Fundamentals**: Study caching strategies (Redis), horizontal scaling, database sharding, and API rate limiting.\n4. **Behavioral STAR Technique**: Prepare stories detailing a difficult technical challenge you diagnosed and resolved.`;
  }

  if (lower.includes('skill') || lower.includes('learn') || lower.includes('next')) {
    const gaps = (ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer'])
      .filter((item) => !skills.some((s) => s.normalized === normalizeSkillName(item.name)))
      .slice(0, 3);

    const gapNames = gaps.map((g) => g.name).join(', ') || 'Docker, System Design, and automated testing';

    return `To advance from your current profile toward your **${targetRole}** target role, prioritize these high-leverage skills:\n\n- **Immediate Priority**: **${gapNames}**.\n- **Why**: These technologies bridge the gap between basic frontend/backend coding and scalable production engineering.\n- **Recommended Action**: Dedicate 2 weeks to building a containerized service incorporating these tools and add it to your DevHub AI Projects showcase.`;
  }

  // Default contextual guidance
  return `As your career advisor analyzing your profile for a **${targetRole}** trajectory (${careerGoal.experienceLevel} level):\n\n- **Current Foundation**: You have mapped ${skills.length} skills and ${projects.length} showcase projects.\n- **Priority Focus**: Deepen practical production experience with containerization, automated testing, and cloud deployments.\n- **Next Milestone**: Review your **AI Career Roadmap** in the tabs above and tackle your high-priority skill gaps. Feel free to ask specific questions about resumes, projects, or interview tactics!`;
};

export default {
  aggregateUserContext,
  calculateReadinessScores,
  generateProfileAnalysis,
  answerCareerQuestion,
  normalizeSkillName,
};
