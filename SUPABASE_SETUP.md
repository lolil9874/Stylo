# Configuration Supabase pour Stylo

## 1. Installation de Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Ou avec Homebrew sur macOS
brew install supabase/tap/supabase
```

## 2. Configuration du projet

```bash
# Initialiser Supabase dans le projet
supabase init

# Se connecter à votre projet Supabase
supabase login

# Lier le projet local à votre projet Supabase
supabase link --project-ref YOUR_PROJECT_REF
```

## 3. Configuration des variables d'environnement

Créer un fichier `.env.local` dans le dossier `supabase-functions/enhance-prompt/` :

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 4. Déploiement de la fonction Edge

```bash
# Déployer la fonction enhance-prompt
supabase functions deploy enhance-prompt

# Ou pour tester localement
supabase functions serve enhance-prompt
```

## 5. Configuration dans l'application

Mettre à jour le fichier `script.js` avec vos vraies valeurs :

```javascript
// Remplacer ces valeurs dans script.js
const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co';
const functionName = 'enhance-prompt';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530';
```

## 6. Test de la fonction

```bash
# Tester la fonction localement
curl -X POST 'http://localhost:54325/functions/v1/enhance-prompt' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Write a story about a cat"}'
```

## 7. Permissions CORS

La fonction est configurée pour accepter les requêtes CORS depuis n'importe quelle origine. Pour la production, vous devriez restreindre cela.

## 8. Gestion des erreurs

La fonction gère les erreurs suivantes :
- Texte manquant ou invalide
- Clé API OpenAI manquante
- Erreurs de l'API OpenAI
- Erreurs de réseau

## 9. Limites et considérations

- **Tokens OpenAI** : La fonction utilise un maximum de 1000 tokens pour la réponse
- **Modèle** : Utilise GPT-4o-mini pour des coûts optimisés
- **Temperature** : 0.7 pour un bon équilibre créativité/cohérence
- **Timeout** : Les requêtes peuvent prendre jusqu'à 30 secondes

## 10. Monitoring

Vous pouvez surveiller les appels de fonction dans le dashboard Supabase :
- Edge Functions > enhance-prompt
- Logs en temps réel
- Métriques d'utilisation
