# 🚗 EcoVehicle - Vehicle CO2 Emission Prediction System

A comprehensive full-stack web application that predicts vehicle CO2 emissions using machine learning and provides users with detailed analytics and reports.

## Project Structure

```
Final-Project/
├── backend/              # FastAPI backend server
│   ├── main.py          # Main FastAPI application
│   ├── requirements.txt  # Python dependencies
│   ├── .env             # Environment variables
│   └── README.md        # Backend documentation
│
└── frontend/            # React frontend application
    ├── src/
    │   ├── components/  # React components
    │   ├── App.jsx      # Main application component
    │   ├── App.css      # Application styles
    │   ├── index.css    # Global styles
    │   └── main.jsx     # Entry point
    ├── package.json     # NPM dependencies
    ├── vite.config.js   # Vite configuration
    ├── index.html       # HTML entry point
    └── README.md        # Frontend documentation
```

## Quick Start

### MongoDB Setup

Before running the backend, ensure MongoDB is running:

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# https://docs.mongodb.com/manual/installation/
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

**Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Features

### Backend (FastAPI)
- RESTful API with CORS enabled
- Animation data endpoints
- Counter processing with calculations
- Particle generation for animations
- Health check endpoint
- Auto-generated API documentation

### Frontend (React)
- Interactive animated buttons with ripple effects
- Canvas-based particle animation system
- Counter component with real-time API integration
- Dynamic animation effects (fade, slide, bounce, rotate, scale)
- Responsive design for all devices
- Real-time API status indicator

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/api/animation` | Get random animation data (saved to MongoDB) |
| POST | `/api/counter` | Process counter calculations (saved to MongoDB) |
| GET | `/api/particles` | Get particle data (saved to MongoDB) |
| GET | `/api/counter/history` | Get last 10 counter records |
| GET | `/api/animation/history` | Get last 10 animation records |
| GET | `/health` | Health check with MongoDB status |
| GET | `/docs` | Swagger UI documentation |
| GET | `/redoc` | ReDoc documentation |

## Technologies Used

### Backend
- Python 3.x
- FastAPI - Modern web framework
- Uvicorn - ASGI server
- Motor - Async MongoDB driver
- PyMongo - MongoDB client
- CORS - Cross-Origin Resource Sharing

### Frontend
- React 18 - UI library
- Vite - Build tool
- CSS3 - Styling with animations
- Canvas API - Particle effects
- Axios - HTTP client (optional)

## Development Commands

### Backend
```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on specific port
uvicorn main:app --port 8000
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization

### Adding More Animations

1. Create new CSS animations in `frontend/src/components/*.css`
2. Add animation variants in the component files
3. Update backend endpoints to return new animation types

### Adding More API Endpoints

1. Define new route functions in `backend/main.py`
2. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. Return JSON data
4. Endpoints are automatically added to Swagger docs

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Notes

- The frontend expects the backend to run on `http://localhost:8000`
- CORS is enabled on the backend for local development
- For production, configure CORS properly
- The particle animation runs at ~60 FPS using requestAnimationFrame

## Troubleshooting

**Port already in use:**
```bash
# Backend (change port in main.py or use)
uvicorn main:app --port 8001

# Frontend (Vite uses port 5173 by default)
npm run dev -- --port 5174
```

**CORS issues:**
Make sure the backend is running and CORS is enabled in `main.py`

**Animations not smooth:**
Check browser hardware acceleration is enabled and use a modern browser

## License

MIT - Feel free to use for any purpose

## Author

Created with ❤️ using FastAPI and React
