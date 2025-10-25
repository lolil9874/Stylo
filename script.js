class StyloApp {
    constructor() {
    this.isProcessing = false;
        this.init();
    }

    init() {
    console.log('🚀 Stylo App initializing...');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // IMPORTANT: Mémoriser l'app frontmost au survol du bouton (avant le clic)
    document.addEventListener('mouseenter', async (e) => {
      if (e.target.closest('.action-button')) {
        try {
          await window.electronAPI.rememberFrontmostApp();
          console.log('📱 Frontmost app remembered on hover');
        } catch (error) {
          console.error('⚠️ Error remembering frontmost app:', error);
        }
      }
    }, true);

    // Écouter les clics sur les boutons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.action-button')) {
        const button = e.target.closest('.action-button');
        const action = button.dataset.action;
        
        console.log(`🎯 Button clicked: ${action}`);
        
        switch (action) {
          case 'improvement':
            this.handlePromptEnhancement();
            break;
          case 'reformulation':
            this.handleRephrase();
            break;
          case 'translation':
            this.handleTranslate();
            break;
          case 'voice':
            this.handleVoiceProcessing();
            break;
        }
      }
    });
  }

  async handlePromptEnhancement() {
    if (this.isProcessing) {
      console.log('⏳ Already processing, ignoring click');
      return;
    }

    this.isProcessing = true;
    this.showLoading(true);

    try {
      console.log('✨ Starting prompt enhancement...');
      
      // WORKFLOW OPTIMISÉ :
      // 1. Réactiver l'app frontmost (mémorisée au survol)
      // 2. Cmd+A + Cmd+C pour copier le texte
      // 3. Envoyer à Supabase/OpenAI
      // 4. Cmd+A + Cmd+V pour remplacer
      
      console.log('🎯 Step 1: Reactivating frontmost app...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500); // Attendre que l'app reprenne vraiment le focus et que le curseur soit dans la textbox
      
      console.log('📋 Step 2: Copying text (Cmd+A + Cmd+C)...');
      // Sauvegarder le clipboard original
      const oldClipboard = await window.electronAPI.getClipboardText();
      
      // Vider le clipboard pour vérifier que le Cmd+C fonctionne
      await window.electronAPI.setClipboardText('STYLO_MARKER_EMPTY');
      await this.sleep(100);
      
      // Cmd+A + Cmd+C
      await window.electronAPI.copySelectedText();
      
      // ATTENDRE QUE LE TEXTE SOIT VRAIMENT COPIÉ (max 3 secondes)
      let copiedText = '';
      let attempts = 0;
      const maxAttempts = 15; // 15 x 200ms = 3 secondes max
      
      while (attempts < maxAttempts) {
        await this.sleep(200);
        copiedText = await window.electronAPI.getClipboardText();
        
        // Si le clipboard a changé et n'est plus vide
        if (copiedText && copiedText !== 'STYLO_MARKER_EMPTY' && copiedText.trim()) {
          console.log(`✅ Text copied after ${(attempts + 1) * 200}ms`);
          break;
        }
        
        attempts++;
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }
      
      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');
      
      // Vérifier que le texte a bien été copié
      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        console.error('❌ Failed to copy text after', maxAttempts * 200, 'ms');
        await window.electronAPI.showErrorPopup({
          title: 'Échec de la copie',
          errorCode: 'COPY_FAILED',
          errorMessage: `Impossible de copier le texte après ${maxAttempts * 200}ms.\n\nAssure-toi que :\n1. Ton curseur est dans un champ texte\n2. Le champ contient du texte\n3. L'app a le focus\n\nPuis reclique ⭐`,
          raw: { copiedText, attempts, oldClipboard }
        });
        // Restaurer le clipboard
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }
      
      // Nettoyer le texte
      copiedText = copiedText.trim();
      
      // Vérifier si c'est du JSON/HTML (popup d'erreur copiée par erreur)
      if (copiedText.startsWith('{') || copiedText.startsWith('<') || copiedText.includes('Error Message') || copiedText.includes('Raw Response')) {
        console.warn('⚠️ Detected error popup content in clipboard, ignoring');
        await window.electronAPI.showErrorPopup({
          title: 'Contenu invalide',
          errorCode: 'INVALID_CONTENT',
          errorMessage: 'Le contenu copié semble être une popup d\'erreur. Ferme la popup d\'erreur, place ton curseur dans un champ texte, et reclique ⭐',
          raw: { copiedText: copiedText.substring(0, 200) }
        });
        // Restaurer le clipboard
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }
      
      if (!copiedText || !copiedText.trim()) {
        await window.electronAPI.showErrorPopup({
          title: 'Aucun texte trouvé',
          errorCode: 'EMPTY_TEXT',
          errorMessage: 'Le champ de texte est vide ou aucun texte n\'a été sélectionné. Tapez du texte puis reclique ⭐',
          raw: { copiedText }
        });
        // Restaurer le clipboard
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }

      console.log(`📄 Text extracted: ${copiedText.substring(0, 100)}...`);
      
      // 2. Call Supabase Edge Function
      let enhancedText;
      try {
        enhancedText = await this.callSupabaseEnhancePrompt(copiedText);
      } catch (error) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: `Erreur lors de l'appel à Supabase: ${error.message}\n\nVérifie ta configuration dans config.js:\n- SUPABASE_CONFIG.url\n- SUPABASE_CONFIG.anonKey\n- La fonction Edge /enhance-prompt doit être déployée`,
          raw: { text: copiedText, error: error.toString() }
        });
        // Restaurer le clipboard
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }
      
      if (!enhancedText) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: 'La fonction Supabase n\'a pas retourné de résultat. Vérifiez votre configuration.',
          raw: { text: copiedText }
        });
        // Restaurer le clipboard
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }

      console.log('✨ Step 4: Enhanced text received:', enhancedText.substring(0, 100) + '...');
      
      // Réactiver l'app frontmost une dernière fois avant de coller
      console.log('🎯 Step 5: Reactivating app before paste...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      
      // Mettre le texte amélioré dans le clipboard
      console.log('📋 Step 6: Replacing text (Cmd+A + Cmd+V)...');
      await window.electronAPI.setClipboardText(enhancedText);
      await this.sleep(100);
      
      // Cmd+A + Cmd+V pour remplacer
      await window.electronAPI.pasteText(enhancedText);
      await this.sleep(300);
      
      // Restaurer le clipboard original
      await window.electronAPI.setClipboardText(oldClipboard);
      
      console.log('✅ SUCCESS! Text replaced successfully');
      
    } catch (error) {
      console.error('❌ Error in prompt enhancement:', error);
      await window.electronAPI.showErrorPopup({
        title: 'Erreur inattendue',
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: error.message || 'Une erreur inattendue s\'est produite',
        raw: { error: error.toString() }
      });
    } finally {
      this.isProcessing = false;
      this.showLoading(false);
    }
  }

  getErrorTitle(errorCode) {
    const titles = {
      'ACCESSIBILITY_DENIED': 'Permissions d\'accessibilité requises',
      'NO_FOCUSED_ELEMENT': 'Aucun élément focusé',
      'NOT_A_TEXT_ELEMENT': 'Élément non supporté',
      'SECURE_FIELD': 'Champ sécurisé',
      'AX_WRITE_DENIED': 'Écriture AX refusée',
      'SUPABASE_ERROR': 'Erreur Supabase',
      'UNEXPECTED_ERROR': 'Erreur inattendue'
    };
    return titles[errorCode] || 'Erreur';
  }

  async callSupabaseEnhancePrompt(text) {
    try {
      console.log('🤖 Calling Supabase enhance-prompt...');
      
      const url = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.enhancePrompt}`;
      
      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), window.APP_CONFIG.networkTimeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      // La fonction Supabase retourne "enhanced_text" pas "result"
      return data.enhanced_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase:', error);
      throw error;
    }
  }

  showLoading(show, action = 'improvement') {
    const button = document.querySelector(`[data-action="${action}"]`);
    if (!button) return;
    
    // Map des icônes pour chaque action
    const icons = {
      'improvement': 'icone/star-06.svg',
      'reformulation': 'icone/pen-tool-plus.svg',
      'translation': 'icone/translate-01.svg',
      'voice': 'icone/microphone-02.svg'
    };
    
    if (show) {
      button.classList.add('loading');
      button.innerHTML = '<div class="spinner"></div>';
    } else {
      button.classList.remove('loading');
      const iconPath = icons[action] || icons['improvement'];
      button.innerHTML = `<img src="${iconPath}" class="button-icon" alt="${action}">`;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // REPHRASE: Reformuler et corriger le texte
  async handleRephrase() {
    if (this.isProcessing) {
      console.log('⏳ Already processing, ignoring click');
      return;
    }

    this.isProcessing = true;
    this.showLoading(true, 'reformulation');

    try {
      console.log('✍️ Starting text rephrasing...');
      
      // Même workflow que handlePromptEnhancement
      console.log('🎯 Step 1: Reactivating frontmost app...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);
      
      console.log('📋 Step 2: Copying text (Cmd+A + Cmd+C)...');
      const oldClipboard = await window.electronAPI.getClipboardText();
      await window.electronAPI.setClipboardText('STYLO_MARKER_EMPTY');
      await this.sleep(100);
      
      await window.electronAPI.copySelectedText();
      
      let copiedText = '';
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        await this.sleep(200);
        copiedText = await window.electronAPI.getClipboardText();
        
        if (copiedText && copiedText !== 'STYLO_MARKER_EMPTY' && copiedText.trim()) {
          console.log(`✅ Text copied after ${(attempts + 1) * 200}ms`);
          break;
        }
        
        attempts++;
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }
      
      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');
      
      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        await window.electronAPI.showErrorPopup({
          title: 'Échec de la copie',
          errorCode: 'COPY_FAILED',
          errorMessage: 'Impossible de copier le texte. Place ton curseur dans un champ texte et reclique ✍️',
          raw: { copiedText, attempts }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
                return;
            }

      copiedText = copiedText.trim();
      
      console.log('🤖 Step 3: Calling Supabase rephrase-text...');
      let rephrasedText;
      try {
        rephrasedText = await this.callSupabaseRephraseText(copiedText);
      } catch (error) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: `Erreur lors de l'appel à Supabase: ${error.message}`,
          raw: { text: copiedText, error: error.toString() }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
                return;
            }

      if (!rephrasedText) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: 'La fonction Supabase n\'a pas retourné de résultat.',
          raw: { text: copiedText }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }

      console.log('✨ Step 4: Rephrased text received:', rephrasedText.substring(0, 100) + '...');
      
      console.log('🎯 Step 5: Reactivating app before paste...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      
      console.log('📋 Step 6: Replacing text (Cmd+A + Cmd+V)...');
      await window.electronAPI.setClipboardText(rephrasedText);
      await this.sleep(100);
      
      await window.electronAPI.pasteText(rephrasedText);
      await this.sleep(300);
      
      await window.electronAPI.setClipboardText(oldClipboard);
      
      console.log('✅ SUCCESS! Text rephrased successfully');
            
        } catch (error) {
      console.error('❌ Error in text rephrasing:', error);
      await window.electronAPI.showErrorPopup({
        title: 'Erreur inattendue',
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: error.message || 'Une erreur inattendue s\'est produite',
        raw: { error: error.toString() }
      });
    } finally {
      this.isProcessing = false;
      this.showLoading(false, 'reformulation');
    }
  }

  // TRANSLATE: Traduire en anglais
  async handleTranslate() {
    if (this.isProcessing) {
      console.log('⏳ Already processing, ignoring click');
      return;
    }

    this.isProcessing = true;
    this.showLoading(true, 'translation');

    try {
      console.log('🌍 Starting translation...');
      
      console.log('🎯 Step 1: Reactivating frontmost app...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);
      
      console.log('📋 Step 2: Copying text (Cmd+A + Cmd+C)...');
      const oldClipboard = await window.electronAPI.getClipboardText();
      await window.electronAPI.setClipboardText('STYLO_MARKER_EMPTY');
      await this.sleep(100);
      
      await window.electronAPI.copySelectedText();
      
      let copiedText = '';
      let attempts = 0;
      const maxAttempts = 15;
      
      while (attempts < maxAttempts) {
        await this.sleep(200);
        copiedText = await window.electronAPI.getClipboardText();
        
        if (copiedText && copiedText !== 'STYLO_MARKER_EMPTY' && copiedText.trim()) {
          console.log(`✅ Text copied after ${(attempts + 1) * 200}ms`);
          break;
        }
        
        attempts++;
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }
      
      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');
      
      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        await window.electronAPI.showErrorPopup({
          title: 'Échec de la copie',
          errorCode: 'COPY_FAILED',
          errorMessage: 'Impossible de copier le texte. Place ton curseur dans un champ texte et reclique 🌍',
          raw: { copiedText, attempts }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }
      
      copiedText = copiedText.trim();
      
      console.log('🤖 Step 3: Calling Supabase translate-text...');
      let translatedText;
      try {
        translatedText = await this.callSupabaseTranslateText(copiedText);
      } catch (error) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: `Erreur lors de l'appel à Supabase: ${error.message}`,
          raw: { text: copiedText, error: error.toString() }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }
      
      if (!translatedText) {
        await window.electronAPI.showErrorPopup({
          title: 'Erreur Supabase',
          errorCode: 'SUPABASE_ERROR',
          errorMessage: 'La fonction Supabase n\'a pas retourné de résultat.',
          raw: { text: copiedText }
        });
        await window.electronAPI.setClipboardText(oldClipboard);
        return;
      }

      console.log('✨ Step 4: Translated text received:', translatedText.substring(0, 100) + '...');
      
      console.log('🎯 Step 5: Reactivating app before paste...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      
      console.log('📋 Step 6: Replacing text (Cmd+A + Cmd+V)...');
      await window.electronAPI.setClipboardText(translatedText);
      await this.sleep(100);
      
      await window.electronAPI.pasteText(translatedText);
      await this.sleep(300);
      
      await window.electronAPI.setClipboardText(oldClipboard);
      
      console.log('✅ SUCCESS! Text translated successfully');
      
    } catch (error) {
      console.error('❌ Error in translation:', error);
      await window.electronAPI.showErrorPopup({
        title: 'Erreur inattendue',
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: error.message || 'Une erreur inattendue s\'est produite',
        raw: { error: error.toString() }
      });
    } finally {
      this.isProcessing = false;
      this.showLoading(false, 'translation');
    }
  }

  async handleVoiceProcessing() {
    console.log('Fonctionnalité vocale à venir');
  }

  // Fonction pour appeler Supabase rephrase-text
  async callSupabaseRephraseText(text) {
    try {
      console.log('🤖 Calling Supabase rephrase-text...');
      
      const url = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.rephraseText}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), window.APP_CONFIG.networkTimeout);
      
      const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
                },
        body: JSON.stringify({ text }),
        signal: controller.signal
            });

      clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
      return data.rephrased_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase:', error);
            throw error;
        }
    }

  // Fonction pour appeler Supabase translate-text
  async callSupabaseTranslateText(text) {
    try {
      console.log('🤖 Calling Supabase translate-text...');
      
      const url = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.translateText}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), window.APP_CONFIG.networkTimeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.translated_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase:', error);
      throw error;
    }
  }
}

// Initialiser l'app quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new StyloApp();
});

console.log('✅ Script.js loaded');
