# 🚀 Stylo - Guide de Déploiement

## Vue d'ensemble

Stylo est une interface flottante macOS avec des capacités d'IA pour l'amélioration de texte. Ce guide vous explique comment déployer toutes les fonctionnalités.

## 📋 Prérequis

1. **Node.js** (v16 ou plus récent)
2. **Supabase CLI** installé
3. **Compte OpenAI** avec clé API
4. **Projet Supabase** configuré

## 🔧 Configuration Initiale

### 1. Cloner et installer les dépendances

```bash
cd /Users/mrh/Desktop/PROJETX
npm install
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos vraies clés
nano .env
```

**Variables importantes à configurer :**
- `OPENAI_API_KEY` - Votre clé API OpenAI
- `SUPABASE_SERVICE_ROLE_KEY` - Votre clé service role Supabase (optionnel)

### 3. Configurer Supabase

```bash
# Se connecter à Supabase
supabase login

# Lier le projet (remplacer YOUR_PROJECT_REF)
supabase link --project-ref vkyfdunlbpzwxryqoype
```

## 🚀 Déploiement des Fonctions

### Option 1: Déploiement automatique

```bash
# Exécuter le script de déploiement
./deploy-functions.sh
```

### Option 2: Déploiement manuel

```bash
# Déployer toutes les fonctions une par une
supabase functions deploy enhance-prompt
supabase functions deploy rephrase-text
supabase functions deploy translate-text
supabase functions deploy voice-processing
```

## 🧪 Test de l'Application

### 1. Lancer Stylo

```bash
npm start
```

### 2. Tester avec la page de test

```bash
# Ouvrir la page de test dans le navigateur
open test-page.html
```

### 3. Tester les fonctionnalités

1. **Prompt Enhancer** (⭐) : Améliore les prompts avec GPT-4o-mini
2. **Rephrase Text** (✏️) : Reformule le texte dans différents styles
3. **Translate Text** (🌐) : Traduit entre différentes langues
4. **Voice Processing** (🎤) : Traite l'entrée vocale

## 📁 Structure des Fonctions

```
supabase-functions/
├── enhance-prompt/          # Amélioration de prompts
│   └── index.ts
├── rephrase-text/           # Reformulation de texte
│   └── index.ts
├── translate-text/          # Traduction de texte
│   └── index.ts
├── voice-processing/        # Traitement vocal
│   └── index.ts
├── functions-config.json    # Configuration des fonctions
└── package.json
```

## 🔍 Vérification du Déploiement

### Vérifier les fonctions déployées

```bash
# Lister les fonctions déployées
supabase functions list

# Tester une fonction
curl -X POST 'https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-prompt' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Write a story about a cat"}'
```

### Vérifier les logs

```bash
# Voir les logs des fonctions
supabase functions logs enhance-prompt
supabase functions logs rephrase-text
supabase functions logs translate-text
supabase functions logs voice-processing
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de clé API OpenAI**
   - Vérifier que `OPENAI_API_KEY` est correctement configurée
   - Vérifier que la clé a les permissions nécessaires

2. **Erreur de connexion Supabase**
   - Vérifier que le projet est correctement lié
   - Vérifier que les clés sont correctes

3. **Fonctions non déployées**
   - Vérifier que Supabase CLI est à jour
   - Vérifier les logs de déploiement

### Logs utiles

```bash
# Logs de l'application
npm start

# Logs Supabase
supabase functions logs --follow

# Logs système
tail -f /var/log/system.log
```

## 📊 Monitoring

### Dashboard Supabase
- Accéder au dashboard : https://supabase.com/dashboard
- Voir les métriques des fonctions
- Surveiller l'utilisation des API

### Métriques importantes
- Nombre d'appels par fonction
- Temps de réponse moyen
- Taux d'erreur
- Utilisation des tokens OpenAI

## 🔄 Mise à jour

### Mettre à jour les fonctions

```bash
# Redéployer toutes les fonctions
./deploy-functions.sh

# Ou mettre à jour une fonction spécifique
supabase functions deploy enhance-prompt
```

### Mettre à jour l'application

```bash
# Mettre à jour les dépendances
npm update

# Redémarrer l'application
npm start
```

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Consulter la documentation Supabase
3. Vérifier la configuration OpenAI
4. Tester avec la page de test

---

**Stylo** - Interface flottante macOS avec IA pour l'amélioration de texte ✨
