#!/bin/bash

# ===========================================
# Stylo - Deploy Supabase Functions
# ===========================================

echo "🚀 Deploying Stylo Supabase Functions..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Vérifier si on est connecté à Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not connected to Supabase. Please run:"
    echo "   supabase login"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📦 Deploying all functions..."

# Déployer toutes les fonctions
echo "  ⭐ Deploying enhance-prompt function..."
supabase functions deploy enhance-prompt

echo "  ✏️ Deploying rephrase-text function..."
supabase functions deploy rephrase-text

echo "  🌐 Deploying translate-text function..."
supabase functions deploy translate-text

echo "  🎤 Deploying voice-processing function..."
supabase functions deploy voice-processing

echo ""
echo "✅ All Stylo functions deployed successfully!"
echo ""
echo "🔗 Your functions are available at:"
echo "   https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/"
echo ""
echo "📋 Available functions:"
echo "   • enhance-prompt    - AI prompt enhancement"
echo "   • rephrase-text     - Text rephrasing in different styles"
echo "   • translate-text    - Text translation between languages"
echo "   • voice-processing  - Voice transcription and analysis"
echo ""
echo "🧪 Test your functions with the test page:"
echo "   open test-page.html"
