// Configuration Supabase
const SUPABASE_CONFIG = {
  // Configuration Supabase Stylo
  url: 'https://vkyfdunlbpzwxryqoype.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530',
  
  // URLs des fonctions Edge (OpenRouter par défaut - Plus rapide et gratuit!)
  functions: {
    // OpenRouter (Llama 3.3) - PAR DÉFAUT
    enhancePrompt: '/functions/v1/enhance-prompt-openrouter',
    rephraseText: '/functions/v1/rephrase-text-openrouter',
    translateText: '/functions/v1/translate-text-openrouter',
    
    // OpenAI (GPT-4o-mini) - FALLBACK si besoin
    enhancePromptOpenAI: '/functions/v1/enhance-promptv2',
    rephraseTextOpenAI: '/functions/v1/rephrase-text',
    translateTextOpenAI: '/functions/v1/translate-text',
    
    voiceProcessing: '/functions/v1/voice-processing'
  }
  // Note: Toutes les fonctions utilisent maintenant OpenRouter (Llama 3.3) par défaut !
};

// Configuration Hugging Face
const HUGGINGFACE_CONFIG = {
  apiUrl: 'https://api-inference.huggingface.co/models',
  models: {
    promptPlusPlus: 'baconnier/prompt-plus-plus'
  },
  // 🔑 Ajoutez votre clé API Hugging Face ici (gratuite sur huggingface.co/settings/tokens)
  apiKey: 'YOUR_HUGGINGFACE_API_KEY_HERE'
};

// Configuration de l'app
const APP_CONFIG = {
  // Timeout pour les requêtes réseau (en ms)
  networkTimeout: 10000,
  
  // Délai d'attente après réactivation de l'app (en ms)
  reactivationDelay: 200,
  
  // Délai d'attente pour la sélection/copie (en ms)
  selectionDelay: 100,
  
  // Délai d'attente pour le collage (en ms)
  pasteDelay: 100,
  
  // 🎯 CHOIX DU PROVIDER POUR TOUS LES BOUTONS
  // Options: 
  //   - 'openrouter' (Llama 3.3 - gratuit, rapide)
  //   - 'openai' (GPT-4o-mini - payant, précis)
  //   - 'huggingface' (Prompt++ - gratuit, spécialisé prompts) ⭐ NOUVEAU
  providers: {
    default: 'openai',  // ✍️🌍 Rephrasing et Translation
    promptEnhancement: 'huggingface'  // ⭐ Enhancement utilise Hugging Face Prompt++
  }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, HUGGINGFACE_CONFIG, APP_CONFIG };
} else {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.HUGGINGFACE_CONFIG = HUGGINGFACE_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
}