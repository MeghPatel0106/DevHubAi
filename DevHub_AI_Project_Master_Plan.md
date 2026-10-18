# DevHub AI --- Project Master Plan

## AI-Powered Developer Career Management Platform

**Project Type:** Full-Stack Web Application\
**Primary Stack:** React.js + Node.js + Express.js + MongoDB\
**AI:** Gemini API or OpenAI API\
**Development Approach:** Antigravity / Vibe Coding\
**Academic Subjects:** Web Application Development (WAD) + Advanced
Database Management Systems (ADMS)

------------------------------------------------------------------------

# 1. Project Overview

## Project Title

**DevHub AI: AI-Powered Developer Career Management Platform**

## One-Line Description

DevHub AI is a full-stack MERN platform that helps developers build
professional portfolios, manage resumes and certificates, showcase
projects, integrate GitHub activity, track career applications, and use
AI-powered tools to improve their professional profile.

## Problem Statement

Developers often maintain their resumes, GitHub repositories,
certificates, projects, achievements, and job applications across
different platforms and files. This makes career information difficult
to organize and maintain.

DevHub AI provides a centralized platform where developers can manage
their professional identity and career activities from one dashboard.

## Main Objectives

-   Build a professional developer profile and portfolio.
-   Store and manage career-related data using MongoDB.
-   Integrate GitHub data automatically.
-   Provide AI-assisted professional content generation.
-   Manage resumes, projects, certificates, skills, and experience.
-   Track job and internship applications.
-   Provide portfolio and profile analytics.
-   Demonstrate full-stack development concepts for WAD.
-   Demonstrate database design, CRUD, queries, aggregation, and
    indexing for ADMS.

------------------------------------------------------------------------

# 2. Core User Roles

## Developer

Can:

-   Register and log in.
-   Create and edit a professional profile.
-   Add skills, education, experience, and achievements.
-   Add and manage projects.
-   Upload resumes and certificates.
-   Connect GitHub.
-   Generate AI-powered professional content.
-   Track job and internship applications.
-   View portfolio analytics.
-   Publish a public portfolio.

## Recruiter

Can:

-   Browse public developer profiles.
-   Search developers.
-   Filter by skills and experience.
-   View projects and achievements.
-   View/download resumes where permitted.
-   Bookmark candidates.
-   Contact developers.

## Admin

Can:

-   Manage users.
-   Manage recruiters.
-   Review reported content.
-   View platform statistics.
-   Manage featured profiles.
-   Monitor system activity.

------------------------------------------------------------------------

# 3. Main Modules

## Module 1 --- Authentication & Authorization

Features:

-   User registration.
-   Login/logout.
-   Password hashing.
-   JWT authentication.
-   Protected routes.
-   Role-based authorization.
-   Forgot/reset password.
-   Profile settings.

Roles:

-   Developer
-   Recruiter
-   Admin

------------------------------------------------------------------------

## Module 2 --- Developer Profile

Profile fields:

-   Full name
-   Profile photo
-   Professional headline
-   Bio
-   Location
-   Email
-   Phone (optional)
-   Website
-   LinkedIn
-   GitHub
-   Coding profiles
-   Skills
-   Education
-   Experience
-   Achievements

Profile completion percentage should be calculated dynamically.

------------------------------------------------------------------------

## Module 3 --- Portfolio Builder

Developers can create a public portfolio containing:

-   About section
-   Skills
-   Projects
-   Experience
-   Education
-   Certificates
-   Achievements
-   GitHub statistics
-   Contact information

The developer can preview the portfolio before publishing.

Each developer receives a public profile URL such as:

`/u/username`

------------------------------------------------------------------------

## Module 4 --- Project Management

Each project can contain:

-   Project title
-   Description
-   Technologies
-   Category
-   Project image
-   GitHub URL
-   Live demo URL
-   Start date
-   End date
-   Features
-   Project status

CRUD operations:

-   Create project
-   Read project
-   Update project
-   Delete project

------------------------------------------------------------------------

## Module 5 --- Resume Management

Features:

