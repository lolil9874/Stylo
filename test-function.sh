#!/bin/bash

# ===========================================
# Stylo - Test de la fonction enhance-prompt
# ===========================================

echo "🧪 Test de la fonction Prompt Enhancer..."
echo ""

# Configuration
SUPABASE_URL="https://vkyfdunlbpzwxryqoype.supabase.co"
FUNCTION_NAME="enhance-prompt"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530"

# Texte à tester
TEST_TEXT="Write a story about a cat"

echo "📝 Texte original : \"$TEST_TEXT\""
echo ""
echo "🚀 Envoi à la fonction Supabase..."
echo ""

# Appel à la fonction
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/$FUNCTION_NAME" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEST_TEXT\"}")

# Vérifier si la réponse contient une erreur
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ ERREUR détectée !"
    echo ""
    echo "Réponse complète :"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "💡 Vérifications à faire :"
    echo "   1. Avez-vous ajouté OPENAI_API_KEY dans les secrets Supabase ?"
    echo "   2. Votre clé OpenAI est-elle valide ?"
    echo "   3. La fonction est-elle bien déployée ?"
    echo ""
    echo "Pour voir les logs :"
    echo "   supabase functions logs enhance-prompt"
    exit 1
fi

# Afficher la réponse
if echo "$RESPONSE" | grep -q '"enhanced_text"'; then
    echo "✅ SUCCÈS ! La fonction fonctionne correctement !"
    echo ""
    echo "📊 Réponse complète :"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "✨ Texte amélioré :"
    echo "$RESPONSE" | jq -r '.enhanced_text' 2>/dev/null || echo "Impossible d'extraire le texte amélioré"
    echo ""
    echo "🎉 Votre fonction Prompt Enhancer est opérationnelle !"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   1. Lancez Stylo : npm start"
    echo "   2. Ouvrez la page de test : open test-page.html"
    echo "   3. Testez avec le bouton ⭐ dans l'interface"
else
    echo "⚠️  Réponse inattendue"
    echo ""
    echo "Réponse complète :"
    echo "$RESPONSE"
fi
