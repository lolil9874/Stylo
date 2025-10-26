# 🤗 Configuration Hugging Face pour Stylo

## 📋 Ce qui a été ajouté

L'application Stylo utilise maintenant **Hugging Face Prompt++** pour améliorer vos prompts !

- **Modèle** : `baconnier/prompt-plus-plus`
- **Spécialisé** : Amélioration de prompts pour l'IA
- **Gratuit** : API gratuite avec compte Hugging Face
- **Automatique** : Le bouton ⭐ Enhancement utilise automatiquement Hugging Face

## 🔑 Comment obtenir votre clé API (gratuite)

### Étape 1 : Créer un compte Hugging Face
1. Allez sur [huggingface.co](https://huggingface.co/join)
2. Créez un compte (gratuit)
3. Confirmez votre email

### Étape 2 : Créer un token API
1. Une fois connecté, allez sur [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Cliquez sur **"New token"**
3. Donnez un nom à votre token (ex: "Stylo App")
4. Sélectionnez le type **"Read"** (suffisant pour utiliser l'API)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN** (il commence par `hf_...`)

### Étape 3 : Ajouter le token dans Stylo
1. Ouvrez le fichier `config.js` dans le dossier Stylo
2. Trouvez la section `HUGGINGFACE_CONFIG`
3. Remplacez `'YOUR_HUGGINGFACE_API_KEY_HERE'` par votre token :

```javascript
// Configuration Hugging Face
const HUGGINGFACE_CONFIG = {
  apiUrl: 'https://api-inference.huggingface.co/models',
  models: {
    promptPlusPlus: 'baconnier/prompt-plus-plus'
  },
  // 🔑 REMPLACEZ ICI avec votre token
  apiKey: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx'  // ← Votre token ici
};
```

4. Sauvegardez le fichier
5. Relancez l'application

## ✅ Test

1. Lancez Stylo
2. Sélectionnez du texte (un prompt pour l'IA)
3. Cliquez sur le bouton ⭐ (Enhancement)
4. Choisissez vos filtres
5. Cliquez sur "Launch"

Vous devriez voir dans la console :
```
🤗 Calling Hugging Face API (Prompt++)...
✅ Hugging Face response: [...]
```

## 🎯 Utilisation

**Quand utiliser Enhancement (⭐) avec Hugging Face ?**
- Pour améliorer des prompts destinés à ChatGPT, Claude, etc.
- Pour rendre vos instructions plus claires et précises
- Pour optimiser vos demandes à l'IA

**Exemple :**
- **Avant** : "écris moi un article sur les chiens"
- **Après** : "Write a comprehensive, well-structured article about dogs, covering their history, breeds, behavior, and care requirements. Use an informative tone suitable for a general audience."

## 🔧 Configuration avancée

Dans `config.js`, vous pouvez changer le provider :

```javascript
providers: {
  default: 'openai',              // Pour Rephrasing et Translation
  promptEnhancement: 'huggingface' // Pour Enhancement (défaut)
}
```

**Options disponibles :**
- `'huggingface'` - Prompt++ (gratuit, spécialisé prompts) ⭐ **Recommandé pour Enhancement**
- `'openrouter'` - Llama 3.3 (gratuit, général)
- `'openai'` - GPT-4o-mini (payant, précis)

## 📊 Limites de l'API gratuite Hugging Face

- **Rate limit** : ~1000 requêtes/jour
- **Timeout** : Première requête peut être lente (modèle se charge)
- **Longueur** : Max ~512 tokens en sortie

Si vous dépassez ces limites, vous pouvez :
1. Revenir à OpenAI/OpenRouter dans `config.js`
2. Upgrader vers Hugging Face Pro ($9/mois)

## 🐛 Problèmes courants

### "Hugging Face API key not configured"
→ Vérifiez que vous avez bien remplacé `YOUR_HUGGINGFACE_API_KEY_HERE` dans `config.js`

### "Model is loading"
→ Le modèle se charge pour la première fois (peut prendre 20-30 secondes)
→ Réessayez dans 30 secondes

### "Rate limit exceeded"
→ Vous avez dépassé la limite gratuite
→ Changez le provider dans `config.js` ou attendez demain

## 📚 Liens utiles

- [Hugging Face](https://huggingface.co)
- [Tokens API](https://huggingface.co/settings/tokens)
- [Documentation API](https://huggingface.co/docs/api-inference/index)
- [Modèle Prompt++](https://huggingface.co/baconnier/prompt-plus-plus)

---

**Besoin d'aide ?** Consultez la documentation ou créez une issue sur GitHub.