-   Upload resume.
-   Store resume metadata.
-   Replace resume.
-   View resume.
-   Download resume.
-   Maintain resume version/history.
-   Track resume downloads.

Optional future feature:

-   Resume builder with multiple templates.
-   PDF generation.

------------------------------------------------------------------------

## Module 6 --- Certificate Management

Certificate fields:

-   Certificate title
-   Issuing organization
-   Issue date
-   Expiry date
-   Credential ID
-   Verification URL
-   Certificate image/PDF

Features:

-   Add certificate.
-   Edit certificate.
-   Delete certificate.
-   View certificate.
-   Verify certificate link.

------------------------------------------------------------------------

## Module 7 --- Skills & Experience

Skills:

-   Skill name
-   Category
-   Proficiency
-   Years of experience

Example:

-   React.js --- Advanced
-   Node.js --- Intermediate
-   MongoDB --- Intermediate

Experience:

-   Company
-   Role
-   Location
-   Start date
-   End date
-   Description
-   Technologies

------------------------------------------------------------------------

# 4. GitHub Integration

Developer enters GitHub username.

Backend retrieves available public information through the GitHub API.

Possible data:

-   Public repositories
-   Followers
-   Following
-   Repository stars
-   Repository forks
-   Primary languages
-   Repository descriptions
-   Recent activity
-   Contribution-related information where available

Dashboard can show:

-   Total repositories
-   Total stars
-   Most-used languages
-   Most popular repositories
-   Recently updated repositories

Important:

Do not scrape GitHub pages. Use the official GitHub API and respect its
rate limits.

------------------------------------------------------------------------

# 5. AI Features

## AI Bio Generator

Input:

-   Skills
-   Experience
-   Education
-   Projects
-   Achievements

Output:

A professional developer biography.

User should be able to:

-   Generate
-   Regenerate
-   Edit
-   Save

------------------------------------------------------------------------

## AI Resume Improvement

The user provides resume text or supported resume content.

AI can suggest:

-   Grammar improvements
-   Stronger action verbs
-   Missing keywords
-   Better project descriptions
-   Concise wording
-   ATS-oriented improvements

The system should present suggestions rather than claiming that an AI
score guarantees ATS success.

------------------------------------------------------------------------

## AI Project Description Generator

Input:

-   Project name
-   Technologies
-   Features

Output:

-   Professional project summary
-   Resume bullet suggestions
-   Portfolio description

------------------------------------------------------------------------

## AI Skill Roadmap

Based on the user's existing skills and target role, AI can suggest:

-   Skills to learn
-   Recommended order
-   Project ideas
-   Learning milestones

------------------------------------------------------------------------

# 6. Job & Internship Application Tracker

Users can track applications.

Fields:

-   Company
-   Job title
-   Job type
-   Location
-   Application URL
-   Applied date
-   Status
-   Interview date
-   Salary/package (optional)
-   Notes

Statuses:

-   Saved
-   Applied
-   Screening
-   Interview
-   Offer
-   Rejected
-   Withdrawn

Dashboard:

-   Total applications
-   Interviews
-   Offers
-   Rejections
-   Application conversion rate

------------------------------------------------------------------------

# 7. Analytics Dashboard

Developer analytics:

-   Profile views
-   Project views
-   Resume downloads
-   GitHub link clicks
-   Portfolio visits
-   Application statistics

Charts:

-   Views over time
-   Project popularity
-   Application status distribution
-   Skills distribution

Analytics should be stored efficiently and aggregated through MongoDB
where appropriate.

------------------------------------------------------------------------

# 8. Recruiter Module

Recruiter features:

-   Recruiter registration.
-   Company profile.
-   Candidate search.
-   Skill filtering.
-   Experience filtering.
-   Candidate bookmarking.
-   Public portfolio viewing.
-   Resume access according to developer privacy settings.
-   Contact/request feature.

Example search:

`React + Node.js + MongoDB`

Filters:

-   Skills
-   Experience
-   Location
-   Availability
-   Education

------------------------------------------------------------------------

# 9. Admin Dashboard

Admin dashboard should display:

