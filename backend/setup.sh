#!/bin/bash
# EcoVehicle - Backend Setup Script (Linux/Mac)

set -e

echo "🚗 EcoVehicle - Backend Setup"
echo "=============================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✅ pip found"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Make sure MongoDB is running (docker run -d -p 27017:27017 --name ecovehicle-db mongo:latest)"
echo "  2. Configure .env file with your settings"
echo "  3. Run: python main.py"
echo ""
echo "🌐 Backend will run at: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
