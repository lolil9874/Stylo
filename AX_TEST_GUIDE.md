# 🧪 Guide de Test AX - Stylo

## ✅ Nouveau Système Implémenté

### 🔧 **Bridge Natif macOS**
- ✅ **Binaire Swift compilé** : `bin/StyloBridge`
- ✅ **Fonctions AX natives** : `getFocusedTextValue()` et `setFocusedTextValue()`
- ✅ **Gestion des permissions** : Vérification automatique des permissions d'accessibilité
- ✅ **Fallback intelligent** : Raccourcis clavier si AX échoue

### 🎯 **Onboarding des Permissions**
- ✅ **Écran guidé** : Interface élégante pour configurer les permissions
- ✅ **Détection en boucle** : Vérification automatique des permissions
- ✅ **Boutons "Ouvrir Réglages"** : Ouverture directe des préférences macOS
- ✅ **Persistance** : Sauvegarde de l'état des permissions

### ⚡ **Flux d'Exécution Optimisé**
1. **Vérification des permissions** au lancement
2. **Lecture directe** du texte via AX (pas de clipboard)
3. **Écriture directe** du texte via AX (pas de focus perdu)
4. **Fallback automatique** vers raccourcis clavier si nécessaire

## 🧪 Tests à Effectuer

### Test 1 : Onboarding des Permissions
1. **Supprimer** le fichier `permissions.json` s'il existe
2. **Lancer** `npm start`
3. **Vérifier** que l'écran d'onboarding s'affiche
4. **Tester** les boutons "Ouvrir Réglages"
5. **Accorder** les permissions d'accessibilité
6. **Vérifier** que l'écran d'onboarding se ferme

### Test 2 : Lecture AX dans Notes
1. **Ouvrir** l'application Notes
2. **Taper** du texte dans une note
3. **Cliquer** sur le bouton ⭐ dans Stylo
4. **Vérifier** que le texte est lu via AX (pas de clipboard)
5. **Vérifier** que le texte est amélioré et remplacé

### Test 3 : Écriture AX dans Messages
1. **Ouvrir** l'application Messages
2. **Commencer** à écrire un message
3. **Cliquer** sur le bouton ⭐ dans Stylo
4. **Vérifier** que le texte est remplacé directement
5. **Vérifier** que le focus reste dans Messages

### Test 4 : Fallback dans Slack
1. **Ouvrir** Slack Desktop
2. **Aller** dans un canal et commencer à écrire
3. **Cliquer** sur le bouton ⭐ dans Stylo
4. **Vérifier** que le système utilise AX en priorité
5. **Si AX échoue**, vérifier le fallback keystrokes

### Test 5 : Gmail (Chrome/Safari)
1. **Ouvrir** Gmail dans le navigateur
2. **Cliquer** sur "Composer" et commencer à écrire
3. **Cliquer** sur le bouton ⭐ dans Stylo
4. **Vérifier** que le texte est lu et remplacé
5. **Vérifier** que le focus reste dans Gmail

## 🔍 Vérifications Spécifiques

### Permissions
- [ ] **Accessibilité** : Accordée et détectée
- [ ] **Input Monitoring** : Accordée (pour fallback)
- [ ] **Screen Recording** : Optionnelle

### Bridge Natif
- [ ] **Binaire compilé** : `bin/StyloBridge` existe et est exécutable
- [ ] **Fonctions AX** : `getFocusedTextValue()` et `setFocusedTextValue()` fonctionnent
- [ ] **Gestion d'erreurs** : Messages d'erreur clairs

### Flux Principal
- [ ] **Pas de clipboard** : Le texte n'est pas copié/collé
- [ ] **Pas de focus perdu** : L'app cible reste active
- [ ] **Lecture directe** : AX lit le texte directement
- [ ] **Écriture directe** : AX écrit le texte directement

### Fallback
- [ ] **Détection d'échec** : AX échoue → fallback automatique
- [ ] **Raccourcis clavier** : Cmd+A/C/V fonctionnent
- [ ] **Restoration clipboard** : Le presse-papiers est restauré

## 📊 Logs de Débogage

### Bridge Natif
```bash
# Tester le bridge directement
./bin/StyloBridge checkPermissions
./bin/StyloBridge getFocusedTextValue
./bin/StyloBridge setFocusedTextValue "Test"
```

### Console Electron
Rechercher ces logs :
```
🔍 AX getFocusedTextValue result: {...}
✏️ AX setFocusedTextValue result: {...}
🔄 Using fallback keystrokes...
```

### Permissions
Vérifier le fichier `permissions.json` :
```json
{
  "hasAccessibility": true,
  "hasInputMonitoring": true,
  "hasScreenRecording": false,
  "onboardingCompleted": true
}
```

## 🐛 Problèmes Connus et Solutions

### Problème : "Bridge error: ENOENT"
**Cause** : Le binaire `StyloBridge` n'est pas compilé
**Solution** : Exécuter `cd native-bridge && ./build.sh`

### Problème : "Accessibility permission denied"
**Cause** : Permissions d'accessibilité non accordées
**Solution** : Suivre l'onboarding ou accorder manuellement

### Problème : "Focused element is not a text field"
**Cause** : Le curseur n'est pas dans un champ de texte
**Solution** : Cliquer dans un champ de texte avant de cliquer sur ⭐

### Problème : "AX replacement failed, trying fallback..."
**Cause** : L'app cible ne permet pas l'écriture AX
**Solution** : Le système utilise automatiquement le fallback

## ✅ Critères d'Acceptation

- [ ] **Onboarding fonctionne** : Permissions configurées une seule fois
- [ ] **AX en priorité** : Lecture/écriture directe sans clipboard
- [ ] **Pas de focus perdu** : L'app cible reste active
- [ ] **Fallback intelligent** : Raccourcis clavier si AX échoue
- [ ] **UX claire** : Spinner, toasts, messages d'aide
- [ ] **Multi-applications** : Fonctionne dans Notes, Messages, Slack, Gmail

---

**🎯 Objectif** : Un clic sur ⭐ → texte lu via AX → amélioré → remplacé via AX → focus préservé !
