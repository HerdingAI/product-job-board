# Deployment Guide

## Deploy to Vercel

This application is optimized for deployment on Vercel:

### Automatic Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com) and import your repository
   - Vercel will automatically detect it's a Next.js project

2. **Set Environment Variables**
   In the Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**
   - Click "Deploy" and Vercel will build and deploy your app
   - You'll get a live URL that you can share

### Manual Deployment with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure your deployment
```

## Other Deployment Options

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Railway
1. Connect your GitHub repository to Railway
2. Railway will auto-detect Next.js and deploy
3. Add environment variables in Railway dashboard

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Verify jobs load from Supabase (read-only)
- [ ] Check filtering functionality
- [ ] Verify responsive design on mobile
- [ ] Update README with live URL