-   Total users
-   Active users
-   Developers
-   Recruiters
-   Total projects
-   Total certificates
-   Total applications
-   Profile views
-   Reported content

Admin actions:

-   View users
-   Disable/enable accounts
-   Review reports
-   Remove inappropriate content
-   View platform analytics

------------------------------------------------------------------------

# 10. MongoDB Database Design

Recommended database name:

`devhub_ai`

## Collections

### users

Stores authentication and basic account information.

Important fields:

-   `_id`
-   `name`
-   `email`
-   `passwordHash`
-   `role`
-   `username`
-   `profileImage`
-   `isActive`
-   `createdAt`
-   `updatedAt`

Recommended indexes:

-   Unique index on `email`
-   Unique index on `username`

------------------------------------------------------------------------

### profiles

Stores professional developer information.

Fields:

-   `_id`
-   `userId`
-   `headline`
-   `bio`
-   `location`
-   `phone`
-   `website`
-   `linkedin`
-   `github`
-   `skills`
-   `education`
-   `experience`
-   `achievements`
-   `profileVisibility`
-   `profileCompletion`
-   `createdAt`
-   `updatedAt`

Relationship:

`users 1 : 1 profiles`

------------------------------------------------------------------------

### projects

Fields:

-   `_id`
-   `userId`
-   `title`
-   `description`
-   `technologies`
-   `category`
-   `imageUrl`
-   `githubUrl`
-   `liveUrl`
-   `features`
-   `startDate`
-   `endDate`
-   `status`
-   `views`
-   `createdAt`
-   `updatedAt`

Relationship:

`users 1 : N projects`

------------------------------------------------------------------------

### resumes

Fields:

-   `_id`
-   `userId`
-   `fileUrl`
-   `fileName`
-   `version`
-   `isCurrent`
-   `downloadCount`
-   `uploadedAt`

Relationship:

`users 1 : N resumes`

------------------------------------------------------------------------

### certificates

Fields:

-   `_id`
-   `userId`
-   `title`
-   `issuer`
-   `issueDate`
-   `expiryDate`
-   `credentialId`
-   `verificationUrl`
-   `fileUrl`
-   `createdAt`

Relationship:

`users 1 : N certificates`

------------------------------------------------------------------------

### githubProfiles

Fields:

-   `_id`
-   `userId`
-   `githubUsername`
-   `avatarUrl`
-   `publicRepos`
-   `followers`
-   `following`
-   `totalStars`
-   `languages`
-   `repositories`
-   `lastSyncedAt`

Relationship:

`users 1 : 1 githubProfiles`

------------------------------------------------------------------------

### jobApplications

Fields:

-   `_id`
-   `userId`
-   `company`
-   `jobTitle`
-   `jobType`
-   `location`
-   `applicationUrl`
-   `appliedDate`
-   `status`
-   `interviewDate`
-   `notes`
-   `createdAt`
-   `updatedAt`

Relationship:

`users 1 : N jobApplications`

------------------------------------------------------------------------

### profileViews

Fields:

-   `_id`
-   `profileUserId`
-   `visitorId` (optional)
-   `source`
-   `country` (if legitimately available and appropriate)
-   `device`
-   `viewedAt`

Use privacy-conscious analytics. Avoid collecting unnecessary personal
information.

------------------------------------------------------------------------

### aiGenerations

Fields:

-   `_id`
-   `userId`
-   `type`
-   `input`
-   `output`
-   `model`
-   `createdAt`

Types:

-   bio
-   resume
-   project
-   skill-roadmap

Do not store sensitive resume information unnecessarily.

------------------------------------------------------------------------

### bookmarks

Fields:

-   `_id`
-   `recruiterId`
-   `developerId`
-   `createdAt`

Prevent duplicate bookmarks using a compound unique index.

------------------------------------------------------------------------

### notifications

Fields:

-   `_id`
-   `userId`
-   `type`
-   `title`
-   `message`
-   `isRead`
-   `createdAt`

------------------------------------------------------------------------

# 11. Database Relationships

