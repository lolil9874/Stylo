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
  
  // 🎯 CHOIX DU PROVIDER POUR CHAQUE BOUTON
  // Options: 'openrouter' (Llama 3.3 - gratuit, rapide) ou 'openai' (GPT-4o-mini - payant, précis)
  providers: {
    enhancePrompt: 'openai',  // ⭐ Star button - Améliorer le prompt
    rephraseText: 'openrouter',   // ✍️ Pen button - Reformuler le texte
    translateText: 'openrouter'   // 🌍 Translate button - Traduire en anglais
  }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, APP_CONFIG };
} else {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
}