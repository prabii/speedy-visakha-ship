# Deploy Frontend to Vercel

## Step-by-Step Deployment Guide

### Prerequisites
1. GitHub account with code pushed to https://github.com/prabii/VZ.git
2. Vercel account (sign up at https://vercel.com - free with GitHub)

### Step 1: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Git Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select: `prabii/VZ`
   - Click "Import"

### Step 2: Configure Project Settings

**Framework Preset:**
- Framework Preset: `Vite` (auto-detected)

**Root Directory:**
- Click "Edit" next to Root Directory
- Set to: `speedy-visakha-ship` ⚠️ **IMPORTANT!**

**Build Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)
- Install Command: `npm install` (auto-detected)

**Environment Variables:**
Click "Environment Variables" and add:
```
VITE_API_BASE_URL=https://vz-karr.onrender.com/api
```

### Step 3: Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build your app
   - Deploy to production
3. Wait for deployment (usually 1-3 minutes)

### Step 4: Get Your Frontend URL

After deployment:
- Your app will be available at: `https://your-app-name.vercel.app`
- Or your custom domain if configured
- Vercel provides HTTPS automatically

### Important Configuration

✅ **vercel.json** is already created in the project
- This file handles SPA routing (fixes 404 errors)
- All routes redirect to `index.html` for React Router

### Troubleshooting

**404 Errors:**
- ✅ Fixed with `vercel.json` configuration
- Make sure `vercel.json` is in the `speedy-visakha-ship` folder
- Verify Root Directory is set to `speedy-visakha-ship`

**Build Fails:**
- Check Root Directory is `speedy-visakha-ship`
- Verify `package.json` exists
- Check build logs in Vercel dashboard

**API Connection Issues:**
- Verify `VITE_API_BASE_URL` environment variable is set
- Check backend CORS allows your Vercel domain
- Test backend URL: `https://vz-karr.onrender.com/api/health`

### Update Backend CORS

In your Render backend, update `CORS_ORIGIN` to include your Vercel URL:
```
https://your-app.vercel.app,https://vz-karr.onrender.com,http://localhost:5173,http://localhost:8080
```

### Vercel Features

- **Auto-Deploy**: Automatically deploys on git push
- **Preview Deployments**: Creates preview for every PR
- **Custom Domain**: Add your own domain (free)
- **Analytics**: Built-in performance monitoring
- **HTTPS**: Automatic SSL certificates

### Next Steps

1. ✅ Frontend deployed to Vercel
2. ✅ Backend deployed to Render
3. Update backend CORS to allow Vercel domain
4. Test all features end-to-end
