# FastAPI Backend

Interactive API backend with MongoDB integration and animation/particle endpoints.

## Prerequisites

- Python 3.8+
- MongoDB running locally or remote instance

## Installation

```bash
pip install -r requirements.txt
```

## MongoDB Setup

### Local MongoDB (recommended for development)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# https://docs.mongodb.com/manual/installation/
```

### Environment Configuration

Update `.env` with your MongoDB connection string:

```
MONGODB_URL=mongodb://localhost:27017
```

For MongoDB Atlas:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Running the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/animation` - Get random animation data (saved to MongoDB)
- `POST /api/counter` - Process counter calculations (saved to MongoDB)
- `GET /api/particles` - Get particle data for animations (saved to MongoDB)
- `GET /api/counter/history` - Get last 10 counter records from MongoDB
- `GET /api/animation/history` - Get last 10 animation records from MongoDB
- `GET /health` - Health check with MongoDB status

## Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Data Models

All data is stored as flexible documents in MongoDB collections:

- **animations** - Animation history
- **counters** - Counter processing history
- **particles** - Particle animation data

No schema validation is enforced, allowing flexible data storage.

