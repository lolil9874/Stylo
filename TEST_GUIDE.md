# 🧪 Guide de Test - Stylo

## ✅ Critères d'acceptation

### 1. **Fenêtre flottante**
- [ ] La fenêtre reste toujours au-dessus de toutes les applications
- [ ] La fenêtre est visible sur tous les Spaces macOS
- [ ] La fenêtre ne peut pas recevoir le focus par défaut
- [ ] Le clic sur le bouton ⭐ ne fait pas apparaître Electron au premier plan

### 2. **Cycle d'action au clic sur ⭐**
- [ ] L'app frontmost est mémorisée en arrière-plan
- [ ] L'app frontmost est réactivée immédiatement au clic
- [ ] Le focus reste sur l'input/textarea cible
- [ ] Le texte est sélectionné et copié automatiquement
- [ ] La fonction Supabase `/enhance-prompt` est appelée
- [ ] Le texte amélioré remplace le contenu original
- [ ] Le presse-papiers initial est restauré

### 3. **Permissions et robustesse**
- [ ] Vérification des permissions d'accessibilité au lancement
- [ ] Affichage du guide d'onboarding si permissions manquantes
- [ ] Timeout réseau de 10 secondes respecté
- [ ] Gestion des cas de texte vide/pas d'input focus
- [ ] Indicateur de chargement visible pendant le traitement

## 🧪 Tests à effectuer

### Test 1 : Notes (macOS)
1. Ouvrir l'application Notes
2. Taper du texte dans une note
3. Cliquer sur le bouton ⭐ dans Stylo
4. **Résultat attendu** : Le texte est amélioré et remplacé dans Notes

### Test 2 : Messages (macOS)
1. Ouvrir l'application Messages
2. Commencer à écrire un message
3. Cliquer sur le bouton ⭐ dans Stylo
4. **Résultat attendu** : Le texte est amélioré et remplacé dans Messages

### Test 3 : Slack (Desktop)
1. Ouvrir Slack Desktop
2. Aller dans un canal et commencer à écrire
3. Cliquer sur le bouton ⭐ dans Stylo
4. **Résultat attendu** : Le texte est amélioré et remplacé dans Slack

### Test 4 : Gmail (Chrome/Safari)
1. Ouvrir Gmail dans le navigateur
2. Cliquer sur "Composer" et commencer à écrire
3. Cliquer sur le bouton ⭐ dans Stylo
4. **Résultat attendu** : Le texte est amélioré et remplacé dans Gmail

### Test 5 : TextEdit (macOS)
1. Ouvrir TextEdit
2. Taper du texte
3. Cliquer sur le bouton ⭐ dans Stylo
4. **Résultat attendu** : Le texte est amélioré et remplacé dans TextEdit

## 🔍 Vérifications spécifiques

### Focus et activation
- [ ] Stylo ne vole jamais le focus de l'application cible
- [ ] L'application cible reste active après le clic
- [ ] Le curseur reste dans le champ de texte original

### Gestion du clipboard
- [ ] Le contenu du presse-papiers est sauvegardé avant l'opération
- [ ] Le contenu du presse-papiers est restauré après l'opération
- [ ] Aucune perte de contenu du presse-papiers

### Gestion d'erreurs
- [ ] Message d'erreur si pas d'input focus
- [ ] Message d'erreur si timeout réseau
- [ ] Message d'erreur si permissions manquantes
- [ ] Pas de crash de l'application

### Performance
- [ ] Temps de réponse acceptable (< 5 secondes)
- [ ] Indicateur de chargement visible
- [ ] Interface responsive pendant le traitement

## 🐛 Problèmes connus et solutions

### Problème : "Place ton curseur dans une zone de texte"
**Cause** : Aucun champ de texte n'est focus
**Solution** : Cliquer dans un champ de texte avant de cliquer sur ⭐

### Problème : "Timeout: La requête a pris trop de temps"
**Cause** : Problème réseau ou configuration Supabase
**Solution** : Vérifier la configuration dans `config.js`

### Problème : "Permissions d'accessibilité requises"
**Cause** : Permissions macOS manquantes
**Solution** : Suivre le guide de configuration

### Problème : Le texte n'est pas remplacé
**Cause** : Permissions ou focus perdu
**Solution** : Redémarrer l'application et vérifier les permissions

## 📊 Logs de débogage

Pour déboguer, ouvrir la console de développement (F12) et vérifier :

1. **Mémorisation de l'app** :
   ```
   📱 Frontmost app remembered: Notes
   ```

2. **Réactivation de l'app** :
   ```
   🔄 App reactivated
   ```

3. **Extraction du texte** :
   ```
   📄 Text extracted: Votre texte ici...
   ```

4. **Appel Supabase** :
   ```
   🤖 Calling Supabase enhance-prompt...
   ```

5. **Collage du texte** :
   ```
   📋 Text pasted successfully
   ```

6. **Restauration du clipboard** :
   ```
   📋 Clipboard restored
   ```

## ✅ Validation finale

- [ ] Tous les tests passent
- [ ] Aucun crash ou erreur critique
- [ ] Performance acceptable
- [ ] Interface utilisateur fluide
- [ ] Gestion d'erreurs robuste

---

**Note** : Si un test échoue, consulter les logs de la console pour identifier le problème et suivre les solutions proposées.
