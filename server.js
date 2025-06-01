// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY;

// Set up analytics file path (configurable via env var)
const analyticsPath = process.env.ANALYTICS_FILE_PATH 
  ? path.resolve(process.env.ANALYTICS_FILE_PATH)
  : path.join(__dirname, 'analytics.json');
if (!fs.existsSync(analyticsPath)) {
  fs.writeJsonSync(analyticsPath, { 
    visits: 0,
    pageLoads: {},
    visitors: {},
    lastReset: new Date().toISOString()
  });
}

// Middleware for logging
app.use(morgan('combined'));

// Middleware to track visits, IPs, and referrals
app.use((req, res, next) => {
  // Only count actual page views (not assets)
  if (req.path === '/' || req.path === '/index.html') {
    try {
      const analytics = fs.readJsonSync(analyticsPath);
      
      // Increment total visits
      analytics.visits += 1;
      
      // Track visits by date
      const today = new Date().toISOString().split('T')[0];
      analytics.pageLoads[today] = (analytics.pageLoads[today] || 0) + 1;
      
      // Get IP address
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').replace(/^::ffff:/, '');
      
      // Track unique visitors by IP
      analytics.visitors[ip] = analytics.visitors[ip] || {
        firstVisit: new Date().toISOString(),
        visits: 0,
        referrals: [],
        affiliates: []
      };
      
      // Update visitor data
      analytics.visitors[ip].visits += 1;
      analytics.visitors[ip].lastVisit = new Date().toISOString();
      
      // Track referrer for this visitor
      const referrer = req.headers.referer || 'direct';
      if (!analytics.visitors[ip].referrals.includes(referrer)) {
        analytics.visitors[ip].referrals.push(referrer);
      }
      
      // Track affiliate link for this visitor
      const affiliate = req.query.ref || req.query.affiliate;
      if (affiliate && !analytics.visitors[ip].affiliates.includes(affiliate)) {
        analytics.visitors[ip].affiliates.push(affiliate);
      }
      
      // Save analytics data
      fs.writeJsonSync(analyticsPath, analytics, { spaces: 2 });
    } catch (err) {
      console.error('Error updating analytics:', err);
    }
  }
  next();
});

// Serve static files
app.use(express.static(__dirname));

// Serve the HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'room_resonance_calculator.html'));
});

// API endpoint to view analytics (password protected)
app.get('/analytics', (req, res) => {
  const apiKey = req.query.key;
  
  // Simple API key check - you should use a more secure method in production
  if (!ANALYTICS_API_KEY || apiKey !== ANALYTICS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const analytics = fs.readJsonSync(analyticsPath);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Error reading analytics' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