``` text
USER
 │
 ├── PROFILE (1:1)
 │
 ├── PROJECTS (1:N)
 │
 ├── RESUMES (1:N)
 │
 ├── CERTIFICATES (1:N)
 │
 ├── JOB APPLICATIONS (1:N)
 │
 ├── GITHUB PROFILE (1:1)
 │
 ├── AI GENERATIONS (1:N)
 │
 └── NOTIFICATIONS (1:N)

RECRUITER
 │
 └── BOOKMARKS ───────> DEVELOPER
```

Use references between collections for major entities rather than
putting the entire application into one huge MongoDB document.

------------------------------------------------------------------------

# 12. WAD Requirements

The project should demonstrate:

-   React components
-   JSX
-   React Router
-   State management
-   Forms and validation
-   API integration
-   REST APIs
-   Node.js
-   Express.js
-   Middleware
-   Authentication
-   Authorization
-   CRUD operations
-   File upload
-   Responsive UI
-   Error handling
-   Loading states
-   Deployment

Suggested frontend libraries:

-   React Router
-   Axios
-   React Hook Form
-   Tailwind CSS
-   Recharts
-   Lucide React

------------------------------------------------------------------------

# 13. ADMS Requirements

The project should demonstrate:

-   MongoDB database creation
-   Collection design
-   Document structure
-   Data validation
-   CRUD operations
-   Query operators
-   Projection
-   Sorting
-   Filtering
-   Pagination
-   Indexing
-   Aggregation pipeline
-   Lookup where appropriate
-   Data relationships
-   Analytics queries
-   Backup/export concepts

Important MongoDB demonstrations:

### Query Example Categories

1.  Find developers with specific skills.
2.  Find projects using React.
3.  Sort developers by profile views.
4.  Count applications by status.
5.  Calculate average profile views.
6.  Find top projects by views.
7.  Aggregate application statistics.
8.  Search users by username/email.
9.  Use indexes for frequently searched fields.
10. Use aggregation to generate dashboard metrics.

------------------------------------------------------------------------

# 14. Suggested REST API Structure

## Authentication

``` text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

## Profile

``` text
GET    /api/profile/me
PUT    /api/profile/me
GET    /api/profile/:username
```

## Projects

``` text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

## Certificates

``` text
GET    /api/certificates
POST   /api/certificates
PUT    /api/certificates/:id
DELETE /api/certificates/:id
```

## Resume

``` text
GET    /api/resumes
POST   /api/resumes
DELETE /api/resumes/:id
GET    /api/resumes/:id/download
```

## GitHub

``` text
POST   /api/github/connect
GET    /api/github/profile
GET    /api/github/repositories
POST   /api/github/sync
```

## AI

``` text
POST   /api/ai/generate-bio
POST   /api/ai/improve-resume
POST   /api/ai/project-description
POST   /api/ai/skill-roadmap
```

## Applications

``` text
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id
DELETE /api/applications/:id
```

## Analytics

``` text
GET    /api/analytics/profile
GET    /api/analytics/projects
GET    /api/analytics/applications
```

------------------------------------------------------------------------

# 15. Frontend Page Structure

``` text
/
├── Landing Page
├── Login
├── Register
├── Forgot Password
│
├── Dashboard
│   ├── Overview
│   ├── Profile
│   ├── Projects
│   ├── Resume
│   ├── Certificates
│   ├── GitHub
│   ├── Applications
│   ├── AI Tools
│   ├── Analytics
│   └── Settings
│
├── Public Portfolio
│   └── /u/:username
│
├── Recruiter
│   ├── Search
│   ├── Candidates
│   └── Bookmarks
│
└── Admin
    ├── Dashboard
    ├── Users
    ├── Reports
    └── Analytics
```

------------------------------------------------------------------------

# 16. Recommended UI

Design goal:

**Modern SaaS dashboard**

Use:

-   Clean typography
-   Cards
-   Sidebar navigation
-   Responsive layout
-   Light/dark mode
-   Skeleton loading
-   Toast notifications
-   Empty states
-   Confirmation dialogs
-   Consistent forms
-   Accessible buttons and labels

