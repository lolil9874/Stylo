# ⭐ Comment utiliser le bouton Star de Stylo

## 🚀 Lancement

```bash
cd /Users/mrh/Desktop/Stylo
npm start
```

L'interface flottante apparaît en haut de votre écran ! ✨

## 📝 Utilisation du bouton Star

### Sur N'IMPORTE QUELLE PAGE WEB (Chrome, Safari, etc.) :

1. **Sélectionnez du texte** n'importe où (avec votre souris)
   - Exemple : "Write a story about a cat"

2. **Cliquez sur l'étoile ⭐** dans l'interface Stylo

3. **Attendez 2-5 secondes** ⏳

4. **BOOM !** Le texte amélioré est automatiquement collé ! ✨

## 🎯 Comment ça marche ?

```
1. Vous sélectionnez du texte
   ↓
2. Click sur ⭐
   ↓
3. Stylo copie le texte (Cmd+C automatique)
   ↓
4. Envoie à OpenAI via Supabase
   ↓
5. Reçoit le texte amélioré
   ↓
6. Colle automatiquement (Cmd+V automatique)
```

## ✅ Ça fonctionne sur :

- ✅ **Chrome** (Gmail, ChatGPT, Google Docs, etc.)
- ✅ **Safari** (tous les sites web)
- ✅ **Firefox** (tous les sites web)
- ✅ **Slack** (messages)
- ✅ **Notes** (app macOS)
- ✅ **TextEdit** (app macOS)
- ✅ **N'IMPORTE QUELLE APPLICATION** qui supporte Cmd+C/Cmd+V !

## 🎬 Exemple concret

### Avant (texte sélectionné) :
```
Write a story about a cat
```

### Après (texte amélioré et collé automatiquement) :
```
Write a compelling short story about a curious and adventurous cat. 
Include vivid descriptions of the cat's personality, its environment, 
and the challenges it faces. Use engaging narrative elements and 
sensory details to bring the story to life. The story should be 
between 500-800 words.
```

## 🔧 Mode développement (avec console)

Pour voir les logs détaillés :

```bash
npm run dev
```

La console Electron s'ouvrira et vous verrez tous les logs !

## 🐛 Résolution de problèmes

### "Please select some text first!"
→ Vous devez **sélectionner du texte** avant de cliquer sur l'étoile

### "Failed to copy text"
→ Donnez les permissions d'accessibilité à l'app dans :
  **Préférences Système** > **Sécurité** > **Accessibilité**

### "API connection failed"
→ Vérifiez que votre clé OpenAI est bien configurée dans Supabase

### Rien ne se passe
→ Lancez avec `npm run dev` pour voir les logs

## 💡 Tips

- Vous pouvez **déplacer** l'interface en la faisant glisser
- L'interface reste **toujours au-dessus** des autres fenêtres
- Fonctionne même quand l'app Stylo n'est pas au premier plan !

## 🎨 Workflow recommandé

1. Ouvrez ChatGPT, Gmail, ou n'importe où
2. Tapez un prompt basique
3. Sélectionnez-le avec la souris
4. Click sur ⭐
5. Votre prompt est amélioré automatiquement !

Pas besoin d'extension navigateur, ça marche PARTOUT ! 🚀

