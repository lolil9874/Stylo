# 🔍 Guide de Débogage Stylo

## Problème
Les actions ne fonctionnent pas - les boutons sont cliqués mais rien ne se passe.

## 🐛 Corrections Appliquées

### 1. **config.js** - `HUGGINGFACE_CONFIG` manquant
- ✅ Ajouté la configuration Hugging Face
- ✅ Corrigé l'export des configurations

### 2. **script.js** - `setupPanelListeners()` non appelé
- ✅ Ajouté `setupPanelListeners()` dans `init()`
- ✅ Le bouton Launch est maintenant écouté dès le démarrage

### 3. **script.js** - Logs de débogage ajoutés
- ✅ Logs dans `setupPanelListeners()` pour voir si les boutons sont trouvés
- ✅ Logs dans `executeAction()` pour voir si l'action est appelée  
- ✅ Logs dans `handlePromptEnhancement()` pour voir le workflow

## 🧪 Comment Tester

### Étape 1: Relancer l'application
```bash
cd /Users/vivi0/Stylo-2
npm start
```

### Étape 2: Ouvrir la Console DevTools
1. Une fois l'app lancée, appuyez sur `Cmd+Alt+I` pour ouvrir DevTools
2. Allez dans l'onglet **Console**
3. Vous devriez voir :
   ```
   ✅ Script.js loaded
   🚀 Stylo App initializing...
   🔧 Setting up panel listeners...
   🔍 Looking for launch button...
   ✅ Launch button found! Attaching listener...
   ✅ Launch button listener attached successfully!
   ✅ Panel listeners setup complete
   ```

### Étape 3: Test Simple Clic
1. **Cliquez UNE FOIS** sur le bouton ✍️ (Reformulation)
2. Attendez 300ms (le délai pour détecter le double-clic)
3. Dans la console, vous devriez voir :
   ```
   🎯 Button clicked: reformulation (click 1)
   📂 Single click - Opening filter panel
   🎨 Before adding show class: filter-modal
   🎨 After adding show class: filter-modal show
   📂 Panel opened: reformulation
   ```
4. Le panneau devrait s'afficher à droite avec les options

### Étape 4: Test Bouton Launch
1. Une fois le panneau ouvert, cliquez sur **Launch**
2. Dans la console, vous devriez voir :
   ```
   🚀 Launch button CLICKED!
   🚀 Event: MouseEvent { ... }
   🚀 currentAction: reformulation
   🚀 Launching action: reformulation
   🎯 executeAction() called with action: reformulation
   🎯 isProcessing: false
   🎯 Calling handleRephrase()...
   ✍️ handleRephrase() STARTED
   ✍️ Starting text rephrasing workflow...
   ```

### Étape 5: Test Double-Clic
1. **Double-cliquez rapidement** sur un bouton
2. Dans la console, vous devriez voir :
   ```
   🎯 Button clicked: reformulation (click 1)
   🎯 Button clicked: reformulation (click 2)
   🚀 Double-click detected - Executing action directly with default params
   🎯 executeAction() called with action: reformulation
   ```

## 🚨 Scénarios d'Erreur

### Si vous NE VOYEZ PAS les logs de setupPanelListeners()
❌ **Problème**: `init()` ne s'exécute pas ou `setupPanelListeners()` n'est pas appelé
🔧 **Solution**: Vérifier que `document.addEventListener('DOMContentLoaded', ...)` fonctionne

### Si le Launch button n'est PAS trouvé
❌ **Problème**: `getElementById('launch-button')` retourne `null`
🔧 **Solution**: Vérifier que `index.html` contient bien `<button id="launch-button">`

### Si currentAction est `undefined`
❌ **Problème**: `showPanel()` n'a pas été appelé ou `this.currentAction` n'est pas défini
🔧 **Solution**: Vérifier que `showPanel(action)` définit `this.currentAction = action`

### Si handleRephrase() ne démarre pas
❌ **Problème**: `this.isProcessing` est déjà `true`
🔧 **Solution**: Redémarrer l'app ou attendre que l'action précédente se termine

## 📊 Logs Attendus (Workflow Complet)

```
// 1. Démarrage
✅ Script.js loaded
🚀 Stylo App initializing...
🔧 Setting up panel listeners...
✅ Launch button found! Attaching listener...
✅ Panel listeners setup complete

// 2. Clic sur bouton
🎯 Button clicked: reformulation (click 1)
📂 Single click - Opening filter panel
📂 Panel opened: reformulation

// 3. Clic sur Launch
🚀 Launch button CLICKED!
🚀 Launching action: reformulation
🎯 executeAction() called with action: reformulation
🎯 Calling handleRephrase()...
✍️ handleRephrase() STARTED

// 4. Workflow de l'action
✍️ Starting text rephrasing workflow...
📱 Frontmost app remembered on hover
🔄 Reactivated app: com.apple.Terminal
📋 Copied text from clipboard: ...
🤖 Calling Supabase rephrase-text-openrouter...
✨ Rephrased text received: ...
✅ SUCCESS! Text rephrased successfully
```

## 🔬 Tests Supplémentaires

### Test 1: Vérifier config.js
Ouvrez la console et tapez :
```javascript
console.log(window.SUPABASE_CONFIG);
console.log(window.HUGGINGFACE_CONFIG);
console.log(window.APP_CONFIG);
```
Vous devriez voir les objets de configuration, pas `undefined`.

### Test 2: Vérifier electronAPI
```javascript
console.log(window.electronAPI);
console.log(typeof window.electronAPI.getClipboardText);
```
Vous devriez voir un objet avec toutes les méthodes.

### Test 3: Vérifier les éléments DOM
```javascript
console.log(document.getElementById('launch-button'));
console.log(document.getElementById('context-panel'));
console.log(document.querySelectorAll('.action-button').length);
```
Tous devraient retourner des éléments valides.

## 📝 Rapport de Bug

Si ça ne marche toujours pas, envoyez-moi :
1. **Tous les logs de la console** (copier/coller)
2. **Les résultats des tests** (config, electronAPI, DOM)
3. **Étape exacte où ça bloque**

## 🎯 Actions Suivantes

Une fois que les logs de débogage montrent le problème exact, nous pourrons :
- Corriger le bug spécifique
- Retirer les logs de débogage
- Tester le workflow complet
- Vérifier que toutes les actions fonctionnent

---

**Statut**: ✅ Logs de débogage ajoutés, prêt à tester !

