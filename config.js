// Configuration pour Stylo - Interface flottante macOS avec IA
// Remplacez ces valeurs par vos vraies clés Supabase

export const SUPABASE_CONFIG = {
  // URL de votre projet Supabase
  url: 'https://vkyfdunlbpzwxryqoype.supabase.co',
  
  // Clé anonyme de votre projet Supabase
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530',
  
  // Noms des fonctions Edge
  functions: {
    enhancePrompt: 'enhance-prompt',
    rephraseText: 'rephrase-text',
    translateText: 'translate-text',
    voiceProcessing: 'voice-processing'
  }
};

// Configuration OpenAI (optionnel, pour tests directs)
export const OPENAI_CONFIG = {
  // Ne pas exposer la clé API côté client !
  // Utiliser uniquement via Supabase Edge Functions
  apiKey: 'YOUR_OPENAI_API_KEY' // À ne jamais commiter !
};

// Messages de notification pour Stylo
export const NOTIFICATION_MESSAGES = {
  NO_TEXT_DETECTED: 'No text input detected',
  NO_TEXT_TO_ENHANCE: 'No text to enhance',
  ENHANCING_PROMPT: 'Enhancing prompt...',
  PROMPT_ENHANCED_SUCCESS: 'Prompt enhanced successfully!',
  REPHRASING_TEXT: 'Rephrasing text...',
  TEXT_REPHRASED_SUCCESS: 'Text rephrased successfully!',
  TRANSLATING_TEXT: 'Translating text...',
  TEXT_TRANSLATED_SUCCESS: 'Text translated successfully!',
  PROCESSING_VOICE: 'Processing voice input...',
  VOICE_PROCESSED_SUCCESS: 'Voice processed successfully!',
  ERROR_ENHANCING: 'Error enhancing prompt',
  ERROR_REPHRASING: 'Error rephrasing text',
  ERROR_TRANSLATING: 'Error translating text',
  ERROR_VOICE: 'Error processing voice',
  CONNECTING_TO_API: 'Connecting to API...',
  API_ERROR: 'API connection failed'
};

// Configuration des types d'éléments de saisie supportés
export const SUPPORTED_INPUT_TYPES = [
  'input[type="text"]',
  'input[type="search"]',
  'input[type="email"]',
  'input[type="url"]',
  'textarea',
  '[contenteditable="true"]'
];

// Configuration des modèles OpenAI supportés
export const SUPPORTED_MODELS = {
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    maxTokens: 1000,
    cost: 'low'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    maxTokens: 2000,
    cost: 'high'
  }
};
