class StyloApp {
    constructor() {
    this.isProcessing = false;
    this.currentAction = null;
    this.panelTimeout = null;
        this.init();
    }

    init() {
    console.log('🚀 Stylo App initializing...');
    this.setupEventListeners();
    this.setupPanelListeners();
  }

  setupEventListeners() {
    // IMPORTANT: Mémoriser l'app frontmost au survol du bouton (avant le clic)
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', async () => {
        if (window.electronAPI && window.electronAPI.rememberFrontmostApp) {
          try {
            await window.electronAPI.rememberFrontmostApp();
            console.log('📱 Frontmost app remembered on hover');
          } catch (error) {
            console.error('⚠️ Error remembering frontmost app:', error);
          }
        }
      });
    });

    // Écouter les clics sur les boutons
    document.addEventListener('click', async (e) => {
      if (!e || !e.target) return;
      const button = e.target.closest('.action-button');
      if (button) {
        const action = button.dataset.action;

        console.log(`🎯 Button clicked: ${action}`);

        // Juste ouvrir le panneau avec les filtres, ne pas exécuter l'action
        this.showPanel(action);
      }
    });
  }

  // Exécuter l'action après que l'utilisateur a configuré les filtres
  executeAction(action) {
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

  // === GESTION DU PANNEAU CONTEXTUEL ===

  setupPanelListeners() {
    // Bouton de fermeture
    const closeBtn = document.getElementById('panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hidePanel();
      });
    }

    // Bouton réessayer
    const retryBtn = document.getElementById('retry-button');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (this.currentAction) {
          this.retryAction(this.currentAction);
        }
      });
    }

    // Bouton lancer
    const launchBtn = document.getElementById('launch-button');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        if (this.currentAction) {
          console.log('🚀 Launching action:', this.currentAction);
          this.executeAction(this.currentAction);
        }
      });
    }

    // NOTE: attachFilterListeners() est maintenant appelé dans showPanel()
    // après que les filtres soient affichés
  }

  attachFilterListeners() {
    // Utiliser la délégation d'événements sur le panneau entier
    const panel = document.getElementById('context-panel');
    if (!panel) {
      console.error('❌ Panel not found for attaching listeners');
      return;
    }

    // Retirer l'ancien listener s'il existe
    if (this.filterClickHandler) {
      panel.removeEventListener('click', this.filterClickHandler, true);
      panel.removeEventListener('mousedown', this.filterClickHandler, true);
    }

    // Créer et attacher le nouveau handler
    this.filterClickHandler = (e) => {
      // Trouver le bouton de filtre le plus proche
      const filterOption = e.target.closest('.filter-option');

      if (filterOption && !filterOption.disabled) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('🎯 Click détecté sur filtre:', filterOption.dataset.value);

        const filterGroup = filterOption.closest('.filter-options');
        if (filterGroup) {
          console.log('📦 Groupe trouvé, mise à jour...');

          // Retirer selected de tous les boutons du groupe
          filterGroup.querySelectorAll('.filter-option').forEach(btn => {
            btn.classList.remove('selected');
          });

          // Ajouter selected au bouton cliqué
          filterOption.classList.add('selected');

          const filterName = filterOption.dataset.filter;
          const value = filterOption.dataset.value;
          console.log(`✅ Filtre sélectionné: ${filterName} = ${value}`);

          // Feedback visuel
          filterOption.style.transform = 'scale(0.96)';
          setTimeout(() => {
            filterOption.style.transform = '';
          }, 100);
        }
      }
    };

    // Attacher avec capture ET sur mousedown pour être sûr de capter l'événement
    panel.addEventListener('click', this.filterClickHandler, true);
    panel.addEventListener('mousedown', this.filterClickHandler, true);

    const visibleButtons = panel.querySelectorAll('.filter-option');
    console.log(`✅ Listener attaché - ${visibleButtons.length} boutons de filtre visibles`);
  }

  showPanel(action, title) {
    console.log('🎯 showPanel() called with action:', action);
    const panel = document.getElementById('context-panel');
    const titleText = document.getElementById('filter-title-text');
    const statusDiv = document.getElementById('panel-status');

    console.log('📦 Panel element:', panel);
    if (!panel) {
      console.error('❌ Panel element not found!');
      return;
    }

    // Réinitialiser le panneau
    panel.className = 'filter-modal';
    this.hideError();

    // Configurer le titre
    const config = {
      reformulation: 'Rephrasing',
      improvement: 'Enhancement',
      translation: 'Translation',
      voice: 'Voice Recognition'
    };

    const actionTitle = config[action] || 'Action';
    if (titleText) titleText.textContent = actionTitle;

    // Cacher le statut et le bouton lancer au début
    if (statusDiv) statusDiv.style.display = 'none';
    const launchBtn = document.getElementById('launch-button');
    if (launchBtn) launchBtn.style.display = 'flex';

    // Afficher les options IMMÉDIATEMENT selon l'action
    this.showOptions(action);

    // Afficher le panneau
    console.log('🎨 Before adding show class:', panel.classList.toString());
    panel.classList.add('show');
    console.log('🎨 After adding show class:', panel.classList.toString());
    
    // IMPORTANT: Attacher les listeners APRÈS avoir affiché les filtres
    setTimeout(() => {
      this.attachFilterListeners();
    }, 50);
    
    // Redimensionner la fenêtre pour afficher le panneau
    if (window.electronAPI && window.electronAPI.resizeWindow) {
      window.electronAPI.resizeWindow(200, 330); // Hauteur réduite pour style minimaliste
      console.log('🖼️  Window resized to show panel');
    }
    
    this.currentAction = action;

    console.log('📂 Panel opened:', action);
  }

  hidePanel() {
    const panel = document.getElementById('context-panel');
    if (panel) {
      panel.classList.remove('show', 'success', 'error');
      this.currentAction = null;

      // Redimensionner la fenêtre à la taille originale
      if (window.electronAPI && window.electronAPI.resizeWindow) {
        window.electronAPI.resizeWindow(200, 50); // Retour à la taille toolbar uniquement
        console.log('🖼️  Window resized back to toolbar size');
      }

      // Réinitialiser après l'animation
      setTimeout(() => {
        this.updateProgress(0);
        this.updateStatus('Preparing...');
        this.hideError();
        this.hideOptions();
      }, 300);
    }
  }

  updateStatus(message) {
    const statusMsg = document.getElementById('status-message');
    const statusDiv = document.getElementById('panel-status');

    // Afficher le statut quand on l'utilise
    if (statusDiv) statusDiv.style.display = 'block';

    if (statusMsg) statusMsg.textContent = message;

    console.log('📊', message);
  }

  updateProgress(percent) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
  }

  showError(message) {
    const panel = document.getElementById('context-panel');
    const errorDiv = document.getElementById('panel-error');
    const errorMsg = document.getElementById('error-message');
    const panelIcon = document.querySelector('.panel-icon');

    if (panel) panel.classList.add('error');
    if (errorDiv) errorDiv.style.display = 'block';
    if (errorMsg) errorMsg.textContent = message;
    if (panelIcon) panelIcon.textContent = '⚠️';

    this.updateProgress(100);

    console.error('❌', message);
  }

  hideError() {
    const errorDiv = document.getElementById('panel-error');
    if (errorDiv) errorDiv.style.display = 'none';
  }

  showOptions(action) {
    const optionsDiv = document.getElementById('panel-options');
    const rephraseOptions = document.getElementById('options-rephrase');
    const improvementOptions = document.getElementById('options-improvement');
    const translationOptions = document.getElementById('options-translation');

    // Cacher toutes les options
    if (rephraseOptions) rephraseOptions.style.display = 'none';
    if (improvementOptions) improvementOptions.style.display = 'none';
    if (translationOptions) translationOptions.style.display = 'none';

    // Afficher les options appropriées
    if (action === 'reformulation' && rephraseOptions) {
      rephraseOptions.style.display = 'flex';
      if (optionsDiv) optionsDiv.style.display = 'block';
    } else if (action === 'improvement' && improvementOptions) {
      improvementOptions.style.display = 'flex';
      if (optionsDiv) optionsDiv.style.display = 'block';
    } else if (action === 'translation' && translationOptions) {
      translationOptions.style.display = 'flex';
      if (optionsDiv) optionsDiv.style.display = 'block';
    }
  }

  hideOptions() {
    const optionsDiv = document.getElementById('panel-options');
    if (optionsDiv) optionsDiv.style.display = 'none';
  }

  showSuccess() {
    const panel = document.getElementById('context-panel');
    const panelIcon = document.querySelector('.panel-icon');

    if (panel) panel.classList.add('success');
    if (panelIcon) panelIcon.textContent = '✅';

    this.updateStatus('Successfully completed!');
    this.updateProgress(100);

    // Fermer automatiquement après 1.5s
    if (this.panelTimeout) clearTimeout(this.panelTimeout);
    this.panelTimeout = setTimeout(() => {
      this.hidePanel();
    }, 1500);
  }

  retryAction(action) {
    this.hideError();
    this.updateProgress(0);
    this.updateStatus('Retrying...');

    // Relancer l'action appropriée
    switch (action) {
      case 'reformulation':
        this.handleRephrase();
        break;
      case 'improvement':
        this.handlePromptEnhancement();
        break;
      case 'translation':
        this.handleTranslate();
        break;
    }
  }

  getOptions(action) {
    // Fonction helper pour récupérer la valeur active d'un groupe de filtres
    const getActiveFilterValue = (filterName, defaultValue) => {
      // Trouver tous les boutons qui ont ce filter name
      const filterButtons = document.querySelectorAll(`.filter-option[data-filter="${filterName}"]`);
      for (const btn of filterButtons) {
        if (btn.classList.contains('selected')) {
          return btn.dataset.value;
        }
      }
      return defaultValue;
    };

    if (action === 'reformulation') {
      return {
        type: getActiveFilterValue('rephrase-type', 'professional'),
        tone: getActiveFilterValue('rephrase-tone', 'neutral'),
        length: getActiveFilterValue('rephrase-length', 'same'),
        corrections: getActiveFilterValue('rephrase-corrections', 'all')
      };
    } else if (action === 'improvement') {
      return {
        goal: getActiveFilterValue('prompt-goal', 'informative'),
        audience: getActiveFilterValue('prompt-audience', 'general'),
        detail: getActiveFilterValue('prompt-detail', 'balanced'),
        format: getActiveFilterValue('prompt-format', 'paragraph')
      };
    } else if (action === 'translation') {
      return {
        target: getActiveFilterValue('translate-target', 'en'),
        style: getActiveFilterValue('translate-style', 'standard'),
        context: getActiveFilterValue('translate-context', 'general')
      };
    }
    return {};
  }

  async handlePromptEnhancement() {
    if (this.isProcessing) {
      console.log('⏳ Already processing, ignoring click');
      return;
    }

    // Cacher les options et le bouton lancer, afficher le statut
    this.hideOptions();
    const launchBtn = document.getElementById('launch-button');
    if (launchBtn) launchBtn.style.display = 'none';
    const statusDiv = document.getElementById('panel-status');
    if (statusDiv) statusDiv.style.display = 'block';

    // Commencer l'action
    this.updateStatus('Preparing...');
    this.updateProgress(5);

    this.isProcessing = true;
    this.showLoading(true);

    try {
      console.log('✨ Starting prompt enhancement...');

      // Étape 1: Réactivation
      this.updateStatus('Reactivating application...');
      this.updateProgress(10);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);

      // Étape 2: Copie
      this.updateStatus('Copying selected text...');
      this.updateProgress(20);
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
          this.updateProgress(30);
          break;
        }

        attempts++;
        this.updateProgress(20 + (attempts / maxAttempts) * 10);
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }

      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');

      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('Impossible de copier le texte. Assure-toi que ton curseur est dans un champ texte.');
      }

      // Nettoyer le texte
      copiedText = copiedText.trim();

      // Vérifier si c'est du JSON/HTML (popup d'erreur copiée par erreur)
      if (copiedText.startsWith('{') || copiedText.startsWith('<') || copiedText.includes('Error Message') || copiedText.includes('Raw Response')) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('Le contenu copié semble être une popup d\'erreur. Ferme la popup d\'erreur et réessaye.');
      }

      // Étape 3: Traitement IA
      this.updateStatus('AI processing...');
      this.updateProgress(40);

      // Récupérer les options
      const options = this.getOptions('improvement');
      console.log('⚙️ Options:', options);

      let enhancedText;
      try {
        enhancedText = await this.callAI(copiedText, 'enhance-prompt');
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Erreur lors de l'appel à l'IA: ${error.message}`);
      }

      if (!enhancedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('L\'IA n\'a pas retourné de résultat.');
      }

      console.log('✨ Enhanced text received:', enhancedText.substring(0, 100) + '...');
      this.updateProgress(70);

      // Étape 4: Remplacement
      this.updateStatus('Replacing text...');
      this.updateProgress(80);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      await window.electronAPI.setClipboardText(enhancedText);
      await this.sleep(100);
      await window.electronAPI.pasteText(enhancedText);
      await this.sleep(300);
      await window.electronAPI.setClipboardText(oldClipboard);

      this.updateProgress(100);

      // Succès
      this.showSuccess();
      console.log('✅ SUCCESS! Text enhanced successfully');

    } catch (error) {
      console.error('❌ Error in prompt enhancement:', error);
      this.showError(error.message || 'An unexpected error occurred');
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

    // Cacher les options et le bouton lancer, afficher le statut
    this.hideOptions();
    const launchBtn = document.getElementById('launch-button');
    if (launchBtn) launchBtn.style.display = 'none';
    const statusDiv = document.getElementById('panel-status');
    if (statusDiv) statusDiv.style.display = 'block';

    // Commencer l'action
    this.updateStatus('Preparing...');
    this.updateProgress(5);

    this.isProcessing = true;
    this.showLoading(true, 'reformulation');

    try {
      console.log('✍️ Starting text rephrasing...');

      // Étape 1: Réactivation
      this.updateStatus('Reactivating application...');
      this.updateProgress(10);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);

      // Étape 2: Copie
      this.updateStatus('Copying selected text...');
      this.updateProgress(20);
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
          this.updateProgress(30);
          break;
        }

        attempts++;
        this.updateProgress(20 + (attempts / maxAttempts) * 10);
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }

      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');

      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('Impossible de copier le texte. Assure-toi que ton curseur est dans un champ texte.');
      }

      copiedText = copiedText.trim();

      // Étape 3: Traitement IA
      this.updateStatus('AI processing...');
      this.updateProgress(40);

      // Récupérer les options
      const options = this.getOptions('reformulation');
      console.log('⚙️ Options:', options);

      let rephrasedText;
      try {
        rephrasedText = await this.callAI(copiedText, 'rephrase-text');
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Erreur lors de l'appel à l'IA: ${error.message}`);
      }

      if (!rephrasedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('L\'IA n\'a pas retourné de résultat.');
      }

      console.log('✨ Rephrased text received:', rephrasedText.substring(0, 100) + '...');
      this.updateProgress(70);

      // Étape 4: Remplacement
      this.updateStatus('Replacing text...');
      this.updateProgress(80);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      await window.electronAPI.setClipboardText(rephrasedText);
      await this.sleep(100);
      await window.electronAPI.pasteText(rephrasedText);
      await this.sleep(300);
      await window.electronAPI.setClipboardText(oldClipboard);

      this.updateProgress(100);

      // Succès
      this.showSuccess();
      console.log('✅ SUCCESS! Text rephrased successfully');

    } catch (error) {
      console.error('❌ Error in text rephrasing:', error);
      this.showError(error.message || 'An unexpected error occurred');
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

    // Cacher les options et le bouton lancer, afficher le statut
    this.hideOptions();
    const launchBtn = document.getElementById('launch-button');
    if (launchBtn) launchBtn.style.display = 'none';
    const statusDiv = document.getElementById('panel-status');
    if (statusDiv) statusDiv.style.display = 'block';

    // Commencer l'action
    this.updateStatus('Preparing...');
    this.updateProgress(5);

    this.isProcessing = true;
    this.showLoading(true, 'translation');

    try {
      console.log('🌍 Starting translation...');
      
      // Étape 1: Réactivation
      this.updateStatus('Reactivating application...');
      this.updateProgress(10);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(500);
      
      // Étape 2: Copie
      this.updateStatus('Copying selected text...');
      this.updateProgress(20);
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
          this.updateProgress(30);
          break;
        }
        
        attempts++;
        this.updateProgress(20 + (attempts / maxAttempts) * 10);
        console.log(`⏳ Waiting for text to be copied... (attempt ${attempts}/${maxAttempts})`);
      }
      
      console.log('📄 Copied text:', copiedText?.substring(0, 100) + '...');
      
      if (!copiedText || copiedText === 'STYLO_MARKER_EMPTY' || !copiedText.trim()) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('Impossible de copier le texte. Assure-toi que ton curseur est dans un champ texte.');
      }
      
      copiedText = copiedText.trim();
      
      // Étape 3: Traitement IA
      this.updateStatus('AI translation...');
      this.updateProgress(40);
      
      // Récupérer les options
      const options = this.getOptions('translation');
      console.log('⚙️ Translation options:', options);
      
      let translatedText;
      try {
        translatedText = await this.callAI(copiedText, 'translate-text');
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Erreur lors de l'appel à l'IA: ${error.message}`);
      }
      
      if (!translatedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('L\'IA n\'a pas retourné de résultat.');
      }

      console.log('✨ Translated text received:', translatedText.substring(0, 100) + '...');
      this.updateProgress(70);
      
      // Étape 4: Remplacement
      this.updateStatus('Replacing text...');
      this.updateProgress(80);
      await window.electronAPI.reactivateFrontmostApp();
      await this.sleep(200);
      await window.electronAPI.setClipboardText(translatedText);
      await this.sleep(100);
      await window.electronAPI.pasteText(translatedText);
      await this.sleep(300);
      await window.electronAPI.setClipboardText(oldClipboard);
      
      this.updateProgress(100);
      
      // Succès
      this.showSuccess();
      console.log('✅ SUCCESS! Text translated successfully');
      
    } catch (error) {
      console.error('❌ Error in translation:', error);
      this.showError(error.message || 'An unexpected error occurred');
    } finally {
      this.isProcessing = false;
      this.showLoading(false, 'translation');
    }
  }

  async handleVoiceProcessing() {
    console.log('Fonctionnalité vocale à venir');
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
let styloApp;
document.addEventListener('DOMContentLoaded', () => {
  styloApp = new StyloApp();
});

console.log('✅ Script.js loaded');
