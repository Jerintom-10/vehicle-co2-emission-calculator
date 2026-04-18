# 🏗️ EcoVehicle Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages: Home, Login, Dashboard, History, Reports    │  │
│  │  Components: Navigation, Forms, Charts, Animations  │  │
│  │  State: Auth Context, Local Storage                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: /auth, /predictions, /reports              │  │
│  │  Services: Auth, User, ML, Predictions, PDF         │  │
│  │  Middleware: JWT Auth, CORS, Error Handling         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ Motor Driver
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections: users, predictions, reports           │  │
│  │  Indexes: email (unique), user_id, created_at       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│      Routes Layer (FastAPI)         │  HTTP Endpoints
│  /auth, /predictions, /reports      │
└────────────────────┬────────────────┘
                     │
┌────────────────────▼────────────────┐
│    Services Layer (Business Logic)  │  Handles operations
│  UserService, PredictionService...  │
└────────────────────┬────────────────┘
                     │
┌────────────────────▼────────────────┐
│   Data Layer (Database Access)      │  MongoDB operations
│      Via Motor (Async Driver)       │
└─────────────────────────────────────┘
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Route Handlers                           │
│  (Handle HTTP requests, validation, routing)               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┐
        │                         │              │
        ▼                         ▼              ▼
┌──────────────────┐    ┌──────────────┐   ┌──────────────┐
│  UserService     │    │MLModelService│   │PredictionSvc │
│                  │    │              │   │              │
│- register        │    │- predict     │   │- create      │
│- login           │    │- get_rating  │   │- get_history │
│- get_user        │    │- get_features│   │- statistics  │
│- update_profile  │    │              │   │- delete      │
└──────┬───────────┘    └──────────────┘   └──────┬───────┘
       │                                          │
       └──────────────────┬───────────────────────┘
                          │
            ┌─────────────▼──────────┐
            │   Database Service     │
            │   (MongoDB Connection) │
            │                        │
            │  - users collection    │
            │  - predictions coll.   │
            │  - reports collection  │
            └────────────────────────┘
```

### Data Flow

#### Registration Flow
```
User Input → Validation → Password Hash → DB Insert → JWT Token → Response
```

#### Prediction Flow
```
Form Data → Validation → ML Model → DB Insert → Rating Calc → Response
```

#### Report Generation Flow
```
Prediction ID → Fetch Data → Format → PDF Generation → File Response
```

## Frontend Architecture

### Component Hierarchy

```
┌─────────────────────────────────────┐
│           App.jsx                   │  Main app
│  (AuthProvider, Router)             │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌────────────────┐  ┌──────────────────┐
│  Navigation    │  │  Routes/Pages    │
│  (Layout)      │  │                  │
└────────────────┘  ├─ HomePage        │
                    ├─ LoginPage       │
                    ├─ RegisterPage    │
                    ├─ DashboardPage   │
                    ├─ HistoryPage     │
                    └─ ReportsPage     │
```

### State Management

```
┌──────────────────────────────────┐
│     AuthContext                  │  Global Auth State
│                                  │
│ - user (object)                  │
│ - token (string)                 │
│ - isAuthenticated (boolean)      │
│ - loading (boolean)              │
│ - error (string)                 │
│                                  │
│ Methods:                         │
│ - register(email, pwd, name)    │
│ - login(email, pwd)             │
│ - logout()                       │
└──────────────────────────────────┘
```

### API Service Pattern

```
const apiService = {
  // Interceptors
  request: token injection
  response: error handling
  
  // API Methods
  predictionAPI: {
    predict(data) -> POST /predictions/predict
    getHistory() -> GET /predictions/history
    getStatistics() -> GET /predictions/statistics
    getPrediction(id) -> GET /predictions/{id}
    deletePrediction(id) -> DELETE /predictions/{id}
  }
  
  reportAPI: {
    downloadPredictionReport(id) -> GET /reports/prediction/{id}
    downloadHistoryReport() -> GET /reports/history
  }
}
```

## Authentication Flow

### Token-Based Authentication (JWT)

```
┌─────────────────┐
│   User          │
│                 │
│ email: ...      │  ┌──────────────────────┐
│ password: ...   ├─>│   Backend            │
│                 │  │                      │
└─────────────────┘  │ 1. Hash password     │
                     │ 2. Store user        │
                     │ 3. Create JWT        │
                     │ 4. Return token      │
                     │                      │
                     └──────────────────────┘
                              │
                              │ token
                              ▼
                     ┌──────────────────────┐
                     │  Client (Browser)    │
                     │                      │
                     │ localStorage:        │
                     │ - token              │
                     │ - user object        │
                     │                      │
                     └──────────────────────┘
                              │
                              │ On each request:
                              │ 1. Get token from localStorage
                              │ 2. Add to request header/query
                              │ 3. Backend verifies
                              │ 4. Access granted/denied
                              │
                              ▼
                     ┌──────────────────────┐
                     │   Protected Route    │
                     └──────────────────────┘
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  full_name: String,
  is_admin: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Predictions Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  vehicle: {
    make: String,
    model: String,
    engine_size: Float,
    cylinders: Integer,
    fuel_consumption_city: Float,
    fuel_consumption_highway: Float,
    fuel_consumption_combined: Float,
    fuel_type: String,
    vehicle_class: String,
    transmission: String
  },
  predicted_co2: Float,
  rating: String (Very Low, Low, Moderate, High, Very High),
  confidence: Float,
  created_at: DateTime
}
```

### Reports Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  prediction_id: ObjectId (ref: predictions),
  report_type: String (prediction, history),
  generated_at: DateTime,
  file_path: String,
  file_size: Integer
}
```

