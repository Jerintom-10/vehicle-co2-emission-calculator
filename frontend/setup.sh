#!/bin/bash
# EcoVehicle - Frontend Setup Script (Linux/Mac)

set -e

echo "🚗 EcoVehicle - Frontend Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

echo ""
echo "📥 Installing dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Make sure backend is running (python main.py in backend directory)"
echo "  2. Run: npm run dev"
echo ""
echo "🌐 Frontend will run at: http://localhost:5173"