Avoid making every page look like a generic AI-generated dashboard. Keep
spacing, typography, navigation, and components consistent.

------------------------------------------------------------------------

# 17. Security Requirements

Implement:

-   Password hashing with bcrypt.
-   JWT authentication.
-   Protected API routes.
-   Role-based authorization.
-   Input validation.
-   File type validation.
-   File size limits.
-   Secure environment variables.
-   CORS configuration.
-   Rate limiting for sensitive endpoints.
-   Safe error messages.
-   API authorization checks.
-   No API keys in frontend code.

Environment variables:

``` text
MONGODB_URI=
JWT_SECRET=
AI_API_KEY=
GITHUB_TOKEN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env` to GitHub.

------------------------------------------------------------------------

# 18. Suggested Folder Structure

``` text
devhub-ai/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── config/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

------------------------------------------------------------------------

# 19. Antigravity / Vibe Coding Strategy

Do NOT ask the coding agent to build the entire application in one
prompt.

Build incrementally.

## Phase 1 --- Foundation

Prompt objective:

> Create the DevHub AI project using React.js for the frontend and
> Node.js + Express.js for the backend. Configure a clean client/server
> folder structure, environment variables, ESLint if appropriate, error
> handling, API base configuration, and a professional SaaS dashboard
> foundation. Do not implement advanced features yet.

------------------------------------------------------------------------

## Phase 2 --- MongoDB

Prompt objective:

> Add MongoDB using Mongoose. Create the initial User, Profile, Project,
> Resume, Certificate, GitHubProfile, JobApplication, Notification,
> ProfileView, AIHistory, and Bookmark models based on the project
> database specification. Add timestamps, validation, appropriate
> indexes, and references. Keep schemas modular and avoid unnecessary
> duplication.

------------------------------------------------------------------------

## Phase 3 --- Authentication

Implement:

-   Registration
-   Login
-   JWT
-   bcrypt
-   Protected routes
-   Role-based authorization
-   Logout
-   Current-user endpoint

Test every endpoint before continuing.

------------------------------------------------------------------------

## Phase 4 --- Developer Profile

Implement:

-   Profile CRUD
-   Skills
-   Education
-   Experience
-   Achievements
-   Profile completion
-   Public profile

------------------------------------------------------------------------

## Phase 5 --- Projects

Implement:

-   Project CRUD
-   Image upload
-   GitHub/live links
-   Project cards
-   Project detail page
-   Search/filter

------------------------------------------------------------------------

## Phase 6 --- Resume & Certificates

Implement:

-   Resume upload
-   Certificate upload
-   Metadata
-   Preview/download
-   Delete/update
-   Download tracking

------------------------------------------------------------------------

## Phase 7 --- GitHub Integration

Implement:

-   GitHub username connection
-   API service
-   Repository retrieval
-   Language statistics
-   Repository statistics
-   Sync timestamp
-   Error/rate-limit handling

------------------------------------------------------------------------

## Phase 8 --- AI

Implement AI only through the backend.

Features:

-   Bio generation
-   Project description
-   Resume suggestions
-   Skill roadmap

Store generation history in MongoDB.

------------------------------------------------------------------------

## Phase 9 --- Job Tracker

Implement:

-   Application CRUD
-   Kanban/status view
-   Interview dates
-   Search/filter
-   Application analytics

------------------------------------------------------------------------

## Phase 10 --- Analytics

Use MongoDB aggregation for:

-   Profile views
-   Resume downloads
-   Project popularity
-   Application statistics
-   Monthly trends

------------------------------------------------------------------------

## Phase 11 --- Recruiter & Admin

Implement:

-   Recruiter search
-   Candidate filters
-   Bookmarks
-   Admin dashboard
-   User management
-   Reports

------------------------------------------------------------------------

## Phase 12 --- Testing & Deployment

Test:

-   Authentication
-   Authorization
-   CRUD
-   API errors
-   File uploads
-   AI failures
-   GitHub failures
-   Mobile UI
-   Database queries

Then deploy frontend, backend, and MongoDB Atlas.

------------------------------------------------------------------------

# 20. Git Workflow

Recommended branches:

``` text
main
develop
feature/auth
feature/profile
feature/projects
feature/github
feature/ai
feature/analytics
```

Workflow:

``` text
feature branch
      ↓
