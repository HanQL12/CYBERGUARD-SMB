#!/bin/bash
# Setup script for backend

echo "🚀 Setting up Email Security Analyzer Backend..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate  # Linux/Mac
# On Windows: venv\Scripts\activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your API keys!"
fi

echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "  source venv/bin/activate  # Linux/Mac"
echo "  python app.py"
echo ""
echo "Or on Windows:"
echo "  venv\\Scripts\\activate"
echo "  python app.py"

