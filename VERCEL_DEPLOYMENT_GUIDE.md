# Vercel Deployment Guide

This guide outlines the steps to deploy your app to Vercel after migrating from local file operations to Supabase database.

## ⚠️ Security Note

**IMPORTANT**: Some development scripts in the root directory may contain hardcoded project references. These are automatically excluded from deployment via `.vercelignore`. Never commit actual API keys or use these scripts in production.

## ✅ Pre-Deployment Checklist

### 1. Database Migration Complete
- [ ] Supabase migration applied: `20250104000001_create_school_data_tables.sql`
- [ ] School data migrated to database: Run `npx ts-node scripts/migrate-school-data-to-database.ts`
- [ ] Database contains all school data (verify in Supabase dashboard)

### 2. Environment Variables Ready
- [ ] All required environment variables documented below
- [ ] API keys available and valid
- [ ] Supabase configuration confirmed

### 3. Code Changes Applied
- [ ] `libs/school-data.ts` refactored to use Supabase
- [ ] All file system dependencies removed from production code
- [ ] `.vercelignore` file created to exclude development files

## 🔧 Required Environment Variables

Configure these in your Vercel dashboard (Project Settings → Environment Variables):

### Supabase Configuration (REQUIRED)
```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key (public-safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication (if using NextAuth)
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth (if configured)
GOOGLE_ID=your-google-oauth-client-id
GOOGLE_SECRET=your-google-oauth-client-secret
```

### AI Services (if used)
```bash
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Anthropic API Key (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Perplexity API Key (for research features)
PERPLEXITY_API_KEY=pplx-...
```

### Email Services (if configured)
```bash
# Resend Email Service
RESEND_API_KEY=re_...

# Email configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-resend-api-key
```

### Stripe (if using payments)
```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Domain and URL Configuration
```bash
# Domain configuration for absolute URLs
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_URL=https://yourdomain.com
```

## 🚀 Deployment Steps

### Step 1: Verify Local Setup
1. Ensure your database migration completed successfully
2. Test API routes locally to confirm they work with database
3. Check that no file system operations remain in production code

### Step 2: Vercel Project Setup
1. Connect your repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

### Step 3: Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required environment variables listed above
3. Set environment to **Production**, **Preview**, and **Development** as needed

### Step 4: Database Access
1. Ensure Supabase project allows connections from Vercel's IP ranges
2. Verify RLS (Row Level Security) policies are configured correctly
3. Test database connection from Vercel functions

### Step 5: Deploy
1. Deploy from Vercel dashboard or push to main branch
2. Monitor build logs for any errors
3. Test deployed application functionality

## 🧪 Post-Deployment Testing

### Test these endpoints after deployment:
- [ ] `GET /api/schools` - List all schools
- [ ] `GET /api/schools?q=austin` - Search schools
- [ ] `GET /api/schools?id=alpha-austin` - Get specific school
- [ ] `GET /api/media?type=videos` - Get all videos
- [ ] `GET /api/media?type=images` - Get all images

### Test these features:
- [ ] School search functionality in quiz
- [ ] School report cards display correctly
- [ ] Marketing images load from database
- [ ] No errors in browser console
- [ ] No 500 errors in Vercel function logs

## 🔍 Debugging Common Issues

### Issue: "Missing Supabase configuration"
**Solution**: Verify environment variables are set correctly in Vercel dashboard

### Issue: "School data not found"
**Solution**: Ensure database migration completed and data was migrated successfully

### Issue: "RLS policy violation"
**Solution**: Check Supabase RLS policies allow public read access to school data

### Issue: "Function timeout"
**Solution**: Optimize database queries or enable caching

### Issue: "Build fails with file system errors"
**Solution**: Check that all `fs` imports are removed from production code

## 📊 Performance Monitoring

After deployment, monitor:
- Function execution times in Vercel dashboard
- Database query performance in Supabase dashboard
- API response times
- Error rates and logs

## 🔄 Rollback Plan

If deployment fails:
1. Revert to previous Vercel deployment
2. Check function logs for specific errors
3. Verify environment variables are correct
4. Test database connectivity
5. Re-deploy after fixing issues

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Check Supabase logs and metrics
3. Verify all environment variables are set
4. Test API endpoints directly using curl or Postman
5. Check browser network tab for failed requests

---

**Note**: This migration removes all local file system dependencies, making your app fully compatible with Vercel's serverless environment. All school data is now served from the Supabase database instead of local JSON files.