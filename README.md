# TimeBack - Personalized Learning Platform

A personalized AI-powered learning platform that helps students discover their optimal learning path with the 2 Hour Learning methodology. Built with Next.js 14, Supabase, and various AI providers.

## Overview

TimeBack is an educational platform that provides:
- Personalized learning recommendations based on student quiz responses
- School finder with AI-powered recommendations
- Student journey tracking and sharing
- Video testimonials and marketing content
- AI chat experiences for personalized guidance
- Integration with multiple AI providers for enhanced learning experiences

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom TimeBack design system
- **Payments**: Stripe
- **AI Providers**: 
  - Anthropic Claude (via AWS Bedrock)
  - OpenAI GPT-4
  - Google Gemini
  - Perplexity AI
  - Various other providers for fallback
- **Analytics**: PostHog, Google Analytics
- **Email**: Resend
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Various API keys (see Environment Variables section)

## Getting Started

> **Note**: Replace `[repository-url]` below with your actual repository URL

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ship-fast-ts-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local.example` to `.env.local` and fill in all required values (see Environment Variables section below)

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/` folder
   - Update your `.env.local` with Supabase credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Providers
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
PERPLEXITY_API_KEY=your_perplexity_key
GROQ_API_KEY=your_groq_key

# AWS Bedrock (for Claude)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Email
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id

# Other
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Project Structure

```
ship-fast-ts-3/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── ai-experience/     # AI chat experience
│   ├── journey/           # Student journey pages
│   ├── personalized/      # Personalized recommendations
│   ├── quiz/              # Quiz flow
│   └── ...
├── components/            # React components
│   ├── ai-experience/     # AI experience components
│   ├── personalized/      # Personalized content components
│   ├── quiz/              # Quiz components
│   └── ...
├── libs/                  # Utility libraries
│   ├── ai/               # AI provider integrations
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe configuration
│   └── ...
├── public/               # Static assets
│   ├── schools/          # School data
│   ├── videos/           # Video content
│   └── ...
├── supabase/             # Database migrations
└── types/                # TypeScript type definitions
```

## Key Features

### 1. Quiz System
- Multi-step quiz flow collecting student information
- Progress tracking
- Data persistence in Supabase

### 2. Personalized Recommendations
- AI-powered analysis of quiz responses
- Custom learning path recommendations
- School matching based on location and preferences

### 3. AI Chat Experience
- Interactive AI tutor using Claude via AWS Bedrock
- Personalized responses based on student profile
- Multiple AI provider fallback system

### 4. School Finder
- Geocoded school database
- Distance-based recommendations
- Detailed school information pages

### 5. Student Journeys
- Shareable learning journey pages
- Progress tracking
- Social sharing capabilities

## Database Schema

The main tables include:
- `users` - User authentication and profile
- `leads` - Quiz responses and student data
- `schools` - School information and metadata
- `testimonials` - Student testimonials
- `videos` - Educational video content
- `student_journeys` - Saved learning journeys

## Available Scripts

### Development
```bash
npm run dev          # Start development server with logging on port 3002
npm run dev-no-log   # Start development server without logging
npm run kill         # Kill the dev server process
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server on port 3002
```

### Database & Data Management
```bash
npx supabase migration up                    # Run database migrations
npm run extract-schools                      # Extract school data
npm run setup-marketing-images               # Upload marketing images to Supabase
npm run generate-video-titles                # Generate video titles
npm run cleanup-video-titles                 # Clean up video titles
```

### Logging & Debugging
```bash
npm run view-logs          # View live logs
npm run view-recent-logs   # View last 100 log entries
npm run clear-logs         # Clear log file
npm run rotate-logs        # Rotate logs if > 50MB
npm run log-status         # Check log file status
```

### Code Quality
```bash
npm run lint         # Run ESLint with logging
npm run lint-no-log  # Run ESLint without logging
```

## Deployment

The project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with `git push` to main branch

## Important Notes

### Configuration Details
- **Port**: The application runs on port 3002 (not the default 3000)
- **Design System**: TimeBack custom colors are defined in `tailwind.config.js`:
  - Primary: `#0f33bb` (dark blue)
  - Background: `#1abeff` (light blue)
  - Font: Cal Sans (must be present in `/public/fonts`)
- **AI Configuration**: 
  - Primary AI is Claude via AWS Bedrock
  - Multiple fallback providers configured
  - All AI responses are logged for analytics
- **Payments**: All monetary values are in cents (Stripe convention)
- **Rate Limiting**: Implemented on all AI endpoints
- **Logging**: The app uses extensive logging to `log.txt` file

### Critical Setup Steps
1. **Font Files**: Ensure Cal Sans font files are in `/public/fonts/`
2. **Supabase Tables**: All migrations must be run before first use
3. **School Data**: Run `npm run extract-schools` to populate school database
4. **Environment Variables**: ALL variables in `.env.local.example` are required

### AWS Bedrock Setup (for Claude)
The project uses Claude via AWS Bedrock. You'll need to:
1. Create an AWS account
2. Enable Bedrock in us-east-1 region
3. Request access to Claude models
4. Create IAM credentials with Bedrock permissions

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all environment variables are set
2. **Database Connection**: Verify Supabase credentials
3. **AI Provider Errors**: Check API keys and rate limits
4. **Font Loading**: Ensure Cal Sans fonts are in `/public/fonts`

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## Support & Documentation

- Check `/public/docs` for additional documentation
- Database backups are in `/backups` folder
- Example prompts and templates in `/libs/ai-prompt-template-example.ts`

## License

This project is private and proprietary. Please ensure you have proper authorization before using or distributing this code.
