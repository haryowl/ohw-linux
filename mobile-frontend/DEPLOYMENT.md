# Mobile Frontend Deployment Guide

This guide covers deploying the Gali Parse Mobile Frontend to various hosting platforms.

## 🚀 Quick Start

### Local Development
```bash
# Navigate to mobile frontend directory
cd mobile-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Production Build
```bash
# Create production build
npm run build

# The build folder will contain optimized files
```

## 📱 Deployment Options

### 1. Netlify (Recommended)

**Free tier includes:**
- Custom domains
- HTTPS
- Global CDN
- Form handling
- Functions

**Steps:**
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Deploy!

**Environment Variables:**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production
```

### 2. Vercel

**Features:**
- Automatic deployments
- Edge functions
- Analytics
- Preview deployments

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Set environment variables in dashboard

### 3. GitHub Pages

**Steps:**
1. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/your-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. Install gh-pages: `npm install --save-dev gh-pages`
3. Deploy: `npm run deploy`

### 4. AWS S3 + CloudFront

**Steps:**
1. Create S3 bucket
2. Enable static website hosting
3. Upload build folder
4. Create CloudFront distribution
5. Configure custom domain

### 5. Firebase Hosting

**Steps:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🔧 Configuration

### Environment Variables

Create `.env` files for different environments:

**.env.development:**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

**.env.production:**
```env
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_ENVIRONMENT=production
```

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// Backend CORS configuration
cors: {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}
```

### PWA Configuration

The app includes PWA features. Update `public/manifest.json`:

```json
{
  "short_name": "Gali Parse",
  "name": "GalileoSky Parser Mobile",
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

## 📱 Mobile Testing

### Real Device Testing

1. **Local Network:**
   - Find your computer's IP address
   - Access via `http://YOUR_IP:3000`

2. **ngrok (External Access):**
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

3. **Chrome DevTools:**
   - Open DevTools
   - Click device icon
   - Select mobile device

### Testing Checklist

- [ ] Touch interactions work
- [ ] Navigation is thumb-friendly
- [ ] Text is readable
- [ ] Forms are easy to use
- [ ] Loading states are clear
- [ ] Error handling works
- [ ] Offline functionality (if implemented)

## 🔒 Security Considerations

### HTTPS
- Always use HTTPS in production
- Configure SSL certificates
- Redirect HTTP to HTTPS

### API Security
- Use environment variables for API URLs
- Implement proper authentication
- Validate all inputs
- Use HTTPS for API calls

### Content Security Policy
Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

## 📊 Performance Optimization

### Build Optimization
- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Enable caching headers

### Runtime Optimization
- Lazy load components
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize bundle size

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check CORS configuration
   - Verify API URL in environment variables
   - Test API endpoints directly

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all dependencies are installed

3. **Mobile Layout Issues**
   - Test on actual device
   - Check viewport meta tag
   - Verify CSS media queries

4. **Performance Issues**
   - Use React DevTools Profiler
   - Check bundle size
   - Optimize images and assets

### Debug Commands

```bash
# Check bundle size
npm run build
npx serve -s build

# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check for unused dependencies
npm install --save-dev depcheck
npx depcheck
```

## 📈 Monitoring

### Analytics
- Google Analytics
- Hotjar for user behavior
- Sentry for error tracking

### Performance Monitoring
- Lighthouse audits
- Core Web Vitals
- Real User Monitoring (RUM)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Mobile Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=build --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Test with a simple React app first
4. Check browser console for errors 