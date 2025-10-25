# 🚀 Démarrage Rapide - Stylo (Sans Onboarding)

## ⚡ Installation et Configuration

### 1. **Installer les dépendances**
```bash
npm install
```

### 2. **Configurer Supabase**
Modifier le fichier `config.js` :

```javascript
const SUPABASE_CONFIG = {
  // Remplacez par votre vraie URL Supabase
  url: 'https://votre-projet.supabase.co',
  anonKey: 'votre-clef-anonyme-ici',
  // ... reste de la config
};
```

### 3. **Déployer les fonctions Edge**
```bash
cd supabase-functions
npm install
npx supabase functions deploy enhance-prompt
```

### 4. **Configurer OpenAI dans Supabase**
- Aller dans **Settings** > **Edge Functions**
- Ajouter la variable : `OPENAI_API_KEY = votre-clef-openai`

### 5. **Accorder les permissions macOS**
**IMPORTANT** : Accorder manuellement les permissions :

1. **Ouvrir** Préférences Système (⚙️)
2. **Aller** dans Confidentialité et sécurité
3. **Cliquer** sur Accessibilité
4. **Ajouter** Terminal et Electron
5. **Redémarrer** Stylo

### 6. **Lancer l'application**
```bash
npm start
```

## ✅ **L'application se lance directement !**

- ✅ **Pas d'onboarding** - L'application démarre immédiatement
- ✅ **Fenêtre flottante** - Visible en haut de l'écran
- ✅ **Prêt à utiliser** - Cliquer sur ⭐ dans n'importe quelle app

## 🧪 **Tester l'installation**

### Test rapide
1. **Ouvrir** Notes ou Messages
2. **Taper** du texte dans un champ
3. **Cliquer** sur le bouton ⭐ dans Stylo
4. **Vérifier** que le texte est amélioré et remplacé

### Test du bridge natif
```bash
node test-ax-bridge.js
```

## 🔧 **Dépannage**

### Problème : "Accessibility permission denied"
**Solution** : Accorder les permissions d'accessibilité manuellement

### Problème : "No focused element found"
**Solution** : Cliquer dans un champ de texte avant de cliquer sur ⭐

### Problème : "Timeout: La requête a pris trop de temps"
**Solution** : Vérifier la configuration Supabase dans `config.js`

## 🎯 **Utilisation**

1. **Placer** le curseur dans un champ de texte (Notes, Messages, Slack, Gmail, etc.)
2. **Cliquer** sur le bouton ⭐ dans la fenêtre flottante Stylo
3. **Le texte** est automatiquement amélioré et remplacé
4. **Le focus** reste dans l'application cible

---

**🎉 Stylo est prêt ! Plus d'onboarding, juste cliquer et utiliser !** ✨
