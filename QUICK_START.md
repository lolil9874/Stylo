# 🚀 Stylo - Démarrage Rapide

## ✅ Ce qui est déjà fait

1. ✅ **Fonction Supabase déployée** : `enhance-prompt` est active sur Supabase
2. ✅ **Code JavaScript configuré** : `script.js` utilise les bonnes URL et clés
3. ✅ **Interface prête** : L'application Stylo est configurée

## 🔑 ÉTAPE IMPORTANTE : Ajouter votre clé API OpenAI

### Option 1 : Via le Dashboard Supabase (Recommandé)

1. **Allez sur le dashboard Supabase** :
   ```
   https://supabase.com/dashboard/project/vkyfdunlbpzwxryqoype/settings/functions
   ```

2. **Cliquez sur "Secrets" ou "Environment Variables"**

3. **Ajoutez la variable** :
   - Nom : `OPENAI_API_KEY`
   - Valeur : Votre clé OpenAI (commence par `sk-...`)

4. **Sauvegardez**

### Option 2 : Via CLI

```bash
# Installer Supabase CLI si nécessaire
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref vkyfdunlbpzwxryqoype

# Ajouter le secret
supabase secrets set OPENAI_API_KEY=sk-votre-clé-ici
```

## 🧪 Tester l'application

### 1. Lancer Stylo

```bash
cd /Users/mrh/Desktop/PROJETX
npm start
```

### 2. Ouvrir la page de test

```bash
open test-page.html
```

### 3. Tester le Prompt Enhancer

1. Tapez du texte dans un champ (par exemple : "Write a story about a cat")
2. Cliquez sur le bouton ⭐ (4ème bouton) dans l'interface Stylo
3. Le texte sera remplacé par la version améliorée par GPT-4o-mini !

## 📋 Fonctionnalités disponibles

| Bouton | Fonction | Status |
|--------|----------|--------|
| ✏️ | Rephrase Text | 🔜 À créer |
| 🌐 | Translate Text | 🔜 À créer |
| ⭐ | **Prompt Enhancer** | ✅ **ACTIF** |
| 🎤 | Voice Processing | 🔜 À créer |

## 🧪 Test rapide via curl

```bash
curl -X POST 'https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-prompt' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Write a story about a cat"}'
```

**Réponse attendue** :
```json
{
  "enhanced_text": "Write a compelling short story (500-800 words) about a domestic cat...",
  "original_text": "Write a story about a cat",
  "model_used": "gpt-4o-mini"
}
```

## 🐛 Problèmes courants

### ❌ "OpenAI API key not found"
**Solution** : Ajoutez `OPENAI_API_KEY` dans les secrets Supabase (voir ci-dessus)

### ❌ "No text input detected"
**Solution** : 
- Assurez-vous d'avoir du texte dans un champ input/textarea
- Cliquez dans le champ avant de cliquer sur le bouton ⭐

### ❌ "API connection failed"
**Solution** :
- Vérifiez votre connexion internet
- Vérifiez que la fonction est déployée : `supabase functions list`

## 📊 Voir les logs

```bash
# Logs de la fonction enhance-prompt
supabase functions logs enhance-prompt --follow

# Logs de l'application Stylo
# Ouvrez les DevTools dans Electron (Cmd+Option+I)
```

## 🎯 Prochaines étapes

1. **Testez le Prompt Enhancer** avec différents textes
2. **Créez les autres fonctions** (rephrase, translate, voice)
3. **Personnalisez les prompts** dans `supabase-functions/enhance-prompt/index.ts`

## 📚 Documentation complète

- `SETUP_OPENAI_KEY.md` - Guide détaillé pour la clé OpenAI
- `DEPLOYMENT.md` - Guide de déploiement complet
- `SUPABASE_SETUP.md` - Configuration Supabase

---

**Stylo** - Votre assistant IA pour l'amélioration de texte ✨

**URL de la fonction** : `https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-prompt`
**Projet Supabase** : `vkyfdunlbpzwxryqoype`
**Status** : ✅ Fonction déployée - Ajoutez juste votre clé OpenAI !
