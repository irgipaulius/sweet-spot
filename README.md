# Sweet Spot - Room Resonance Calculator

A web application that calculates and visualizes room resonance modes and their interaction with guitar notes.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file to set your own values.

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

   Or with PM2 for production:
   ```
   pm2 start server.js --name sweet-spot
   ```

3. Access the application:
   - Local development: http://localhost:3000
   - Production: Configure your reverse proxy to point to the port specified in server.js

## Analytics

The server tracks comprehensive usage statistics:
- Total number of visits
- Daily page loads
- Unique visitors by IP address
- Each visitor's referral sources and affiliate links

To view analytics, visit `/analytics?key=YOUR_API_KEY` where `YOUR_API_KEY` is set as an environment variable `ANALYTICS_API_KEY`.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `ANALYTICS_API_KEY`: Secret key for accessing analytics

## Affiliate Link Tracking

To track visitors from affiliate links, add a query parameter to your URL:

```
https://your-domain.com/?ref=affiliate_name
```

Alternatively, you can use:

```
https://your-domain.com/?affiliate=affiliate_name
```

The analytics will track how many visitors came from each affiliate.

## Deployment with PM2 and Reverse Proxy

1. Set environment variables:
   ```
   export PORT=3000
   export ANALYTICS_API_KEY=your_secret_key
   export IP_SALT=random_string_for_hashing
   ```

2. Start with PM2:
   ```
   pm2 start server.js --name sweet-spot --env production
   ```

3. Configure Nginx reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
