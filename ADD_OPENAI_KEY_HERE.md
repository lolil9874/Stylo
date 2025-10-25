# 🔑 AJOUTER VOTRE CLÉ OPENAI ICI

## 🎯 Étape Unique pour Activer Stylo

Votre fonction **enhance-prompt** est déployée et prête. Il ne manque que votre clé OpenAI !

---

## 📍 MÉTHODE 1 : Dashboard Supabase (Recommandé)

### 1️⃣ Ouvrez ce lien dans votre navigateur :

```
https://supabase.com/dashboard/project/vkyfdunlbpzwxryqoype/settings/functions
```

### 2️⃣ Cherchez la section "Secrets" ou "Environment Variables"

Vous devriez voir une interface pour ajouter des variables d'environnement.

### 3️⃣ Cliquez sur "Add new secret" ou "New environment variable"

### 4️⃣ Remplissez les champs :

```
┌─────────────────────────────────────────────┐
│  Name (Nom)                                 │
│  ┌───────────────────────────────────────┐  │
│  │ OPENAI_API_KEY                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Value (Valeur)                             │
│  ┌───────────────────────────────────────┐  │
│  │ sk-votre-clé-openai-ici               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [Cancel]              [Save/Add Secret]   │
└─────────────────────────────────────────────┘
```

### 5️⃣ Cliquez sur "Save" ou "Add Secret"

### 6️⃣ C'est terminé ! ✅

---

## 📍 MÉTHODE 2 : Via Terminal (Alternative)

### 1️⃣ Ouvrez votre terminal

### 2️⃣ Assurez-vous d'être connecté à Supabase :

```bash
supabase login
```

### 3️⃣ Liez le projet (si pas déjà fait) :

```bash
supabase link --project-ref vkyfdunlbpzwxryqoype
```

### 4️⃣ Ajoutez le secret :

```bash
supabase secrets set OPENAI_API_KEY=sk-votre-clé-openai-ici
```

**Remplacez `sk-votre-clé-openai-ici` par votre vraie clé !**

### 5️⃣ Vérifiez que le secret est ajouté :

```bash
supabase secrets list
```

Vous devriez voir `OPENAI_API_KEY` dans la liste.

---

## 🔍 OÙ TROUVER VOTRE CLÉ OPENAI ?

### Si vous avez déjà un compte OpenAI :

1. Allez sur : https://platform.openai.com/api-keys
2. Connectez-vous
3. Cliquez sur "Create new secret key"
4. Copiez la clé (elle commence par `sk-`)
5. ⚠️ **Sauvegardez-la** - vous ne pourrez plus la voir après !

### Si vous n'avez pas de compte OpenAI :

1. Allez sur : https://platform.openai.com/signup
2. Créez un compte
3. Ajoutez un moyen de paiement (nécessaire pour utiliser l'API)
4. Allez sur : https://platform.openai.com/api-keys
5. Créez une nouvelle clé

---

## 🧪 TESTER APRÈS AVOIR AJOUTÉ LA CLÉ

### Test 1 : Via script automatique

```bash
./test-function.sh
```

**Résultat attendu** : ✅ SUCCÈS avec un texte amélioré

### Test 2 : Via curl manuel

```bash
curl -X POST 'https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-prompt' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Write a story about a cat"}'
```

**Résultat attendu** :
```json
{
  "enhanced_text": "Write a compelling short story...",
  "original_text": "Write a story about a cat",
  "model_used": "gpt-4o-mini"
}
```

### Test 3 : Avec l'interface Stylo

1. Lancez Stylo : `npm start`
2. Ouvrez : `open test-page.html`
3. Tapez du texte dans un champ
4. Cliquez sur le bouton ⭐
5. Le texte devrait être remplacé par la version améliorée !

---

## ❌ ERREURS POSSIBLES

### "OpenAI API key not found"
→ La clé n'est pas ajoutée ou mal nommée
→ Vérifiez que le nom est exactement : `OPENAI_API_KEY`

### "OpenAI API error: 401"
→ Votre clé est invalide ou expirée
→ Générez une nouvelle clé sur OpenAI

### "OpenAI API error: 429"
→ Quota dépassé
→ Vérifiez votre utilisation sur : https://platform.openai.com/usage

### "OpenAI API error: 500"
→ Problème côté OpenAI
→ Réessayez dans quelques minutes

---

## 📊 APRÈS L'ACTIVATION

### Voir les logs en temps réel :

```bash
supabase functions logs enhance-prompt --follow
```

### Surveiller l'utilisation OpenAI :

https://platform.openai.com/usage

### Coût estimé :

- Par requête : ~$0.0001 - $0.0005
- 100 requêtes : ~$0.01 - $0.05
- 1000 requêtes : ~$0.10 - $0.50

GPT-4o-mini est très économique ! 💰

---

## ✅ CHECKLIST

- [ ] J'ai ma clé OpenAI (commence par `sk-`)
- [ ] J'ai ajouté `OPENAI_API_KEY` dans Supabase
- [ ] J'ai testé avec `./test-function.sh`
- [ ] Le test montre ✅ SUCCÈS
- [ ] J'ai lancé Stylo avec `npm start`
- [ ] J'ai testé avec le bouton ⭐
- [ ] Ça fonctionne ! 🎉

---

## 🎯 RÉCAPITULATIF

1. **Ajoutez** `OPENAI_API_KEY` dans Supabase Dashboard
2. **Testez** avec `./test-function.sh`
3. **Utilisez** Stylo avec le bouton ⭐

**C'est tout !** Votre assistant IA est prêt ! ✨

---

**Besoin d'aide ?**
- Lisez `README_FIRST.md` pour un guide complet
- Lisez `STATUS.md` pour le status détaillé
- Exécutez `./test-function.sh` pour diagnostiquer

**Stylo** - Votre assistant IA pour l'amélioration de texte