test locally
      ↓
commit
      ↓
push
      ↓
merge into develop
      ↓
test
      ↓
merge into main
```

Use small commits such as:

``` text
feat: add user authentication
feat: add project CRUD
feat: integrate GitHub API
feat: add AI bio generator
fix: validate project form
docs: update database schema
```

------------------------------------------------------------------------

# 21. Testing Checklist

## Authentication

-   [ ] Register works
-   [ ] Duplicate email rejected
-   [ ] Login works
-   [ ] Wrong password rejected
-   [ ] Protected routes secured
-   [ ] Roles enforced

## Profile

-   [ ] Create profile
-   [ ] Update profile
-   [ ] Public profile works
-   [ ] Profile completion calculates correctly

## Projects

-   [ ] Create
-   [ ] Read
-   [ ] Update
-   [ ] Delete
-   [ ] Search
-   [ ] Filter

## Resume

-   [ ] Upload
-   [ ] Preview
-   [ ] Download
-   [ ] Delete
-   [ ] Download count

## GitHub

-   [ ] Valid username
-   [ ] Invalid username
-   [ ] API failure handled
-   [ ] Data sync works

## AI

-   [ ] Generate bio
-   [ ] Regenerate
-   [ ] Save result
-   [ ] API failure handled
-   [ ] Usage/rate limits handled

## Database

-   [ ] CRUD tested
-   [ ] Indexes created
-   [ ] Aggregations tested
-   [ ] Validation tested
-   [ ] Relationships verified

------------------------------------------------------------------------

# 22. ADMS Demonstration Plan

For your ADMS practical/viva, prepare these demonstrations:

### 1. Database Creation

Show:

`devhub_ai`

### 2. Collections

Show:

-   users
-   profiles
-   projects
-   resumes
-   certificates
-   githubProfiles
-   jobApplications
-   profileViews
-   aiGenerations
-   bookmarks
-   notifications

### 3. CRUD

Demonstrate insert, find, update, and delete.

### 4. Query

Find all developers who know React.

### 5. Sorting

Find developers ordered by profile views.

### 6. Aggregation

Calculate total applications by status.

### 7. Indexing

Show indexes on:

-   email
-   username
-   skills
-   recruiter/developer bookmark pair

### 8. Dashboard Aggregation

Demonstrate how MongoDB generates analytics displayed in React.

------------------------------------------------------------------------

# 23. WAD Demonstration Plan

For WAD viva, prepare:

### Frontend

-   React components
-   Props/state
-   React Router
-   Forms
-   API calls
-   Responsive design

### Backend

-   Node.js
-   Express.js
-   Routes
-   Controllers
-   Middleware
-   REST API

### Full Stack Flow

Explain:

``` text
React Form
   ↓
Axios
   ↓
Express Route
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB
   ↓
JSON Response
   ↓
