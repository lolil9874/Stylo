# 🔧 Configuration Supabase

## ✅ **BONNE NOUVELLE !**

Le système de lecture/écriture du texte **FONCTIONNE** maintenant ! 🎉

L'erreur "Failed to fetch" signifie que Supabase n'est pas encore configuré.

## 🔧 **CONFIGURATION REQUISE**

### 1. **Mettre à jour `config.js`**

Ouvre le fichier `config.js` et remplace par tes vraies valeurs :

```javascript
window.SUPABASE_CONFIG = {
  url: 'https://TON-PROJET.supabase.co', // ⚠️ REMPLACE PAR TON URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // ⚠️ REMPLACE PAR TA CLÉ
  functions: {
    enhancePrompt: '/functions/v1/enhance-prompt'
  }
};

window.APP_CONFIG = {
  networkTimeout: 10000 // 10 seconds
};
```

### 2. **Trouver tes identifiants Supabase**

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **Settings** > **API**
4. Copie :
   - **Project URL** → `url`
   - **anon public** → `anonKey`

### 3. **Déployer la fonction Edge**

```bash
cd supabase-functions
npx supabase functions deploy enhance-prompt
```

### 4. **Configurer la clé OpenAI**

1. Va dans **Edge Functions** > **Settings**
2. Ajoute une variable d'environnement :
   - Nom : `OPENAI_API_KEY`
   - Valeur : Ta clé OpenAI

## 🧪 **TESTER SANS SUPABASE (MODE DEBUG)**

Si tu veux tester que tout fonctionne sans Supabase, tu peux temporairement modifier `script.js` :

```javascript
// Dans callSupabaseEnhancePrompt, remplace le fetch par :
async callSupabaseEnhancePrompt(text) {
  // MODE DEBUG : Retourne le texte en majuscules
  await this.sleep(1000); // Simule un délai
  return text.toUpperCase() + " [ENHANCED]";
}
```

## ✅ **VÉRIFICATION**

Une fois Supabase configuré, tu devrais voir :

1. **Ouvrir Notes** et taper du texte
2. **Cliquer sur ⭐**
3. **Le texte est lu** (ça marche déjà !)
4. **Le texte est amélioré** par OpenAI
5. **Le texte est remplacé** dans Notes

## 🎯 **RÉSULTAT ACTUEL**

- ✅ **Lecture du texte** → FONCTIONNE
- ✅ **Focus préservé** → FONCTIONNE
- ✅ **Popup d'erreur** → FONCTIONNE
- ⚠️ **Appel Supabase** → À CONFIGURER

---

**🎉 Le plus dur est fait ! Il ne reste plus qu'à configurer Supabase !**
