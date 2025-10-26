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
    
    // LettA AI - NOUVEAU PROVIDER ⭐
    enhancePromptLettA: '/functions/v1/enhance-prompt-letta',
    rephraseTextLettA: '/functions/v1/rephrase-text-letta',
    translateTextLettA: '/functions/v1/translate-text-letta',
    
    voiceProcessing: '/functions/v1/voice-processing'
  }
  // Note: Toutes les fonctions utilisent maintenant OpenRouter (Llama 3.3) par défaut !
};

// Configuration Deepgram
const DEEPGRAM_CONFIG = {
  // Remplacez par votre clé API Deepgram
  apiKey: 'af9416509c6bf8b512b3fdced8233395fbd3e52b',
  
  // Configuration de l'API - Optimisée pour sessions longues
  model: 'nova-3',           // Nova-3 pour meilleure précision
  language: 'en',             // Anglais pour meilleure reconnaissance
  sampleRate: 16000,
  encoding: 'linear16',
  smartFormat: true,
  punctuate: true,
  diarize: false,
  
  // Paramètres pour sessions longues
  interimResults: true,      // Résultats intermédiaires
  endpointing: 1000,         // Détection de fin après 1s de silence (au lieu de 300ms)
  vadEvents: true,           // Voice Activity Detection
  utteranceEndMs: 2000,      // Fin d'énoncé après 2s de silence
  numerals: true,            // Reconnaître les chiffres
  profanityFilter: false,    // Pas de filtre de langage
  redact: false,             // Pas de masquage
  multichannel: false,       // Mono seulement
  alternatives: 1,           // Une seule alternative
  search: [],                // Pas de recherche
  replace: [],               // Pas de remplacement
  keywords: [],              // Pas de mots-clés spécifiques
  keywordBoost: 'off'       // Pas de boost de mots-clés
};

// Configuration Hugging Face
const HUGGINGFACE_CONFIG = {
  apiKey: 'YOUR_HUGGINGFACE_API_KEY_HERE',
  apiUrl: 'https://api-inference.huggingface.co/models',
  models: {
    promptPlusPlus: 'MaggieKat/Prompt_Plus_Plus'
  }
};

// Configuration de l'app
const APP_CONFIG = {
  // Timeout pour les requêtes réseau (en ms) - AUGMENTÉ pour LettA AI
  networkTimeout: 120000,       // 2 minutes pour LettA AI
  
  // Timeout spécifique pour Deepgram (en ms)
  deepgramTimeout: 60000,       // 60 secondes pour les sessions vocales
  
  // Délai d'attente après réactivation de l'app (en ms)
  reactivationDelay: 200,
  
  // Délai d'attente pour la sélection/copie (en ms)
  selectionDelay: 100,
  
  // Délai d'attente pour le collage (en ms)
  pasteDelay: 100,
  
  // Paramètres pour sessions vocales longues
  voiceSession: {
    maxDuration: 600000,         // 10 minutes maximum
    keepAliveInterval: 30000,    // Ping toutes les 30 secondes
    reconnectDelay: 2000,        // 2 secondes avant reconnexion
    silenceThreshold: 2000       // 2 secondes de silence avant fin
  },
  
  // 🎯 CHOIX DU PROVIDER POUR TOUS LES BOUTONS
  // Options: 
  //   - 'openrouter' (Llama 3.3 - gratuit, rapide)
  //   - 'openai' (GPT-4o-mini - payant, précis)
  //   - 'letta' (LettA AI - nouveau provider) ⭐ NOUVEAU
  //   - 'huggingface' (Prompt++ - gratuit, spécialisé prompts)
  providers: {
    default: 'letta',  // ✍️🌍 Rephrasing et Translation - LettA par défaut
    promptEnhancement: 'letta'  // ⭐ Enhancement utilise LettA par défaut
  }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, HUGGINGFACE_CONFIG, APP_CONFIG, DEEPGRAM_CONFIG };
} else {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.HUGGINGFACE_CONFIG = HUGGINGFACE_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
  window.DEEPGRAM_CONFIG = DEEPGRAM_CONFIG;
}