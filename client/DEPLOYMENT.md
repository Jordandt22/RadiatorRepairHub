# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **API Server**: Ensure your backend API is deployed and accessible

## Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Environment Variables

```bash
# API Configuration
API_URI=https://your-api-domain.com/api
NEXT_PUBLIC_API_URI=https://your-api-domain.com/api

# Business Information
BUSINESS_EMAIL=contact@radiatorrepairhub.com
WEB_URL=https://radiatorrepairhub.com

# Search Engine Verification (Optional)
GOOGLE_VERIFICATION_ID=your-google-verification-id
YAHOO_VERIFICATION_ID=your-yahoo-verification-id

# Google Maps API (Required for business pages)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# EmailJS Configuration (Required for contact forms)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-emailjs-service-id
NEXT_PUBLIC_EMAILJS_MSG_TEMPLATE_ID=your-emailjs-template-id
NEXT_PUBLIC_EMAILJS_API_KEY=your-emailjs-api-key
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `client` folder as the root directory

### 2. Configure Build Settings

Vercel should automatically detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Set Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add each environment variable from the list above
3. Make sure to set them for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy" to start the deployment
2. Wait for the build to complete
3. Your site will be available at the provided Vercel URL

## Post-Deployment Checklist

### ✅ Verify These Features Work:

1. **Homepage loads correctly**
2. **Navigation works**
3. **Search functionality works**
4. **Business pages load with Google Maps**
5. **Contact form sends emails**
6. **All static pages load (About, FAQ, etc.)**
7. **Sitemap is accessible**: `https://your-domain.com/sitemap.xml`
8. **Robots.txt is accessible**: `https://your-domain.com/robots.txt`

### 🔧 Common Issues & Solutions:

#### Build Fails

- Check that all environment variables are set
- Ensure API server is accessible from Vercel
- Check build logs for specific errors

#### API Calls Fail

- Verify `API_URI` and `NEXT_PUBLIC_API_URI` are correct
- Check CORS settings on your API server
- Ensure API server allows requests from Vercel domain

#### Google Maps Not Loading

- Verify `GOOGLE_MAPS_API_KEY` is set correctly
- Check Google Maps API quotas and billing
- Ensure API key has proper permissions

#### Contact Form Not Working

- Verify EmailJS environment variables are set
- Check EmailJS service configuration
- Test EmailJS template and service settings

## Custom Domain Setup

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `WEB_URL` environment variable to match your domain

## Performance Optimization

The app is already optimized with:

- ✅ Image optimization with Next.js
- ✅ Static generation for better performance
- ✅ Proper caching headers
- ✅ Service Worker for offline functionality
- ✅ PWA manifest for mobile experience

## Monitoring

- Use Vercel Analytics to monitor performance
- Check Vercel Functions logs for server-side issues
- Monitor API response times and errors

## Security

The app includes these security headers:

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: origin-when-cross-origin
- ✅ Permissions-Policy for camera, microphone, geolocation

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test API endpoints independently
4. Check browser console for client-side errors
