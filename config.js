// Configuration Supabase
const SUPABASE_CONFIG = {
  // Configuration Supabase Stylo
  url: 'https://vkyfdunlbpzwxryqoype.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530',
  
  // URLs des fonctions Edge
  functions: {
    enhancePrompt: '/functions/v1/enhance-promptv2',
    rephraseText: '/functions/v1/rephrase-text',
    translateText: '/functions/v1/translate-text',
    voiceProcessing: '/functions/v1/voice-processing'
  }
  // Note: Les fonctions rephrase-text et translate-text sont maintenant déployées !
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
  pasteDelay: 100
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, APP_CONFIG };
} else {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.APP_CONFIG = APP_CONFIG;
}