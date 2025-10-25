# 🔑 Configuration de la Clé API OpenAI sur Supabase

## Étape 1 : Obtenir votre clé API OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous à votre compte OpenAI
3. Cliquez sur "Create new secret key"
4. Copiez la clé (elle commence par `sk-...`)

## Étape 2 : Ajouter la clé dans Supabase

### Via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard/project/vkyfdunlbpzwxryqoype
2. Dans le menu de gauche, cliquez sur **"Edge Functions"**
3. Cliquez sur votre fonction **"enhance-prompt"**
4. Cliquez sur l'onglet **"Settings"** ou **"Secrets"**
5. Ajoutez une nouvelle variable d'environnement :
   - **Nom** : `OPENAI_API_KEY`
   - **Valeur** : Votre clé API OpenAI (commence par `sk-...`)
6. Cliquez sur **"Save"** ou **"Add secret"**

### Alternative : Via CLI

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref vkyfdunlbpzwxryqoype

# Ajouter le secret
supabase secrets set OPENAI_API_KEY=sk-votre-clé-ici
```

## Étape 3 : Vérifier la configuration

### Test via curl

```bash
curl -X POST 'https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-prompt' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Write a story about a cat"}'
```

### Réponse attendue

```json
{
  "enhanced_text": "Write a compelling short story (500-800 words) about a domestic cat who discovers an unexpected adventure in their everyday life. Include vivid descriptions of the cat's personality, their environment, and the emotions they experience throughout their journey. Focus on creating a narrative that captures both the feline perspective and engages the reader with relatable themes.",
  "original_text": "Write a story about a cat",
  "model_used": "gpt-4o-mini"
}
```

## Étape 4 : Tester avec Stylo

1. Lancez l'application Stylo : `npm start`
2. Ouvrez la page de test : `open test-page.html`
3. Tapez du texte dans un champ
4. Cliquez sur le bouton ⭐ (Prompt Enhancer)
5. Le texte devrait être remplacé par la version améliorée !

## 🐛 Dépannage

### Erreur "OpenAI API key not found"
- Vérifiez que vous avez bien ajouté `OPENAI_API_KEY` dans les secrets Supabase
- Redéployez la fonction après avoir ajouté le secret

### Erreur "OpenAI API error: 401"
- Votre clé API est invalide ou expirée
- Générez une nouvelle clé sur https://platform.openai.com/api-keys

### Erreur "OpenAI API error: 429"
- Vous avez dépassé votre quota OpenAI
- Vérifiez votre utilisation sur https://platform.openai.com/usage

### Erreur CORS
- Vérifiez que la fonction gère bien les requêtes OPTIONS
- La fonction actuelle gère déjà CORS correctement

## 📊 Monitoring

### Voir les logs de la fonction

```bash
supabase functions logs enhance-prompt --follow
```

### Dashboard OpenAI
- Surveillez votre utilisation : https://platform.openai.com/usage
- Coût estimé par requête : ~$0.0001-0.0005 (GPT-4o-mini)

## 🎯 Prochaines Étapes

Une fois que cette fonction fonctionne, vous pourrez créer les autres fonctions :
- ✏️ **rephrase-text** - Reformulation de texte
- 🌐 **translate-text** - Traduction
- 🎤 **voice-processing** - Traitement vocal

Toutes utiliseront la même clé API OpenAI !

---

**Stylo** - Votre assistant IA pour l'amélioration de texte ✨
