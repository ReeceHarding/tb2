#!/bin/bash

echo "🧪 Testing Marketing Images Database Setup"
echo "========================================="

echo ""
echo "1️⃣ Testing API endpoint..."
API_RESPONSE=$(curl -s http://localhost:3000/api/marketing-images)
echo "Response: $API_RESPONSE"

if [[ $API_RESPONSE == *"\"images\":[]"* ]]; then
    echo "✅ API working! Database tables exist!"
    echo ""
    echo "2️⃣ Testing gallery page..."
    echo "🎯 Go to: http://localhost:3000/test-gallery"
    echo ""
    echo "🚀 READY FOR IMAGE UPLOAD!"
    echo "Run: npm run setup-marketing-images"
else 
    echo "❌ Database not ready yet"
    echo "👉 Make sure you ran the SQL in Supabase"
fi