# Product Careers - Read-only Job Board

A curated, product-focused job board built with Next.js and Supabase. This fork is configured as a read-only aggregator that surfaces product management roles from multiple sources.

## 🚀 Live Demo

[Live Application URL] - (to be added)

## ✨ Features

### Core Functionality
- **Read-only Aggregator**: No posting or accounts in MVP
- **Rich Product Schema**: Product-specific fields and tags
- **Job Browsing**: Public page to browse product postings with filtering
- **Job Detail View**: Detailed view with company, location, and compensation

### Filtering & Search
- Filter jobs by seniority, location metro, work arrangement
- Real-time filtering without page reloads

### Modern UI/UX
- Responsive design that works on all devices
- Clean, professional interface using Tailwind CSS
- Loading states and smooth transitions
- Form validation with helpful error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
   - RPC and FTS for search (planned)

### Additional Libraries
- **React Hook Form** - Form handling and validation
- **date-fns** - Date manipulation and formatting
- **clsx & tailwind-merge** - Conditional CSS class handling

## 🏗 Architecture Overview

### Database Schema
```sql
jobs table:
- id (UUID, Primary Key)
- title (TEXT)
- company_name (TEXT)
- description (TEXT)
- location (TEXT)
- job_type (TEXT) - enum: 'Full-Time', 'Part-Time', 'Contract'
- user_id (UUID, Foreign Key to auth.users)
- created_at (TIMESTAMP)
```

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Placeholder auth page (disabled)
│   ├── jobs/[id]/         # Individual job detail pages
│   └── page.tsx           # Home page (job listings)
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, etc.)
│   └── Header.tsx        # Main navigation header
├── contexts/             # React contexts (kept for future)
│   └── AuthContext.tsx   # Authentication state management (unused in UI)
└── lib/                  # Utility functions and configurations
   ├── supabase.ts       # Supabase client and types (rich schema)
   ├── data-mapper.ts    # Map Supabase rows to UI models
   ├── types.ts          # Frontend entity types
   └── utils.ts          # Utility functions
```

### Key Features Implementation

1. **Authentication Flow**
   - Supabase Auth UI for login/signup
   - Context-based auth state management
   - Protected routes for authenticated features

2. **Data Management**
   - Real-time data fetching with Supabase
   - Row Level Security for data protection
   - Optimistic updates for better UX

3. **Responsive Design**
   - Mobile-first approach
   - Tailwind CSS for consistent styling
   - Adaptive layouts for different screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project (optional for demo)

### Quick Start (Demo Mode)

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd product-job-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

The application requires a Supabase project configured via environment variables.

### Full Setup with Supabase

To enable all features including authentication and job posting:

1. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API to get your URL and anon key
   - Run the SQL schema in the Supabase SQL editor:
     ```bash
     # Copy and execute the contents of supabase-schema.sql in your Supabase SQL editor
     ```

2. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Restart the development server**
   ```bash
   npm run dev
   ```

### Deployment

The application is configured for easy deployment on Vercel:

1. **Deploy to Vercel**
   ```bash
   # If you have Vercel CLI installed
   vercel

   # Or connect your GitHub repo to Vercel dashboard
   ```

2. **Set environment variables in Vercel**
   - Add your Supabase URL and anon key in the Vercel dashboard
   - The application will automatically deploy

## 🔒 Security Features

- **Row Level Security (RLS)** - Users can only modify their own job postings
- **Authentication Required** - Job posting and management requires authentication
- **Input Validation** - Form validation on both client and server side
- **SQL Injection Protection** - Supabase handles query sanitization

## 📱 User Experience

### For Job Seekers
1. Browse jobs on the homepage
2. Use filters to find relevant positions
3. Click on jobs to view detailed descriptions
4. No account required for browsing

### For Employers
1. Sign up/login to post jobs
2. Create job postings with detailed information
3. Manage posted jobs from the dashboard
4. Edit or delete job postings as needed

## 🔮 What Would I Improve If Given More Time?

### Immediate Improvements (1-2 days)
1. **Email Notifications**
   - Send confirmation emails when jobs are posted
   - Notify job posters when their posts receive interest

2. **Enhanced Search**
   - Full-text search across job titles and descriptions
   - Advanced filtering (salary range, company size, remote options)
   - Search suggestions and autocomplete

3. **Job Application System**
   - Allow users to apply directly through the platform
   - Application tracking for both employers and job seekers
   - Resume upload and management

### Medium-term Enhancements (1-2 weeks)
4. **User Profiles**
   - Company profiles with descriptions and logos
   - Job seeker profiles with resumes and preferences
   - Profile verification system

5. **Analytics Dashboard**
   - View counts and application metrics for job posts
   - Analytics for employers to track posting performance
   - Site-wide statistics for administrators

6. **Improved UI/UX**
   - Dark mode support
   - Better mobile experience with native app feel
   - Advanced sorting options (newest, oldest, relevance)
   - Saved jobs functionality for users

### Long-term Features (1+ months)
7. **AI-Powered Features**
   - Job recommendation system based on user preferences
   - Automatic job description enhancement
   - Skills matching between jobs and candidates

8. **Communication System**
   - In-app messaging between employers and candidates
   - Video interview scheduling integration
   - Notification system for real-time updates

9. **Advanced Administration**
   - Admin panel for content moderation
   - Spam detection and prevention
   - User management and analytics

10. **Performance & Scale**
    - Implement caching strategies (Redis)
    - Database query optimization
    - CDN integration for faster loading
    - Monitoring and error tracking

### Technical Improvements
- **Testing**: Unit tests, integration tests, and E2E testing with Playwright
- **Accessibility**: WCAG compliance and screen reader support
- **SEO**: Better meta tags, structured data, and sitemap generation
- **Performance**: Code splitting, image optimization, and Progressive Web App features
- **Security**: Additional security headers, rate limiting, and input sanitization

## 🤝 Contributing

This is a take-home assignment project, but suggestions and feedback are welcome!

## 📄 License

This project is created as a technical assessment and is available for review and learning purposes.
