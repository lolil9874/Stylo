# 🚀 Démarrage Rapide - Stylo

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

### 5. **Lancer l'application**
```bash
npm start
```

## 🧪 Tester l'installation
```bash
node test-stylo.js
```

## ✅ Vérification rapide

1. **Permissions macOS** : Aller dans Préférences Système > Confidentialité > Accessibilité
2. **Fenêtre flottante** : Doit apparaître en haut de l'écran
3. **Test basique** : Ouvrir Notes, taper du texte, cliquer sur ⭐

## 🔧 Dépannage

### Problème : "URLs Supabase non configurées"
**Solution** : Modifier `config.js` avec vos vraies URLs

### Problème : "Dépendances manquantes"
**Solution** : Exécuter `npm install`

### Problème : "Permissions d'accessibilité requises"
**Solution** : Ajouter Terminal et Electron dans les permissions

---

**🎯 Objectif** : Cliquer sur ⭐ dans n'importe quelle app et voir le texte s'améliorer automatiquement !