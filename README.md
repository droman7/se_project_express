WTWR SPRINT 15 Front-end Deployment

Created subdomains using Google Cloud VM.
Issued SSL certificates using Certbot.
Nginx was used to serve HTTPS traffic and automatically redirects HTTP traffic to HTTPS.

The backend runs on Node.js with Express and MongoDB and is managed by PM2 for stability. The frontend is a React app served as static files through nginx. All parts are connected securely over HTTPS.

Frontend: caliberwtwr.minecraftnoob.com