React UI
```

------------------------------------------------------------------------

# 24. MVP vs Advanced Features

## MVP --- Must Complete

-   [ ] Authentication
-   [ ] MongoDB
-   [ ] Developer profile
-   [ ] Project management
-   [ ] Resume management
-   [ ] Certificate management
-   [ ] Public portfolio
-   [ ] GitHub integration
-   [ ] Basic AI bio/project generator
-   [ ] Job application tracker
-   [ ] Dashboard

## Advanced --- Add If Time Allows

-   [ ] Recruiter portal
-   [ ] AI resume analysis
-   [ ] AI skill roadmap
-   [ ] Real-time notifications
-   [ ] Real-time recruiter/developer chat
-   [ ] Resume builder
-   [ ] Advanced analytics
-   [ ] Portfolio themes
-   [ ] Custom domain support
-   [ ] Email notifications

Do not sacrifice the MVP for advanced features.

------------------------------------------------------------------------

# 25. Final Technology Stack

  Layer              Technology
  ------------------ -------------------------
  Frontend           React.js
  Styling            Tailwind CSS
  Backend            Node.js
  API                Express.js
  Database           MongoDB
  ODM                Mongoose
  Authentication     JWT + bcrypt
  AI                 Gemini API / OpenAI API
  GitHub             GitHub API
  File Storage       Cloudinary
  Charts             Recharts
  HTTP Client        Axios
  Forms              React Hook Form
  Icons              Lucide React
  Deployment         Vercel + Render/Railway
  Database Hosting   MongoDB Atlas
  Version Control    Git + GitHub

------------------------------------------------------------------------

# 26. What Makes This Project Strong

DevHub AI should demonstrate three things:

## Technical Depth

-   MERN stack
-   REST APIs
-   Authentication
-   MongoDB
-   External API integration
-   AI integration
-   File handling

## Database Depth

-   Multiple collections
-   References
-   Indexes
-   Aggregation
-   Analytics
-   CRUD
-   Validation

## Product Value

The project solves a real problem:

> Developers need one place to manage and present their professional
> identity.

The final application should feel like a real SaaS product, not a
collection of disconnected college CRUD pages.

------------------------------------------------------------------------

# 27. Final Project Pitch

> **DevHub AI is an AI-powered developer career management platform that
> centralizes portfolios, resumes, projects, certifications, GitHub
> activity, skills, and job applications into a single professional
> dashboard. Built using React.js, Node.js, Express.js, and MongoDB, the
> platform uses AI to help developers improve their professional content
> and present their skills effectively to recruiters.**

------------------------------------------------------------------------

# 28. Important Rule for Vibe Coding

Use Antigravity as a development assistant, not as a replacement for
understanding the project.

For every generated feature:

1.  Read the code.
2.  Understand the database model.
3.  Understand the API route.
4.  Run the application.
5.  Test the feature.
6.  Check MongoDB data.
7.  Fix errors.
8.  Commit the working version.
9.  Update documentation.

Never move to the next major module while the previous module is broken.

------------------------------------------------------------------------

# 29. Final Success Criteria

The project is considered complete when:

-   [ ] Developer can register/login.
-   [ ] Developer can create a professional profile.
-   [ ] Developer can manage projects.
-   [ ] Developer can upload resume/certificates.
-   [ ] Developer can connect GitHub.
-   [ ] Developer can generate AI content.
-   [ ] Developer can track job applications.
-   [ ] Public portfolio works.
-   [ ] Dashboard shows real MongoDB analytics.
-   [ ] Recruiter functionality works if included.
-   [ ] Admin functionality works if included.
-   [ ] Database indexes and aggregation are demonstrated.
-   [ ] Application is responsive.
-   [ ] Environment variables are secured.
-   [ ] GitHub repository is clean.
-   [ ] README contains setup and architecture documentation.
-   [ ] Application is deployed.
-   [ ] WAD viva concepts are understood.
-   [ ] ADMS viva concepts are understood.

------------------------------------------------------------------------

# 30. Recommended Development Order

**Start here:**

``` text
1. Finalize requirements
        ↓
2. Design MongoDB schemas
        ↓
3. Create React + Node project
        ↓
4. Connect MongoDB Atlas
        ↓
5. Build authentication
        ↓
6. Build developer profile
        ↓
7. Build projects
        ↓
8. Build resumes/certificates
        ↓
9. Build GitHub integration
        ↓
10. Build AI features
        ↓
11. Build job tracker
        ↓
12. Build analytics
        ↓
13. Add recruiter/admin features
        ↓
14. Test everything
        ↓
15. Deploy
        ↓
16. Prepare WAD + ADMS documentation
        ↓
17. Prepare viva
```

## Final Goal

**DevHub AI should be presented as one complete product with two
academic perspectives:**

**WAD:** A modern full-stack React + Node.js web application.

**ADMS:** A MongoDB-powered data management and analytics system.

This allows the same project to satisfy both subjects while
demonstrating substantially more than basic CRUD functionality.
