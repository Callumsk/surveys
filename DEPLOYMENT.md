# Deployment Guide - ECO4 Survey Management System

This guide will help you deploy the ECO4 Survey Management System to various hosting platforms so it can be accessed via a live URL with real-time updates.

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free)
1. **Fork this repository** to your GitHub account
2. **Sign up** at [render.com](https://render.com)
3. **Connect your GitHub** account
4. **Create a new Web Service**
5. **Select your forked repository**
6. **Configure:**
   - **Name**: `eco4-survey-management`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
7. **Deploy** and get your live URL!

### Option 2: Railway (Free Tier)
1. **Fork this repository** to your GitHub account
2. **Sign up** at [railway.app](https://railway.app)
3. **Connect your GitHub** account
4. **Deploy from GitHub** and select your repository
5. **Railway will automatically detect** the configuration from `railway.json`
6. **Get your live URL** from the dashboard

### Option 3: Heroku (Free Tier Discontinued)
1. **Fork this repository** to your GitHub account
2. **Sign up** at [heroku.com](https://heroku.com)
3. **Install Heroku CLI**
4. **Deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku open
   ```

### Option 4: Vercel (Free)
1. **Fork this repository** to your GitHub account
2. **Sign up** at [vercel.com](https://vercel.com)
3. **Import your repository**
4. **Configure build settings:**
   - **Framework Preset**: Node.js
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`
5. **Deploy** and get your live URL!

## 📋 Manual Deployment Steps

### Prerequisites
- Node.js 14+ installed
- Git installed
- GitHub account

### Step 1: Prepare Your Repository
1. **Fork or clone** this repository
2. **Ensure all files** are present:
   ```
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── server.js
   ├── package.json
   ├── Procfile (for Heroku)
   ├── render.yaml (for Render)
   ├── railway.json (for Railway)
   └── README.md
   ```

### Step 2: Test Locally
```bash
npm install
npm start
```
Visit `http://localhost:3000` to verify everything works.

### Step 3: Deploy to Your Chosen Platform
Follow the specific instructions for your chosen platform above.

## 🔧 Environment Variables

### Production Environment Variables
- `PORT`: Server port (auto-set by hosting platforms)
- `NODE_ENV`: Set to `production` for production mode
- `HOST`: Host binding (usually `0.0.0.0` for cloud platforms)

### Optional Environment Variables
- `DATABASE_URL`: For database integration (future enhancement)
- `JWT_SECRET`: For authentication (future enhancement)

## 🌐 Domain Configuration

### Custom Domain Setup
1. **Purchase a domain** (e.g., from Namecheap, GoDaddy)
2. **Configure DNS** to point to your hosting platform
3. **Add custom domain** in your hosting platform dashboard
4. **Enable HTTPS** (usually automatic on modern platforms)

### Subdomain Setup
- **Render**: `your-app.onrender.com`
- **Railway**: `your-app.railway.app`
- **Heroku**: `your-app.herokuapp.com`
- **Vercel**: `your-app.vercel.app`

## 🔒 Security Considerations

### Production Security
1. **Enable HTTPS** (automatic on most platforms)
2. **Set up environment variables** for sensitive data
3. **Configure CORS** properly for your domain
4. **Implement rate limiting** (future enhancement)
5. **Add authentication** (future enhancement)

### Data Persistence
- **Current**: File-based storage (`data.json`)
- **Recommended**: Database storage (MongoDB, PostgreSQL)
- **Backup**: Regular backups of your data

## 📊 Monitoring and Logs

### Accessing Logs
- **Render**: Dashboard → Your Service → Logs
- **Railway**: Dashboard → Your Service → Logs
- **Heroku**: `heroku logs --tail`
- **Vercel**: Dashboard → Your Project → Functions → Logs

### Health Check
Your deployed app includes a health check endpoint:
```
GET https://your-app-url.com/health
```

## 🚨 Troubleshooting

### Common Issues

#### App Won't Start
- Check if `package.json` has correct start script
- Verify Node.js version compatibility
- Check build logs for errors

#### WebSocket Connection Issues
- Ensure hosting platform supports WebSocket
- Check if port is properly configured
- Verify CORS settings

#### Data Not Persisting
- Check if platform supports file system writes
- Consider using database instead of file storage
- Verify environment variables

### Debug Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Test locally
npm start

# Check logs (if using Heroku)
heroku logs --tail
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📱 Mobile Access

### Progressive Web App (PWA)
To make your app installable on mobile devices:
1. Add a `manifest.json` file
2. Add service worker for offline functionality
3. Configure app icons and splash screens

## 🎯 Performance Optimization

### Production Optimizations
1. **Enable compression** (gzip)
2. **Set up caching** headers
3. **Optimize images** and assets
4. **Minify CSS/JS** files
5. **Use CDN** for static assets

### Database Integration
For better performance and scalability:
1. **MongoDB Atlas** (free tier available)
2. **PostgreSQL** on Railway/Heroku
3. **Redis** for caching

## 📞 Support

### Getting Help
1. **Check logs** in your hosting platform dashboard
2. **Test locally** to isolate issues
3. **Review platform documentation**
4. **Check GitHub issues** for similar problems

### Platform Support
- **Render**: [docs.render.com](https://docs.render.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

**🎉 Congratulations!** Once deployed, your ECO4 Survey Management System will be accessible via a live URL with full real-time functionality for multiple users.
