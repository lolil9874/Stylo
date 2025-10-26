# 🎨 Intégration des Filtres - Guide Backend

## ✅ Ce qui a été fait côté Frontend

Les filtres sélectionnés par l'utilisateur sont maintenant **envoyés à l'API** pour conditionner le résultat.

### 1. **Collecte des Options**

```javascript
// Fonction qui récupère les filtres actifs
getOptions(action) {
  if (action === 'reformulation') {
    return {
      type: 'professional',      // professional, casual, formal, simple
      tone: 'neutral',            // neutral, friendly, assertive, persuasive
      length: 'same',             // shorter, same, longer
      corrections: 'all'          // all, grammar, minimal
    };
  }
  
  if (action === 'improvement') {
    return {
      goal: 'informative',        // informative, creative, analytical, technical
      audience: 'general',        // general, expert, beginner, technical
      detail: 'balanced',         // concise, balanced, detailed
      format: 'paragraph'         // paragraph, bullet, numbered
    };
  }
  
  if (action === 'translation') {
    return {
      target: 'en',               // en, es, de, zh
      style: 'standard',          // standard, formal, casual
      context: 'general'          // general, business, technical
    };
  }
}
```

### 2. **Envoi à l'API**

```javascript
// Les options sont maintenant passées dans tous les appels
const options = this.getOptions('reformulation');
const result = await this.callAI(text, 'rephrase-text', options);

// L'API reçoit:
{
  "text": "Le texte à traiter",
  "options": {
    "type": "professional",
    "tone": "neutral",
    "length": "same",
    "corrections": "all"
  }
}
```

## 🔧 Ce qu'il faut faire côté Backend (Supabase Functions)

### Structure des Fonctions Edge à Modifier

Vous avez ces fonctions dans `supabase-functions/` :

#### 1. **`rephrase-text-openrouter/index.ts`**

```typescript
// AVANT (ne prend que le texte)
Deno.serve(async (req) => {
  const { text } = await req.json();
  
  const prompt = `Rephrase this text: ${text}`;
  
  // Appel OpenRouter...
});

// APRÈS (utilise les options)
Deno.serve(async (req) => {
  const { text, options } = await req.json();
  
  // 🎯 CONSTRUIRE LE PROMPT SELON LES OPTIONS
  let prompt = `Rephrase this text`;
  
  // Style
  if (options?.type === 'professional') {
    prompt += ' in a professional tone';
  } else if (options?.type === 'casual') {
    prompt += ' in a casual, friendly tone';
  } else if (options?.type === 'formal') {
    prompt += ' in a formal, academic tone';
  } else if (options?.type === 'simple') {
    prompt += ' using simple, clear language';
  }
  
  // Ton
  if (options?.tone === 'assertive') {
    prompt += ', be assertive and confident';
  } else if (options?.tone === 'friendly') {
    prompt += ', keep it warm and friendly';
  } else if (options?.tone === 'persuasive') {
    prompt += ', make it persuasive and direct';
  }
  
  // Longueur
  if (options?.length === 'shorter') {
    prompt += '. Make it more concise';
  } else if (options?.length === 'longer') {
    prompt += '. Expand with more details';
  }
  
  // Corrections
  if (options?.corrections === 'all') {
    prompt += '. Fix all grammar and spelling errors';
  } else if (options?.corrections === 'grammar') {
    prompt += '. Fix only grammar errors';
  }
  
  prompt += `:\n\n${text}`;
  
  // Appel OpenRouter avec le prompt conditionné...
});
```

#### 2. **`enhance-prompt-openrouter/index.ts`**

```typescript
Deno.serve(async (req) => {
  const { text, options } = await req.json();
  
  let prompt = `Enhance this prompt`;
  
  // Goal
  if (options?.goal === 'creative') {
    prompt += ' for creative content generation';
  } else if (options?.goal === 'analytical') {
    prompt += ' for analytical thinking and analysis';
  } else if (options?.goal === 'technical') {
    prompt += ' for technical documentation';
  }
  
  // Audience
  if (options?.audience === 'expert') {
    prompt += ', targeted at expert users with advanced knowledge';
  } else if (options?.audience === 'beginner') {
    prompt += ', targeted at beginners, keep it simple';
  }
  
  // Detail
  if (options?.detail === 'concise') {
    prompt += '. Be concise and to the point';
  } else if (options?.detail === 'detailed') {
    prompt += '. Provide detailed explanations';
  }
  
  // Format
  if (options?.format === 'bullet') {
    prompt += '. Format as bullet points';
  } else if (options?.format === 'numbered') {
    prompt += '. Format as numbered list';
  }
  
  prompt += `:\n\n${text}`;
  
  // Appel OpenRouter...
});
```

#### 3. **`translate-text-openrouter/index.ts`**

```typescript
Deno.serve(async (req) => {
  const { text, options } = await req.json();
  
  // Language mapping
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'de': 'German',
    'zh': 'Chinese'
  };
  
  const targetLang = languages[options?.target || 'en'];
  
  let prompt = `Translate this text to ${targetLang}`;
  
  // Style
  if (options?.style === 'formal') {
    prompt += ' using formal language';
  } else if (options?.style === 'casual') {
    prompt += ' using casual, everyday language';
  }
  
  // Context
  if (options?.context === 'business') {
    prompt += ', business context';
  } else if (options?.context === 'technical') {
    prompt += ', technical/IT context';
  }
  
  prompt += `:\n\n${text}`;
  
  // Appel OpenRouter...
});
```

## 📊 Exemple de Requête Complète

### Frontend → Backend

```javascript
// L'utilisateur a sélectionné:
// - Style: Professional
// - Tone: Assertive
// - Length: Shorter
// - Corrections: All

// Frontend envoie:
POST https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/rephrase-text-openrouter
{
  "text": "This is my original text that needs improvement.",
  "options": {
    "type": "professional",
    "tone": "assertive",
    "length": "shorter",
    "corrections": "all"
  }
}

// Backend construit le prompt:
"Rephrase this text in a professional tone, be assertive and confident. 
Make it more concise. Fix all grammar and spelling errors:

This is my original text that needs improvement."

// OpenRouter génère:
"This text requires enhancement."
```

## 🎯 Priorité d'Implémentation

1. **Reformulation** (le plus utilisé)
2. **Traduction** (simple à implémenter)
3. **Enhancement** (plus complexe)

## 📝 Templates de Prompts Recommandés

### Pour Reformulation (GPT-4o-mini / Llama 3.3)

```
You are a professional text editor. Rephrase the following text with these specifications:
- Style: {type}
- Tone: {tone}
- Length: {length}
- Corrections: {corrections}

Original text:
{text}

Rephrased text:
```

### Pour Enhancement

```
You are an expert prompt engineer. Enhance this prompt with:
- Goal: {goal}
- Audience: {audience}
- Detail level: {detail}
- Format: {format}

Original prompt:
{text}

Enhanced prompt:
```

### Pour Translation

```
Translate the following text to {target_language}.
Style: {style}
Context: {context}

Text:
{text}

Translation:
```

## 🧪 Test

Après modification, testez avec DevTools ouvert pour voir les logs :

```javascript
🎨 Options utilisées pour la reformulation: {
  type: "professional",
  tone: "assertive", 
  length: "shorter",
  corrections: "all"
}
🤖 Calling Supabase /functions/v1/rephrase-text-openrouter...
```

---

**Status**: ✅ Frontend prêt - En attente implémentation Backend

