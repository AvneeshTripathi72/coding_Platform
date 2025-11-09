# AWS EC2 Deployment Guide - Code Verse Platform

Complete step-by-step guide for deploying Code Verse (or any similar full-stack application) to AWS EC2 with Nginx reverse proxy.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [EC2 Instance Setup](#ec2-instance-setup)
- [Server Initial Setup](#server-initial-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Nginx Configuration](#nginx-configuration)
- [PM2 Process Management](#pm2-process-management)
- [Firewall Configuration](#firewall-configuration)
- [Environment Variables](#environment-variables)
- [Testing & Verification](#testing--verification)
- [Troubleshooting](#troubleshooting)
- [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04+ recommended)
- Domain name or public IP address
- SSH access to EC2 instance
- Node.js 18+ installed on server
- MongoDB database (local or Atlas)
- Redis server (optional but recommended)

---

## EC2 Instance Setup

### 1. Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 20.04 LTS or later
3. Select instance type (t2.micro minimum for testing)
4. Configure Security Group:
   - **SSH (22)**: Your IP only
   - **HTTP (80)**: 0.0.0.0/0 (all traffic)
   - **HTTPS (443)**: 0.0.0.0/0 (if using SSL)
   - **Custom TCP (3000)**: 0.0.0.0/0 (for direct backend access during testing)

### 2. Connect to EC2

```bash
# From your local machine
ssh -i "your-key.pem" ubuntu@YOUR_PUBLIC_IP
```

---

## Server Initial Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Git

```bash
sudo apt install git -y
```

---

## Backend Deployment

### 1. Clone Repository

```bash
cd ~
git clone <your-repository-url> coding_Platform
cd coding_Platform/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
nano .env
```

Add all required environment variables (see backend README for full list):

```env
PORT=3000
DB_URL=mongodb://localhost:27017/code_verse
JWT_SECRET=your_jwt_secret_here
REDIS_HOST=localhost
REDIS_PORT=6379
# ... other variables
```

### 4. Start Backend with PM2

```bash
# Start backend
pm2 start src/index.js --name backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs backend
```

### 5. Verify Backend is Running

```bash
# Test locally on server
curl http://localhost:3000/auth/health
# or
curl http://localhost:3000/users/test
```

---

## Frontend Deployment

### 1. Navigate to Frontend Directory

```bash
cd ~/coding_Platform/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Production Environment

```bash
nano .env
```

Add:

```env
VITE_API_BASE_URL=http://YOUR_PUBLIC_IP/api
```

**Important**: Replace `YOUR_PUBLIC_IP` with your actual EC2 public IP (e.g., `http://3.109.157.144/api`)

### 4. Build Frontend

```bash
npm run build
```

This creates a `dist/` folder with production-ready files.

### 5. Verify Build Output

```bash
ls -la dist/
# Should see: index.html, assets/, vite.svg
```

---

## Nginx Configuration

### 1. Remove Default Configuration

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Create New Site Configuration

```bash
sudo nano /etc/nginx/sites-available/my-app
```

### 3. Add Correct Configuration

**⚠️ CRITICAL**: This configuration handles both frontend and backend correctly:

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;  # e.g., 3.109.157.144

    # Serve frontend (React/Vite build)
    root /home/ubuntu/coding_Platform/frontend/dist;
    index index.html;

    # Frontend routing (SPA support)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy backend API requests
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Key Points:**
- `root` points to your frontend `dist/` folder
- `location /api/` proxies to `http://localhost:3000/api/`
- The trailing slash in `proxy_pass` is important for path rewriting

### 4. Enable Site Configuration

```bash
sudo ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/my-app
```

### 5. Test and Restart Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### 6. Fix File Permissions

```bash
# Set correct permissions for frontend files
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/coding_Platform
sudo chmod 755 /home/ubuntu/coding_Platform/frontend
sudo chmod -R 755 /home/ubuntu/coding_Platform/frontend/dist
```

---

## PM2 Process Management

### Useful PM2 Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs backend

# Restart backend
pm2 restart backend

# Stop backend
pm2 stop backend

# Delete process
pm2 delete backend

# Monitor
pm2 monit

# Save current process list
pm2 save

# Clear all logs
pm2 flush
```

### Reset PM2 (If Needed)

```bash
pm2 stop all
pm2 delete all
pm2 flush
pm2 unstartup

# Then start fresh
cd ~/coding_Platform/backend
pm2 start src/index.js --name backend
pm2 save
pm2 startup
```

---

## Firewall Configuration

### 1. Configure UFW (Ubuntu Firewall)

```bash
# Allow SSH
sudo ufw allow ssh

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow port 3000 (for direct backend testing)
sudo ufw allow 3000

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### 2. Verify EC2 Security Group

In AWS Console:
- EC2 → Instances → Your Instance → Security
- Ensure inbound rules allow:
  - Port 22 (SSH) from your IP
  - Port 80 (HTTP) from 0.0.0.0/0
  - Port 3000 (optional, for testing)

---

## Environment Variables

### Backend `.env` File

Location: `~/coding_Platform/backend/.env`

```env
# Server
PORT=3000

# Database
DB_URL=mongodb://localhost:27017/code_verse
# OR MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/code_verse

# JWT
JWT_SECRET=your_very_secure_secret_key_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_any

# Cloudinary (for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=code_arena_videos

# Judge0 (for code execution)
JUDGEO_URL=https://judge0-ce.p.rapidapi.com
JUDGEO_RAPIDAPI_KEY=your_rapidapi_key
JUDGEO_RAPID_HOST=judge0-ce.p.rapidapi.com

# Google Gemini (for AI chat)
gemniKey=your_gemini_api_key
```

### Frontend `.env` File

Location: `~/coding_Platform/frontend/.env`

```env
# Production API Base URL
VITE_API_BASE_URL=http://YOUR_PUBLIC_IP/api
```

**Important**: 
- Replace `YOUR_PUBLIC_IP` with your actual EC2 public IP
- The URL **must end with `/api`** to match Nginx proxy configuration
- Example: `http://3.109.157.144/api`

---

## Testing & Verification

### 1. Test Frontend

```bash
# From server
curl http://localhost
# Should return HTML content
```

Open in browser: `http://YOUR_PUBLIC_IP`

### 2. Test Backend Directly

```bash
# From server
curl http://localhost:3000/auth/health
# or
curl http://localhost:3000/users/test
```

### 3. Test Backend Through Nginx

```bash
# From server
curl http://localhost/api/auth/health
# or
curl http://localhost/api/users/test
```

### 4. Test from Postman

**Register User:**
```
POST http://YOUR_PUBLIC_IP/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "emailId": "test@example.com",
  "password": "test12345",
  "age": 25
}
```

**Login:**
```
POST http://YOUR_PUBLIC_IP/api/auth/login
Content-Type: application/json

{
  "emailId": "test@example.com",
  "password": "test12345"
}
```

### 5. Check All Services

```bash
# Backend status
pm2 status

# Nginx status
sudo systemctl status nginx

# Check if ports are listening
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

---

## Troubleshooting

### Backend Not Starting

**Check PM2 logs:**
```bash
pm2 logs backend
```

**Common issues:**
- Missing environment variables → Check `.env` file
- MongoDB connection failed → Verify `DB_URL` and MongoDB is running
- Port 3000 already in use → Change `PORT` in `.env` or kill process on port 3000

### Frontend Not Loading (403 Forbidden)

**Check file permissions:**
```bash
sudo chmod -R 755 /home/ubuntu/coding_Platform/frontend/dist
```

**Check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Verify Nginx config:**
```bash
sudo nginx -t
```

### API Requests Failing

**Check Nginx proxy configuration:**
- Ensure `location /api/` block exists
- Verify `proxy_pass` points to `http://localhost:3000/api/`
- Check backend is running: `pm2 status`

**Test backend directly:**
```bash
curl http://localhost:3000/auth/health
```

**Check CORS settings in backend:**
- Ensure your frontend URL is in allowed origins
- Check `backend/src/index.js` CORS configuration

### 500 Internal Server Error

**Check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Check backend logs:**
```bash
pm2 logs backend
```

**Common causes:**
- Backend crashed → Check PM2 status
- Database connection issue → Verify MongoDB connection
- Missing environment variables → Check `.env` file

### Cannot Connect from Outside

**Check firewall:**
```bash
sudo ufw status
```

**Check EC2 Security Group:**
- Ensure port 80 is open to 0.0.0.0/0
- Ensure port 22 is open to your IP

**Test from server:**
```bash
curl http://localhost
curl http://localhost/api/auth/health
```

---

## Common Issues & Solutions

### Issue 1: Duplicate `location /` in Nginx Config

**Error:** `duplicate location "/" in /etc/nginx/sites-enabled/my-app`

**Solution:** Only have ONE `location /` block for frontend. Backend should use `location /api/`.

### Issue 2: Frontend Calls Wrong API URL

**Problem:** Frontend calls `/auth/register` but should call `/api/auth/register`

**Solution:** 
1. Set `VITE_API_BASE_URL=http://YOUR_PUBLIC_IP/api` in frontend `.env`
2. Rebuild frontend: `npm run build`
3. Restart Nginx: `sudo systemctl restart nginx`

### Issue 3: Backend Routes Don't Match

**Problem:** Backend has `/auth/register` but Nginx expects `/api/auth/register`

**Solution Options:**

**Option A (Recommended):** Keep backend routes as-is, Nginx strips `/api`:
```nginx
location /api/ {
    proxy_pass http://localhost:3000/;  # Note: no /api/ here
}
```

**Option B:** Add `/api` prefix to all backend routes in `src/index.js`:
```javascript
app.use('/api/auth', authRouter);
app.use('/api/problems', problemRouter);
// etc.
```

### Issue 4: Build Fails with Terser Error

**Error:** `[vite:terser] terser not found`

**Solution:** Update `vite.config.js`:
```javascript
build: {
  minify: 'esbuild',  // Use esbuild instead of terser
}
```

### Issue 5: Node.js Version Warning

**Warning:** `You are using Node.js 22.9.0. Vite requires Node.js version 20.19+ or 22.12+`

**Solution:** This is just a warning, build will still work. To fix:
- Upgrade to Node.js 22.12+ or use Node.js 20.19+
- Or downgrade Vite to version 6.x

### Issue 6: PM2 Process Not Starting on Reboot

**Solution:**
```bash
pm2 startup
# Run the command it outputs
pm2 save
```

### Issue 7: CORS Errors in Browser

**Solution:** Update backend CORS configuration in `backend/src/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://YOUR_PUBLIC_IP',
  'http://YOUR_DOMAIN.com'
];
```

### Issue 8: Cookies Not Working

**Solution:**
- Ensure `withCredentials: true` in frontend axios calls
- Check CORS allows credentials
- Verify cookie domain settings in backend

---

## Quick Reference Commands

### Backend Management

```bash
# Start
pm2 start src/index.js --name backend

# Restart
pm2 restart backend

# Stop
pm2 stop backend

# View logs
pm2 logs backend

# Status
pm2 status
```

### Frontend Management

```bash
# Build
cd ~/coding_Platform/frontend
npm run build

# After build, restart Nginx
sudo systemctl restart nginx
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Reload (without downtime)
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Management

```bash
# Check all services
pm2 status
sudo systemctl status nginx

# Check ports
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# Check disk space
df -h

# Check memory
free -h
```

---

## Deployment Checklist

- [ ] EC2 instance launched with correct security group
- [ ] Node.js and npm installed
- [ ] Nginx installed and running
- [ ] PM2 installed globally
- [ ] Repository cloned to server
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Backend running with PM2
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` file configured with correct API URL
- [ ] Frontend built successfully
- [ ] Nginx configuration file created
- [ ] Nginx site enabled
- [ ] File permissions set correctly
- [ ] Firewall configured (UFW)
- [ ] EC2 Security Group allows port 80
- [ ] Backend accessible at `http://localhost:3000`
- [ ] Frontend accessible at `http://YOUR_PUBLIC_IP`
- [ ] API accessible at `http://YOUR_PUBLIC_IP/api/...`
- [ ] Tested registration and login from browser
- [ ] PM2 startup configured
- [ ] All services restarting correctly after reboot

---

## Architecture Overview

```
Internet
   │
   ▼
EC2 Instance (Port 80)
   │
   ├──► Nginx (Reverse Proxy)
   │     │
   │     ├──► / → Frontend (dist/)
   │     │
   │     └──► /api/ → Backend (localhost:3000)
   │
   └──► Backend (PM2)
         │
         ├──► MongoDB
         ├──► Redis
         └──► External APIs
```

---

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Notes for Future Deployments

1. **Always test locally first** before deploying to production
2. **Use environment variables** for all configuration
3. **Keep build outputs** (dist/) out of git
4. **Monitor logs regularly** using `pm2 logs` and `nginx error.log`
5. **Set up SSL/HTTPS** using Let's Encrypt for production
6. **Use domain name** instead of IP address for better management
7. **Set up automated backups** for database
8. **Monitor server resources** (CPU, memory, disk)
9. **Keep dependencies updated** regularly
10. **Document any custom configurations** for your specific setup

---

**Last Updated:** November 2024

**For questions or issues, refer to the main README.md or create an issue in the repository.**

