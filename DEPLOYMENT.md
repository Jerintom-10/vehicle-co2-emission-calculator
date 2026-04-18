# 📦 EcoVehicle Deployment Guide

Complete guide for deploying EcoVehicle to production environments.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB production instance set up
- [ ] Backend tested and working locally
- [ ] Frontend builds without errors
- [ ] All tests passing
- [ ] Security review completed
- [ ] Backup and restore procedures tested

## Backend Deployment

### Option 1: Deploy to AWS (EC2)

#### Prerequisites
- AWS EC2 instance (Ubuntu 20.04 or later)
- SSH access to instance
- Security group configured (ports 80, 443, 8000)

#### Steps

1. **Connect to instance**
```bash
ssh -i key.pem ubuntu@your-instance-ip
```

2. **Install dependencies**
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

3. **Clone repository**
```bash
git clone https://github.com/yourusername/ecovehicle.git
cd ecovehicle/backend
```

4. **Setup virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

5. **Create .env file**
```bash
nano .env
```
```
FASTAPI_ENV=production
MONGODB_URL=your-mongodb-production-url
DATABASE_NAME=ecovehicle_prod
SECRET_KEY=your-strong-secret-key
JWT_SECRET=your-strong-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

6. **Create systemd service**
```bash
sudo nano /etc/systemd/system/ecovehicle.service
```
```ini
[Unit]
Description=EcoVehicle Backend
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/ecovehicle/backend
Environment="PATH=/home/ubuntu/ecovehicle/backend/venv/bin"
ExecStart=/home/ubuntu/ecovehicle/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

7. **Enable and start service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ecovehicle
sudo systemctl start ecovehicle
sudo systemctl status ecovehicle
```

8. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/ecovehicle
```
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

9. **Enable and test Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/ecovehicle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
```bash
curl https://cli.github.com/install | bash
heroku login
```

2. **Create Heroku app**
```bash
heroku create ecovehicle-api
```

3. **Set environment variables**
```bash
heroku config:set FASTAPI_ENV=production
heroku config:set MONGODB_URL=your-mongodb-url
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET=your-jwt-secret
```

4. **Create Procfile**
```bash
cd backend
echo "web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app" > Procfile
```

5. **Deploy**
```bash
git push heroku main
heroku logs --tail
```

### Option 3: Deploy with Docker

1. **Create Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build and run**
```bash
docker build -t ecovehicle-backend .
docker run -d -p 8000:8000 --name ecovehicle \
  -e MONGODB_URL=your-url \
  ecovehicle-backend
```

## Frontend Deployment

### Option 1: Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

2. **Deploy**
```bash
cd frontend
vercel
```

3. **Update environment variables**
```bash
vercel env add VITE_API_URL https://your-api-domain.com/api
```

### Option 2: Deploy to Netlify

1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Deploy via Netlify UI**
- Go to netlify.com
- Drag and drop `dist` folder
- Or connect GitHub repository

3. **Configure build settings**
```
Build command: npm run build
Publish directory: dist
```

4. **Set environment variables**
```
VITE_API_URL = https://your-api-domain.com/api
```

### Option 3: Deploy to AWS S3 + CloudFront

1. **Build**
```bash
cd frontend
npm run build
```

2. **Create S3 bucket**
```bash
aws s3 mb s3://ecovehicle-frontend
aws s3 sync dist/ s3://ecovehicle-frontend/
```

3. **Create CloudFront distribution**
- Set S3 bucket as origin
- Set alternate domain name
- Request SSL certificate

## Production Environment Configuration

### Backend (.env)

```env
# Server
FASTAPI_ENV=production
API_HOST=0.0.0.0
API_PORT=8000

# Database
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=ecovehicle_production

# Security
SECRET_KEY=generate-with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=generate-with: python -c "import secrets; print(secrets.token_urlsafe(32))"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000
VITE_ENV=production
```

## Database Setup

### MongoDB Atlas (Recommended for production)

1. **Create account** at mongodb.com/cloud
2. **Create cluster** with M2 or higher tier
3. **Create database user** with strong password
4. **Whitelist IP** of your server
5. **Get connection string** and add to .env

### Backup Strategy

```bash
# Automated daily backup
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backups/ecovehicle-$(date +\%Y\%m\%d)
```

## Monitoring & Logging

### Application Logging

```python
# Configure logging in main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Performance Monitoring

- Use APM (Application Performance Monitoring)
- Options: Datadog, New Relic, Sentry
- Track: Response times, errors, database queries

### Error Tracking

```python
# Install Sentry
pip install sentry-sdk

# Configure in main.py
import sentry_sdk
sentry_sdk.init(
    dsn="https://your-sentry-dsn",
    environment="production",
    traces_sample_rate=0.1
)
```

## Security Best Practices

### HTTPS/SSL
- ✅ Always use HTTPS
- ✅ Use Let's Encrypt for free certificates
- ✅ Enable HSTS header

### Environment Variables
- ✅ Never commit .env files
- ✅ Use strong secrets (32+ chars)
- ✅ Rotate secrets regularly

### CORS
- ✅ Only allow frontend domain
- ✅ Set specific methods (GET, POST, etc.)
- ✅ Disable credentials for public endpoints

### Database
- ✅ Use MongoDB Atlas authentication
- ✅ IP whitelist only necessary IPs
- ✅ Enable backups
- ✅ Use read-only users where applicable

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request):
    ...
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
```
  ┌──────────────────┐
  │  Load Balancer   │
  └──────────────────┘
         ↙  ↓  ↖
    ┌────┐ ┌────┐ ┌────┐
    │API1│ │API2│ │API3│
    └────┘ └────┘ └────┘
         ↓  ↓  ↓
    ┌──────────────────┐
    │   MongoDB        │
    └──────────────────┘
```

2. **Database Replication**
- Set up MongoDB Replica Sets
- Ensures high availability
- Allows for failover

### Performance Optimization

- Enable gzip compression
- Cache static assets (1 year)
- Use CDN for frontend
- Optimize database queries
- Implement pagination

## Disaster Recovery

### Backup Procedures

```bash
# Daily backup at 2 AM
0 2 * * * mongodump --uri="..." --out=/backups/$(date +%Y%m%d)

# Retain backups for 30 days
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

### Restore Procedures

```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." /backups/20230101
```

### Monitoring Backup Success

```python
@scheduler.scheduled_job('cron', hour=2, minute=30)
def verify_backup():
    # Check if yesterday's backup exists
    # Send alert if missing
    pass
```

## Maintenance

### Regular Tasks
- [ ] Check error logs daily
- [ ] Monitor database size
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Security patches as released

### Update Procedures

```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt
git pull origin main
systemctl restart ecovehicle

# Frontend
cd frontend
npm update
npm run build
# Redeploy to hosting
```

## Rollback Procedures

```bash
# Backend
git revert <commit-hash>
systemctl restart ecovehicle

# Frontend
# Revert to previous Vercel/Netlify deployment
```

---

**Remember: Monitor, backup, and test your deployment regularly!**
