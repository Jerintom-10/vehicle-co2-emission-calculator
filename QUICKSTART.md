# 🚀 Quick Start Guide - EcoVehicle

Get EcoVehicle running in 5 minutes!

## ⚙️ Prerequisites

Before you start, make sure you have:
- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB 4.4+** - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## 🗄️ Step 1: Setup MongoDB

### Option A: Using Docker (Recommended)
```bash
docker run -d -p 27017:27017 --name ecovehicle-db mongo:latest
```

### Option B: Using Local Installation
- Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- Ensure MongoDB is running on port 27017

### Option C: Using MongoDB Atlas (Cloud)
1. Create account at [mongodb.com](https://www.mongodb.com/)
2. Create a cluster and get connection string
3. Update `.env` file with your connection string

## 🐍 Step 2: Setup Backend

### On Linux/Mac:
```bash
cd backend
bash setup.sh
```

### On Windows:
```bash
cd backend
setup.bat
```

### Manual Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Step 3: Configure Backend

Create/Edit `backend/.env` file:

```env
FASTAPI_ENV=development
API_HOST=0.0.0.0
API_PORT=8000
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ecovehicle_db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
JWT_SECRET=your-jwt-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

## 🚀 Step 4: Start Backend

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend is running at: **http://localhost:8000**

### Test Backend
Open in browser: http://localhost:8000/docs

## ⚛️ Step 5: Setup Frontend

### On Linux/Mac:
```bash
cd frontend
bash setup.sh
```

### On Windows:
```bash
cd frontend
setup.bat
```

### Manual Setup:
```bash
cd frontend
npm install
```

## 🎨 Step 6: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

✅ Frontend is running at: **http://localhost:5173**

## ✅ Verification

### Backend Status
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Status
- Open: http://localhost:5173/

### Check Connection
1. Go to homepage
2. Click "Get Started"
3. Try registering with test account
4. If you can create account → Success! ✅

## 🎯 First Steps

1. **Register Account**
   - Email: test@example.com
   - Password: Test123!@#
   - Name: Test User

2. **Make a Prediction**
   - Go to Dashboard
   - Fill in vehicle details (example: Toyota Camry, 2.5L engine, 4 cylinders)
   - Click "Predict Emissions"

3. **View Results**
   - See emission gauge animation
   - Check prediction rating
   - Download PDF report (button appears after prediction)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
# Linux/Mac:
mongosh

# Windows:
mongosh

# If connection fails, start MongoDB:
docker run -d -p 27017:27017 --name ecovehicle-db mongo:latest
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port already in use
```bash
# Backend on different port
cd backend
uvicorn main:app --port 8001

# Frontend on different port
cd frontend
npm run dev -- --port 5174
```

### CORS errors
- Ensure backend is running first
- Check `.env` FRONTEND_URL matches your frontend URL
- Restart backend after changing .env

## 📚 Learn More

- [Full Documentation](./README.md)
- [API Reference](#api-endpoints)
- [Architecture Overview](#project-structure)
- [Validation Rules](#validation-rules)

## 🆘 Need Help?

- Check [Troubleshooting Section](#troubleshooting)
- Review application logs
- Check MongoDB connection
- Ensure ports 8000 and 5173 are available

## 🎉 Success!

If you can see the EcoVehicle homepage, register an account, and make a prediction, you've successfully set up EcoVehicle!

Happy predicting! 🚗

---

**Made with ❤️ for environmental awareness**
