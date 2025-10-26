class StyloApp {
    constructor() {
    this.isProcessing = false;
        // Deepgram variables
        this.deepgramSocket = null;
        this.audioContext = null;
        this.processor = null;
        this.currentStream = null;
        this.finalText = '';
        
        // Drag and drop variables (handled by Electron at window level)
        this.panel = null;
        
        this.init();
    }

    // Debug functions
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        // Log to console only if debug window is open
        if (this.debugWindow && !this.debugWindow.closed) {
            console.log(message);
            this.debugWindow.document.getElementById('debug-content').textContent += logEntry;
            this.debugWindow.document.getElementById('debug-content').scrollTop = this.debugWindow.document.getElementById('debug-content').scrollHeight;
        }
    }

    showDebugPopup() {
        // Create a new window for debug
        this.debugWindow = window.open('', 'debug-window', 'width=600,height=400,scrollbars=yes,resizable=yes');
        
        this.debugWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>🎤 Voice Debug</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        background: #000;
                        color: #00ff00;
                        margin: 0;
                        padding: 20px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    #debug-content {
                        white-space: pre-wrap;
                        height: 350px;
                        overflow-y: auto;
                        border: 1px solid #00ff00;
                        padding: 10px;
                        background: #001100;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #00ff00;
                        padding-bottom: 10px;
                    }
                    button {
                        background: #ff0000;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    }
                    button:hover {
                        background: #cc0000;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3 style="margin: 0; color: #00ff00;">🎤 Voice Debug Window</h3>
                    <button onclick="window.close()">✕ Fermer</button>
                </div>
                <div id="debug-content"></div>
            </body>
            </html>
        `);
        
        this.debugWindow.document.close();
        this.debugLog('🎤 Debug window opened');
    }

    hideDebugPopup() {
        if (this.debugWindow && !this.debugWindow.closed) {
            this.debugWindow.close();
        }
    }

    clearDebugLog() {
        if (this.debugWindow && !this.debugWindow.closed) {
            this.debugWindow.document.getElementById('debug-content').textContent = '';
        }
    }

    init() {
    console.log('🚀 Stylo App initializing...');
    this.panel = document.querySelector('.floating-panel');
    // Position handled by Electron window; no front-end positioning
    this.setupEventListeners();
    this.setupDebugListeners();
    // Drag handled natively by Electron; no front-end drag listeners
  }

  setupDebugListeners() {
    // Show debug window on long press (2 seconds) on voice button
    const voiceButton = document.querySelector('[data-action="voice"]');
    if (voiceButton) {
      let longPressTimer = null;
      
      voiceButton.addEventListener('mousedown', () => {
        longPressTimer = setTimeout(() => {
          this.showDebugPopup();
          this.clearDebugLog();
        }, 2000); // 2 seconds
      });
      
      voiceButton.addEventListener('mouseup', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });
      
      voiceButton.addEventListener('mouseleave', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });
    }
  }

  // Dragging is native; no front-end drag code

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
            console.log('🎤 Voice button clicked - calling handleVoiceProcessing');
            this.handleVoiceProcessing();
            break;
        }
      }
    });

    // Test: Add a simple click listener directly to voice button
    const voiceButton = document.querySelector('[data-action="voice"]');
    if (voiceButton) {
      voiceButton.addEventListener('click', (e) => {
        console.log('🎤 Direct voice button click detected!');
        e.preventDefault();
        e.stopPropagation();
        this.handleVoiceProcessing();
      });
    } else {
      console.error('❌ Voice button not found!');
    }
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
      
        // 2. Call Supabase Edge Function (provider choisi dans config)
        let enhancedText;
        try {
          enhancedText = await this.callAI(copiedText, 'enhance-prompt');
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
      
      console.log('🤖 Step 3: Calling Supabase rephrase-text (provider choisi dans config)...');
      let rephrasedText;
      try {
        rephrasedText = await this.callAI(copiedText, 'rephrase-text');
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
      
      console.log('🤖 Step 3: Calling Supabase translate-text (provider choisi dans config)...');
      let translatedText;
      try {
        translatedText = await this.callAI(copiedText, 'translate-text');
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
    this.debugLog('🎤 Voice button clicked!');
    
    if (this.isProcessing) {
      // If already recording, stop it
      this.debugLog('⏹️ Stopping voice recording...');
      this.stopVoiceRecording();
      return;
    }

    this.debugLog('🎤 Starting voice processing...');
    
    try {
      this.isProcessing = true;
      
      // Show recording state immediately
      this.updateVoiceButtonIcon('stop');
      
      // SAME LOGIC AS OTHER BUTTONS: Select input at the beginning
      this.debugLog('🎯 Step 1: Reactivating frontmost app...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);
      
      this.debugLog('📋 Step 2: Selecting text in input (like other buttons)...');
      await window.electronAPI.copySelectedText();
      await this.sleep(100);
      
      // Start voice workflow
      await this.startVoiceWorkflow();
      
    } catch (error) {
      this.debugLog(`❌ Error in voice processing: ${error.message}`);
      this.updateVoiceButtonIcon('microphone');
      this.isProcessing = false;
    }
  }

  async startBrowserSpeechRecognition() {
    return new Promise((resolve, reject) => {
      console.log('🔍 Checking speech recognition support...');
      
      // Check if we're on HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        const error = 'Speech recognition requires HTTPS. Please use https:// or localhost';
        console.error('❌', error);
        reject(new Error(error));
        return;
      }
      
      // Check for speech recognition support
      if (!('webkitSpeechRecognition' in window)) {
        const error = 'Speech recognition not supported in this browser. Try Chrome or Edge.';
        console.error('❌', error);
        reject(new Error(error));
        return;
      }

      console.log('✅ Speech recognition supported, starting...');
      
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR'; // Change to 'en-US' if needed

      // Store reference for stopping
      window.currentRecognition = recognition;

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Speech recognized:', transcript);
        
        try {
          // Call enhance function
          const enhancedText = await this.callEnhanceAPI(transcript);
          
          // Paste to last input field
          await this.pasteToLastInput(enhancedText);
          
          console.log('✅ Voice processing completed successfully');
        } catch (error) {
          console.error('❌ Error processing speech:', error);
        } finally {
          // Reset icon
          this.updateVoiceButtonIcon('microphone');
          this.isProcessing = false;
          resolve();
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        this.updateVoiceButtonIcon('microphone');
        this.isProcessing = false;
        
        let errorMessage = 'Speech recognition error';
        switch(event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        console.log('🔚 Speech recognition ended');
        this.updateVoiceButtonIcon('microphone');
        this.isProcessing = false;
        resolve();
      };

      try {
        recognition.start();
        console.log('🚀 Speech recognition start() called');
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error);
        this.updateVoiceButtonIcon('microphone');
        this.isProcessing = false;
        reject(error);
      }
    });
  }

  updateVoiceButtonIcon(type) {
    const voiceButton = document.querySelector('[data-action="voice"]');
    const icon = voiceButton.querySelector('.button-icon');
    
    if (type === 'stop') {
      // Smooth transition to stop icon
      icon.style.transition = 'all 0.3s ease';
      icon.src = 'icone/stop-icon.svg';
      voiceButton.classList.add('recording');
    } else {
      // Smooth transition back to microphone
      icon.style.transition = 'all 0.3s ease';
      icon.src = 'icone/microphone-02.svg';
      voiceButton.classList.remove('recording');
    }
  }

  async pasteToLastInput(text) {
    try {
      // Find the last input/textarea on the page
      const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
      const lastInput = inputs[inputs.length - 1];
      
      if (lastInput) {
        // Focus and paste
        lastInput.focus();
        lastInput.value = text;
        lastInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Text pasted to input field');
      } else {
        // Fallback to clipboard
        await window.electronAPI.setClipboardText(text);
        console.log('✅ Text copied to clipboard (no input found)');
      }
    } catch (error) {
      console.error('❌ Error pasting text:', error);
      // Fallback to clipboard
      await window.electronAPI.setClipboardText(text);
    }
  }

  async stopVoiceRecording() {
    // This will be called when user clicks stop button
    this.debugLog('⏹️ User clicked stop - finishing workflow...');
    
    // Stop Deepgram recording FIRST
    this.stopDeepgramRecording();
    
    // Reset state and icon IMMEDIATELY
    this.isProcessing = false;
    this.updateVoiceButtonIcon('microphone');
    this.debugLog('🔄 State reset to microphone');
    
    // SAME LOGIC AS FIRST CLICK: Select input again
    this.debugLog('🎯 Step 1: Reactivating frontmost app (like first click)...');
    await window.electronAPI.reactivateFrontmostApp();
    await this.sleep(500);
    
    this.debugLog('📋 Step 2: Selecting text in input (like first click)...');
    await window.electronAPI.copySelectedText();
    await this.sleep(100);
    
    // Debug: Check what we have AFTER stopping
    this.debugLog(`🔍 Final text content: "${this.finalText}"`);
    this.debugLog(`🔍 Final text length: ${this.finalText ? this.finalText.length : 0}`);
    
    // Process the final text
    const trimmedText = this.finalText ? this.finalText.trim() : '';
    this.debugLog(`🔍 Trimmed text: "${trimmedText}"`);
    this.debugLog(`🔍 Trimmed length: ${trimmedText.length}`);
    
    // More robust check
    const hasText = trimmedText && trimmedText.length > 0 && trimmedText !== '';
    this.debugLog(`🔍 Has text: ${hasText}`);
    
    if (hasText) {
      this.debugLog(`📝 Processing final text: ${trimmedText}`);
      this.processFinalText(trimmedText);
    } else {
      this.debugLog('⚠️ No text to process');
    }
  }

  // Simple Voice Workflow - Just start listening
  async startVoiceWorkflow() {
    try {
      this.debugLog('🎙️ Starting voice workflow...');
      
      // Reset final text
      this.finalText = '';
      
      // Get Deepgram API key and language from config
      const deepgramKey = window.DEEPGRAM_CONFIG.apiKey;
      const language = window.DEEPGRAM_CONFIG.language;
      
      // Store for potential reconnection
      this.deepgramApiKey = deepgramKey;
      this.deepgramLanguage = language;
      
      this.debugLog(`🔑 Using Deepgram key: ${deepgramKey.substring(0, 20)}...`);
      this.debugLog(`🌍 Language: ${language}`);
      
      // Start Deepgram listening and wait for connection
      await this.startDeepgramListening(deepgramKey, language);
      this.debugLog('✅ Deepgram is ready and listening');
      
    } catch (error) {
      this.debugLog(`❌ Error in voice workflow: ${error.message}`);
      this.updateVoiceButtonIcon('microphone');
      this.isProcessing = false;
    }
  }

  // Process final text when user clicks stop
  async processFinalText(text) {
    try {
      this.debugLog('🤖 Enhancing prompt...');
      
      // Show loading state like other buttons
      this.showLoading(true, 'voice');
      
      // Enhance the prompt
      const enhancedText = await this.enhancePrompt(text);
      
      this.debugLog(`✨ Enhanced text: ${enhancedText}`);
      
      // Input is already selected in stopVoiceRecording, just paste
      this.debugLog('📋 Step 3: Copying enhanced text to clipboard...');
      await window.electronAPI.setClipboardText(enhancedText);
      await this.sleep(100);
      
      this.debugLog('📋 Step 4: Pasting text (Cmd+A + Cmd+V)...');
      await window.electronAPI.pasteText(enhancedText);
      await this.sleep(300);
      
      this.debugLog('✅ SUCCESS! Text enhanced and pasted to input');
      
    } catch (error) {
      this.debugLog(`❌ Error processing text: ${error.message}`);
      // Fallback: copy original text to clipboard
      await this.copyToClipboard(text);
    } finally {
      this.showLoading(false, 'voice');
    }
  }

  // Reactivate app and paste (same logic as other buttons)
  async reactivateAndPaste(text) {
    try {
      // SAME LOGIC AS OTHER BUTTONS: Step 5, 6, 7
      this.debugLog('🎯 Step 5: Reactivating app before paste...');
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      
      this.debugLog('📋 Step 6: Replacing text (Cmd+A + Cmd+V)...');
      await window.electronAPI.setClipboardText(text);
      await this.sleep(100);
      
      await window.electronAPI.pasteText(text);
      await this.sleep(300);
      
      this.debugLog('✅ SUCCESS! Text pasted successfully');
      
    } catch (error) {
      this.debugLog(`❌ Erreur reactivation: ${error.message}`);
      // Fallback: copy to clipboard
      await this.copyToClipboard(text);
    }
  }

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        console.log('✅ Text copied to clipboard');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        console.log('✅ Text copied to clipboard (fallback)');
      }
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
    }
  }

  async startDeepgramListening(apiKey, language) {
    return new Promise(async (resolve, reject) => {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        this.debugLog('✅ Microphone access granted');
        
        // Initialize Deepgram connection with optimized parameters for long sessions
        const deepgramUrl = `wss://api.deepgram.com/v1/listen?` +
          `model=${window.DEEPGRAM_CONFIG.model}&` +
          `smart_format=${window.DEEPGRAM_CONFIG.smartFormat}&` +
          `punctuate=${window.DEEPGRAM_CONFIG.punctuate}&` +
          `diarize=${window.DEEPGRAM_CONFIG.diarize}&` +
          `language=${window.DEEPGRAM_CONFIG.language}&` +
          `encoding=${window.DEEPGRAM_CONFIG.encoding}&` +
          `sample_rate=${window.DEEPGRAM_CONFIG.sampleRate}&` +
          `interim_results=${window.DEEPGRAM_CONFIG.interimResults}&` +
          `endpointing=${window.DEEPGRAM_CONFIG.endpointing}&` +
          `vad_events=${window.DEEPGRAM_CONFIG.vadEvents}&` +
          `utterance_end_ms=${window.DEEPGRAM_CONFIG.utteranceEndMs}&` +
          `numerals=${window.DEEPGRAM_CONFIG.numerals}&` +
          `profanity_filter=${window.DEEPGRAM_CONFIG.profanityFilter}`;
        
        this.debugLog(`🔗 Connecting to: ${deepgramUrl.substring(0, 50)}...`);
        
        this.deepgramSocket = new WebSocket(deepgramUrl, ['token', apiKey]);
        
        this.deepgramSocket.onopen = function() {
          this.debugLog('🔗 Deepgram WebSocket connection established');
          
          // Initialize session tracking for long sessions
          this.sessionStartTime = Date.now();
          this.lastActivityTime = Date.now();
          this.keepAliveInterval = null;
          
          // Start keep-alive for long sessions
          this.startKeepAlive();
          
          resolve(); // Resolve the promise when connection is ready
        }.bind(this);
        
        this.deepgramSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.debugLog(`📨 Deepgram response: ${JSON.stringify(data).substring(0, 100)}...`);
            
            // Update activity tracking for long sessions
            this.lastActivityTime = Date.now();
            
            // Handle different message types
            if (data.type === 'Results') {
              if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
                const transcript = data.channel.alternatives[0].transcript;
                if (transcript && transcript.trim()) {
                  if (data.is_final) {
                    // Final transcript - add to finalText
                    this.finalText = (this.finalText || '') + transcript + ' ';
                    this.debugLog(`📝 Final: "${transcript}"`);
                    this.debugLog(`📝 Total: "${this.finalText}"`);
                  } else {
                    // Interim transcript - just log for debugging
                    this.debugLog(`📝 Interim: "${transcript}"`);
                  }
                }
              }
            } else if (data.type === 'Metadata') {
              this.debugLog(`📊 Metadata: ${JSON.stringify(data)}`);
            } else if (data.type === 'UtteranceEnd') {
              this.debugLog(`🔚 Utterance ended`);
            }
          } catch (error) {
            this.debugLog(`❌ Error parsing Deepgram message: ${error.message}`);
          }
        };
        
        this.deepgramSocket.onerror = (error) => {
          this.debugLog(`❌ Deepgram WebSocket error: ${error}`);
          this.handleConnectionError(error);
          reject(error);
        };
        
        this.deepgramSocket.onclose = function(event) {
          this.debugLog(`🔌 Deepgram WebSocket closed: ${event.code} - ${event.reason}`);
          this.stopKeepAlive();
          
          // Auto-reconnect if still processing and not a clean close
          if (this.isProcessing && event.code !== 1000) {
            this.debugLog('🔄 Attempting to reconnect...');
            setTimeout(() => this.reconnectDeepgram(), window.APP_CONFIG.voiceSession.reconnectDelay);
          }
        }.bind(this);
        
        // Start audio streaming with proper configuration
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(stream);
        
        // Use smaller buffer size for lower latency
        this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
        
        this.processor.onaudioprocess = (event) => {
          if (this.deepgramSocket && this.deepgramSocket.readyState === WebSocket.OPEN) {
            const audioData = event.inputBuffer.getChannelData(0);
            const pcmData = this.convertFloat32ToPCM16(audioData);
            
            // Send audio data immediately to Deepgram
            try {
              this.deepgramSocket.send(pcmData);
            } catch (error) {
              this.debugLog(`❌ Error sending audio to Deepgram: ${error.message}`);
            }
          }
        };
        
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        
        this.debugLog('🎵 Deepgram audio streaming started');
        
        // Store stream for cleanup
        this.currentStream = stream;
        
      } catch (error) {
        this.debugLog(`❌ Error starting Deepgram: ${error.message}`);
        reject(error);
      }
    });
  }


  convertFloat32ToPCM16(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }


  async enhancePrompt(text) {
    try {
      console.log('🤖 Enhancing prompt...');
      
      // Use the same callAI system as other buttons
      const enhancedText = await this.callAI(text, 'enhance-prompt');
      
      console.log('✅ Prompt enhanced successfully');
      return enhancedText;
      
    } catch (error) {
      console.error('❌ Error enhancing prompt:', error);
      // Fallback to original text
      return text;
    }
  }

  stopDeepgramRecording() {
    this.debugLog('⏹️ Stopping Deepgram recording...');
    
    // Stop audio streaming first
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    
    // Close WebSocket connection properly
    if (this.deepgramSocket) {
      if (this.deepgramSocket.readyState === WebSocket.OPEN) {
        this.deepgramSocket.close(1000, 'Recording stopped by user');
      }
      this.deepgramSocket = null;
    }
    
    this.debugLog('✅ Deepgram recording stopped and cleaned up');
    
    // Stop keep-alive
    this.stopKeepAlive();
    
    // DON'T reset finalText here - we need it for processing!
    // DON'T update icon here - it's handled in stopVoiceRecording()
  }

  // NEW: Keep-alive for long sessions
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivityTime;
      const sessionDuration = now - this.sessionStartTime;
      
      // Send ping if no activity for 30 seconds
      if (timeSinceLastActivity > 30000) {
        this.debugLog('🏓 Sending keep-alive ping...');
        if (this.deepgramSocket && this.deepgramSocket.readyState === WebSocket.OPEN) {
          this.deepgramSocket.send(JSON.stringify({ type: 'ping' }));
        }
      }
      
      // Warn if session is very long (>5 minutes)
      if (sessionDuration > 300000) { // 5 minutes
        this.debugLog(`⚠️ Long session detected: ${Math.round(sessionDuration / 1000)}s`);
      }
      
      // Auto-stop if session exceeds maximum duration
      if (sessionDuration > window.APP_CONFIG.voiceSession.maxDuration) {
        this.debugLog('⏰ Maximum session duration reached, stopping...');
        this.stopVoiceRecording();
      }
      
    }, window.APP_CONFIG.voiceSession.keepAliveInterval);
  }

  // NEW: Stop keep-alive
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  // NEW: Handle connection errors
  handleConnectionError(error) {
    this.debugLog(`❌ Connection error: ${error.message || error}`);
    // Could implement retry logic here
  }

  // NEW: Auto-reconnect functionality
  async reconnectDeepgram() {
    try {
      this.debugLog('🔄 Reconnecting to Deepgram...');
      
      // Store current API key and language
      this.deepgramApiKey = this.deepgramApiKey || 'af9416509c6bf8b512b3fdced8233395fbd3e52b';
      this.deepgramLanguage = this.deepgramLanguage || 'en';
      
      // Reconnect
      await this.startDeepgramListening(this.deepgramApiKey, this.deepgramLanguage);
      this.debugLog('✅ Reconnection successful');
      
    } catch (error) {
      this.debugLog(`❌ Reconnection failed: ${error.message}`);
      // Could implement exponential backoff here
    }
  }



  async callEnhanceAPI(text) {
    const enhanceUrl = 'https://vkyfdunlbpzwxryqoype.supabase.co/functions/v1/enhance-promptv2';
    const anonKey = window.SUPABASE_CONFIG.anonKey;
    
    const response = await fetch(enhanceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        input: text,
        text: text, // Send both for compatibility
        mode: 'voice',
        profile: {
          role: 'user',
          audience: 'general',
          tone: 'professional',
          language: 'auto',
          constraints: []
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.enhanced || data.output || data.result || data.enhanced_text;
  }


    // ========== HELPER POUR CHOISIR LE PROVIDER ==========
    
    // FONCTION UNIQUE pour tous les boutons - utilise le provider par défaut
    async callAI(text, action) {
      const provider = window.APP_CONFIG.providers.default;
      console.log(`🎯 Using provider: ${provider} for ${action}`);
      
      if (provider === 'openrouter') {
        return await this.callSupabaseOpenRouter(text, action);
      } else {
        return await this.callSupabaseOpenAI(text, action);
      }
    }
    
    // Fonctions OpenRouter pour chaque action
    async callSupabaseOpenRouter(text, action) {
      let functionUrl;
      switch(action) {
        case 'enhance-prompt':
          functionUrl = window.SUPABASE_CONFIG.functions.enhancePrompt;
          break;
        case 'rephrase-text':
          functionUrl = window.SUPABASE_CONFIG.functions.rephraseText;
          break;
        case 'translate-text':
          functionUrl = window.SUPABASE_CONFIG.functions.translateText;
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      console.log(`🤖 Calling Supabase ${functionUrl} (OpenRouter Llama 3.3)...`);
      
      const response = await fetch(`${window.SUPABASE_CONFIG.url}${functionUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.enhanced_text || data.result || data.rephrased_text || data.translated_text;
    }
    
    // Fonctions OpenAI pour chaque action
    async callSupabaseOpenAI(text, action) {
      let functionUrl;
      switch(action) {
        case 'enhance-prompt':
          functionUrl = window.SUPABASE_CONFIG.functions.enhancePromptOpenAI;
          break;
        case 'rephrase-text':
          functionUrl = window.SUPABASE_CONFIG.functions.rephraseTextOpenAI;
          break;
        case 'translate-text':
          functionUrl = window.SUPABASE_CONFIG.functions.translateTextOpenAI;
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      console.log(`🤖 Calling Supabase ${functionUrl} (OpenAI GPT-4o-mini)...`);
      
      const response = await fetch(`${window.SUPABASE_CONFIG.url}${functionUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.enhanced_text || data.result || data.rephrased_text || data.translated_text;
    }

  // ========== FONCTIONS OPENROUTER (PAR DÉFAUT) ==========
  
  // Fonction pour appeler Supabase enhance-prompt-openrouter (Llama 3.3)
  async callSupabaseEnhancePromptOpenRouter(text) {
    try {
      console.log('🤖 Calling Supabase enhance-prompt-openrouter (Llama 3.3)...');
      
      const url = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.enhancePrompt}`;
      
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
      console.log('🚀 OpenRouter enhance response:', data);
      return data.enhanced_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase OpenRouter:', error);
      throw error;
    }
  }

  // Fonction pour appeler Supabase rephrase-text-openrouter (Llama 3.3)
  async callSupabaseRephraseTextOpenRouter(text) {
    try {
      console.log('🤖 Calling Supabase rephrase-text-openrouter (Llama 3.3)...');
      
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
      console.log('🚀 OpenRouter rephrase response:', data);
      return data.rephrased_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase OpenRouter:', error);
      throw error;
    }
  }

  // ========== FONCTIONS OPENAI (FALLBACK) ==========
  
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

  // Fonction pour appeler Supabase translate-text (OpenAI)
  async callSupabaseTranslateTextOld(text) {
    try {
      console.log('🤖 Calling Supabase translate-text (OpenAI)...');
      
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

  // Fonction pour appeler Supabase translate-text-openrouter (Llama 3.3 - Plus rapide!)
  async callSupabaseTranslateTextOpenRouter(text) {
    try {
      console.log('🤖 Calling Supabase translate-text-openrouter (Llama 3.3)...');
      
      const url = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.translateTextOpenRouter}`;
      
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
      console.log('🚀 OpenRouter response:', data);
      return data.translated_text || data.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      console.error('❌ Error calling Supabase OpenRouter:', error);
      throw error;
    }
  }
}

// Initialiser l'app quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  new StyloApp();
});

console.log('✅ Script.js loaded');