## ML Model Integration

### Model Loading

```python
def load_model():
    try:
        model = joblib.load('ml_model/best_model.pkl')
    except:
        model = None  # Use mock predictions
    return model

def predict(model, vehicle_data):
    if model is None:
        return mock_prediction()  # Fallback
    else:
        return model.predict(vehicle_data)
```

### Rating System

```python
def get_rating(co2_value):
    if co2_value <= 100:
        return "Very Low"
    elif co2_value <= 130:
        return "Low"
    elif co2_value <= 160:
        return "Moderate"
    elif co2_value <= 200:
        return "High"
    else:
        return "Very High"
```

## Error Handling Strategy

### Backend
```
Request → Route Handler
    ↓
Validation → ValueError → 422 Unprocessable Entity
    ↓
Authentication → Unauthorized → 401 Unauthorized
    ↓
Authorization → Forbidden → 403 Forbidden
    ↓
Business Logic → ValueError → 400 Bad Request
    ↓
Database → Error → 500 Internal Server Error
    ↓
Response → JSON with error message
```

### Frontend
```
API Request
    ↓
Interceptor checks response
    ↓
401 → Redirect to login, clear storage
    ↓
4xx → Show error alert
    ↓
5xx → Show generic error message
    ↓
User sees friendly error
```

## Security Measures

### Backend
1. **Password Hashing**: Bcrypt with salt
2. **JWT Tokens**: HS256 algorithm
3. **CORS**: Restricted to frontend origin
4. **Input Validation**: Server-side validation all requests
5. **Database Indexes**: Prevent duplicate emails
6. **Error Handling**: No sensitive info in error messages

### Frontend
1. **XSS Protection**: React auto-escapes content
2. **CSRF**: Protected by JWT implementation
3. **Secure Storage**: localStorage for tokens (httpOnly alternative recommended)
4. **Input Validation**: Client-side validation with server-side backup
5. **SSL/TLS**: Use HTTPS in production

## Performance Considerations

### Backend
- **Async/Await**: Motor for non-blocking database operations
- **Indexing**: MongoDB indexes on frequently queried fields
- **Caching**: Could implement Redis for predictions
- **Pagination**: History pagination in future

### Frontend
- **Code Splitting**: React Router lazy loading
- **Image Optimization**: SVG animations instead of images
- **CSS-in-JS**: Custom theme system with minimal overhead
- **Memoization**: React.memo for components if needed

## Scalability Path

1. **Horizontal Scaling Backend**
   - Load balancer (nginx, HAProxy)
   - Multiple FastAPI instances
   - Shared MongoDB

2. **Horizontal Scaling Frontend**
   - CDN for static assets
   - Separate API gateway

3. **Caching Layer**
   - Redis for session storage
   - Redis for prediction cache

4. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)

## Development Workflow

```
Code → Local Testing → Backend Tests → Frontend Tests → Build → Deploy
```

---

**Architecture designed for scalability, maintainability, and security**
