# 🔧 Guide de Configuration - Stylo

## 📋 Configuration requise

### 1. **Permissions macOS**
Stylo a besoin des permissions d'accessibilité pour fonctionner :

1. Ouvrir **Préférences Système** (⚙️)
2. Aller dans **Confidentialité et sécurité**
3. Cliquer sur **Accessibilité**
4. Ajouter **Terminal** et **Electron** à la liste
5. Redémarrer Stylo

### 2. **Configuration Supabase**

#### Étape 1 : Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé anonyme

#### Étape 2 : Configurer les URLs
Modifier le fichier `config.js` :

```javascript
const SUPABASE_CONFIG = {
  // Remplacez par votre vraie URL Supabase
  url: 'https://votre-projet.supabase.co',
  anonKey: 'votre-clef-anonyme-ici',
  
  // Les URLs des fonctions sont déjà configurées
  functions: {
    enhancePrompt: '/functions/v1/enhance-prompt',
    rephraseText: '/functions/v1/rephrase-text',
    translateText: '/functions/v1/translate-text',
    voiceProcessing: '/functions/v1/voice-processing'
  }
};
```

#### Étape 3 : Déployer les fonctions Edge
```bash
# Dans le dossier supabase-functions
npm install
npx supabase functions deploy enhance-prompt
npx supabase functions deploy rephrase-text
npx supabase functions deploy translate-text
npx supabase functions deploy voice-processing
```

### 3. **Configuration OpenAI**

#### Étape 1 : Obtenir une clé API OpenAI
1. Aller sur [platform.openai.com](https://platform.openai.com)
2. Créer un compte ou se connecter
3. Aller dans **API Keys**
4. Créer une nouvelle clé API

#### Étape 2 : Configurer la clé dans Supabase
1. Aller dans votre projet Supabase
2. Aller dans **Settings** > **Edge Functions**
3. Ajouter la variable d'environnement :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `votre-clef-openai-ici`

## 🚀 Utilisation

### Fonctionnement du bouton ⭐ (Prompt Enhancement)

1. **Placez votre curseur** dans n'importe quel champ de texte (Notes, Messages, Slack, Gmail, etc.)
2. **Cliquez sur le bouton ⭐** dans la fenêtre flottante Stylo
3. Le texte sera automatiquement :
   - Sélectionné et copié
   - Envoyé à OpenAI pour amélioration
   - Remplacé dans le même champ

### Caractéristiques

- ✅ **Toujours visible** : La fenêtre flottante reste au-dessus de toutes les applications
- ✅ **Non-intrusive** : Ne vole jamais le focus de votre application
- ✅ **Click-through** : Capture les clics sans activer la fenêtre
- ✅ **Restoration du clipboard** : Restaure automatiquement votre presse-papiers
- ✅ **Gestion d'erreurs** : Messages d'erreur clairs et timeouts
- ✅ **Indicateur de chargement** : Spinner pendant le traitement

## 🔧 Dépannage

### Problème : "Permissions d'accessibilité requises"
**Solution** : Suivre les étapes 1-5 de la section "Permissions macOS"

### Problème : "Timeout: La requête a pris trop de temps"
**Solutions** :
- Vérifier votre connexion internet
- Vérifier que les fonctions Supabase sont déployées
- Vérifier que la clé OpenAI est correctement configurée

### Problème : "Place ton curseur dans une zone de texte"
**Solution** : S'assurer que le curseur est dans un champ de texte (input, textarea) avant de cliquer sur ⭐

### Problème : Le texte n'est pas remplacé
**Solutions** :
- Vérifier les permissions d'accessibilité
- Redémarrer l'application
- Vérifier que le champ de texte est bien focus

## 📱 Applications testées

- ✅ **Notes** (macOS)
- ✅ **Messages** (macOS)
- ✅ **Slack** (Desktop)
- ✅ **Gmail** (Chrome/Safari)
- ✅ **TextEdit** (macOS)
- ✅ **Discord** (Desktop)
- ✅ **WhatsApp** (Web)

## 🎯 Prochaines fonctionnalités

- 🔄 **Reformulation** : Reformuler le texte existant
- 🌍 **Traduction** : Traduire dans différentes langues
- 🎤 **Traitement vocal** : Conversion voix vers texte

---

**Besoin d'aide ?** Consultez les logs dans la console de développement (F12) pour plus de détails.
