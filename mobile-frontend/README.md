# OHW Parser Mobile Frontend

A modern, mobile-first React application for the GalileoSky Parser system. This frontend is completely separate from the existing desktop frontend and is specifically designed for mobile devices with touch-optimized interfaces.

## 🚀 Features

### Mobile-First Design
- **Responsive Layout**: Optimized for mobile screens with touch-friendly interactions
- **Bottom Navigation**: Easy thumb navigation with intuitive icons
- **Touch Gestures**: Swipe, tap, and pinch gestures for better mobile experience
- **Safe Area Support**: Proper handling of device notches and home indicators

### Core Functionality
- **Authentication**: Secure login with session management
- **Dashboard**: Real-time overview of devices and system status
- **Device Management**: View, search, and manage IoT devices
- **Real-time Tracking**: Live device location tracking with map interface
- **Data Visualization**: Charts and graphs for device data analysis
- **Settings**: User preferences and account management

### Technical Features
- **React 18**: Latest React features with hooks and concurrent rendering
- **React Query**: Efficient data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide Icons**: Beautiful, customizable icons
- **React Hook Form**: Performant forms with validation
- **React Router**: Client-side routing with navigation
- **Toast Notifications**: User-friendly feedback system

## 📱 Mobile Optimizations

### Performance
- **Lazy Loading**: Components and routes loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **Caching Strategy**: Intelligent data caching with React Query
- **Bundle Optimization**: Tree shaking and code splitting

### User Experience
- **Offline Support**: Basic offline functionality with cached data
- **Pull to Refresh**: Native mobile refresh gesture
- **Smooth Animations**: 60fps animations with CSS transforms
- **Haptic Feedback**: Touch feedback for better interaction
- **Keyboard Handling**: Proper mobile keyboard behavior

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on port 3001

### Setup
1. **Clone and navigate to the mobile frontend directory:**
   ```bash
   cd mobile-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open in your browser:**
   - The app will open at `http://localhost:3000`
   - For mobile testing, use your device's IP address or tools like ngrok

## 🏗️ Project Structure

```
mobile-frontend/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── LoadingSpinner.js
│   │   └── MobileLayout.js
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js
│   ├── pages/            # Page components
│   │   ├── Dashboard.js
│   │   ├── Devices.js
│   │   ├── DeviceDetail.js
│   │   ├── Login.js
│   │   ├── Settings.js
│   │   └── Tracking.js
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.js           # Main app component
│   ├── index.js         # App entry point
│   └── index.css        # Global styles
├── package.json
├── tailwind.config.js   # Tailwind configuration
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Main brand color
- **Success**: Green (#22c55e) - Positive states
- **Warning**: Orange (#f59e0b) - Caution states
- **Danger**: Red (#ef4444) - Error states
- **Gray Scale**: Neutral colors for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive Sizing**: Mobile-optimized text sizes

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Touch-friendly with proper spacing
- **Inputs**: Large touch targets with clear focus states
- **Navigation**: Bottom tab bar with active states

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

### Remote Access Configuration

The mobile frontend automatically detects the environment and configures the API URL accordingly:

- **Local Development**: Uses `http://localhost:3001/api`
- **Remote Server**: Uses `http://173.249.48.47:3001/api` (configured in `src/config.js`)
- **Custom Environment**: Set `REACT_APP_API_URL` environment variable

To configure for a different remote server:

1. **Update the configuration file** (`src/config.js`):
   ```javascript
   // Change this line in the getDefaultApiUrl() function
   if (hostname === 'your-server-ip') {
     return 'http://your-server-ip:3001/api';
   }
   ```

2. **Or use environment variable**:
   ```env
   REACT_APP_API_URL=http://your-server-ip:3001/api
   ```

3. **Update backend CORS** (in `backend/src/config/index.js`):
   ```javascript
   cors: {
     origin: [
       // ... existing origins
       'http://your-server-ip:3004'  // Add mobile frontend port
     ]
   }
   ```

### Tailwind Configuration
The `tailwind.config.js` file includes:
- Custom color palette
- Mobile-first breakpoints
- Custom animations
- Component utilities

## 📱 Mobile Testing

### Development
1. **Chrome DevTools**: Use device simulation
2. **Real Device**: Connect via USB and use Chrome remote debugging
3. **ngrok**: Tunnel your local server for external device testing

### Testing Checklist
- [ ] Touch interactions work properly
- [ ] Navigation is thumb-friendly
- [ ] Text is readable on small screens
- [ ] Forms are easy to fill on mobile
- [ ] Loading states are clear
- [ ] Error handling is user-friendly

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
1. **Static Hosting**: Netlify, Vercel, or GitHub Pages
2. **CDN**: Upload build folder to CDN
3. **PWA**: Install as mobile app on supported devices

### PWA Features
- **Offline Support**: Basic offline functionality
- **App Icon**: Custom app icon for home screen
- **Splash Screen**: Loading screen when app starts
- **Full Screen**: App runs in full-screen mode

## 🔌 API Integration

The mobile frontend connects to the same backend API as the desktop version:

- **Authentication**: `/api/auth/*`
- **Devices**: `/api/devices/*`
- **Data**: `/api/data/*`
- **Alerts**: `/api/alerts/*`
- **Settings**: `/api/settings/*`

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend
   - Verify API endpoints are accessible

2. **Mobile Layout Issues**
   - Test on actual mobile device
   - Check viewport meta tag
   - Verify safe area CSS variables

3. **Performance Issues**
   - Enable React DevTools Profiler
   - Check bundle size with webpack-bundle-analyzer
   - Optimize images and assets

## 🤝 Contributing

1. Follow the existing code style
2. Test on mobile devices
3. Ensure responsive design works
4. Update documentation as needed

## 📄 License

This project is part of the OHW Parser system and follows the same licensing terms.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the backend API documentation
3. Test with the existing desktop frontend for comparison 