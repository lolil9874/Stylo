# 🔐 Guide des Permissions macOS

## ⚠️ Problème actuel

L'erreur `osascript n'est pas autorisé à envoyer de saisies (1002)` signifie que macOS bloque l'envoi automatique de touches.

## ✅ Solution : Donner les permissions d'accessibilité

### Étape 1 : Ouvrir les Préférences Système

1. **Menu Pomme 🍎** → **Préférences Système** (ou **Réglages Système**)
2. **Confidentialité et sécurité** → **Accessibilité**

### Étape 2 : Déverrouiller

Clique sur le **cadenas 🔒** et entre ton mot de passe.

### Étape 3 : Ajouter Terminal.app

1. Clique sur le **bouton +**
2. Navigue vers **Applications** → **Utilitaires** → **Terminal.app**
3. Clique **Ouvrir**
4. **Coche la case** ✅ à côté de Terminal.app

### Étape 4 : Ajouter Electron (optionnel)

Si Terminal seul ne suffit pas :

1. Clique encore sur **+**
2. Navigue vers `/Users/mrh/Desktop/Stylo/node_modules/electron/dist/Electron.app`
3. Ou cherche "Electron" dans Applications
4. Ajoute-le et **coche la case** ✅

### Étape 5 : Redémarrer Stylo

```bash
# Arrête l'app (Cmd+Q)
# Puis relance :
cd /Users/mrh/Desktop/Stylo
npm start
```

## 🧪 Test après permissions

1. **Sélectionne du texte** n'importe où (Chrome, Notes, etc.)
2. **Click sur ⭐**
3. **Attends** - tu devrais voir :
   - "Selecting & copying text..."
   - "Enhancing with AI..."
   - "Replacing text..."
   - "✨ Enhanced & replaced!"

## 🔧 Si ça ne marche toujours pas

### Vérifier les permissions

1. Va dans **Préférences Système** → **Confidentialité et sécurité** → **Accessibilité**
2. Vérifie que **Terminal.app** est bien coché ✅
3. Si tu utilises **iTerm** ou **VS Code**, ajoute-les aussi

### Tester les permissions

Ouvre **Terminal** et teste :

```bash
osascript -e 'tell application "System Events" to keystroke "c" using command down'
```

Si ça ne donne pas d'erreur, les permissions sont OK !

### Alternative : Mode manuel

Si les permissions ne marchent pas, on peut faire une version qui met juste le texte dans le clipboard et tu colles manuellement avec Cmd+V.

## 📱 Applications qui peuvent avoir besoin de permissions

- **Terminal.app** (obligatoire)
- **iTerm** (si tu l'utilises)
- **VS Code** (si tu lances depuis VS Code)
- **Cursor** (si tu lances depuis Cursor)
- **Electron** (optionnel)

## ✅ Vérification

Après avoir donné les permissions, tu devrais voir dans la console :

```
✅ Preload script loaded - electronAPI ready
🔍 Starting prompt enhancement via clipboard...
📄 Copied text: [ton texte]
🚀 Enhancing text via API...
✅ Enhanced text received!
📋 Selecting all & pasting enhanced text...
✅ Text replaced successfully!
```

**Pas d'erreur `osascript n'est pas autorisé` !**

---

**Configure les permissions et teste !** 🚀
