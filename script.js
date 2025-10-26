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
    this.setupPanelListeners(); // 🔧 FIX: Appeler setupPanelListeners pour activer le bouton Launch
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
    // 🚀 SYSTÈME SIMPLE ET ROBUSTE
    let hoverTimer = null;
    let closeTimer = null;
    let isMenuOpen = false;
    let currentAction = null;
    let clickCooldownUntil = 0; // Prevent hover-open right after a click
    let suppressHover = false;   // Block hover-open until mouse leaves after a click
    
    // État global partagé pour les changements instantanés
    window.styloAppState = { isMenuOpen: false, currentAction: null };

    // Fonction pour nettoyer tous les timers
    const clearAllTimers = () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    // Fonction pour ouvrir le menu avec transition smooth
    const openMenu = (action) => {
      // Ne jamais ouvrir le menu pendant un traitement en cours
      if (this.isProcessing) {
        console.log('🚫 Skip openMenu: processing in progress');
        return;
      }
      // Suppress hover-open right after a click
      if (Date.now() < clickCooldownUntil) {
        return;
      }
      clearAllTimers();
      console.log(`📂 Opening menu for: ${action}`);
      
      // Si c'est le même menu, ne rien faire
      if (isMenuOpen && currentAction === action) {
        console.log(`🔄 Same menu already open: ${action}`);
        return;
      }
      
      // Ouvrir le menu
      this.showPanel(action);
      isMenuOpen = true;
      currentAction = action;
      window.styloAppState.isMenuOpen = true;
      window.styloAppState.currentAction = action;
      
      console.log(`✅ Menu opened for: ${action}, isMenuOpen: ${isMenuOpen}`);
    };

    // Fonction pour fermer le menu
    const closeMenu = () => {
      clearAllTimers();
      console.log('📂 Closing menu');
      this.hidePanel();
      isMenuOpen = false;
      currentAction = null;
      window.styloAppState.isMenuOpen = false;
      window.styloAppState.currentAction = null;
    };

    // Fonction pour programmer la fermeture avec animation smooth
    const scheduleClose = () => {
      clearAllTimers();
      closeTimer = setTimeout(() => {
        console.log('📂 Auto-closing menu after delay');
        // Animation smooth de fermeture
        const panel = document.getElementById('context-panel');
        if (panel && panel.classList.contains('show')) {
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(-20px) scale(0.95)';
          panel.style.maxHeight = '0';
          setTimeout(() => {
            closeMenu();
          }, 200);
        } else {
          closeMenu();
        }
      }, 250);
    };

    // Boutons d'action
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(button => {
      const action = button.dataset.action;

      // Survol d'un bouton
      button.addEventListener('mouseenter', async () => {
        console.log(`🖱️ Mouse entered: ${action}, isMenuOpen: ${isMenuOpen}, currentAction: ${currentAction}`);
        // Ne pas réagir pendant un traitement
        if (this.isProcessing) {
          console.log('🚫 Hover ignored: processing in progress');
          return;
        }

        // Mémoriser l'app frontmost
        if (window.electronAPI && window.electronAPI.rememberFrontmostApp) {
          try {
            await window.electronAPI.rememberFrontmostApp();
            console.log('📱 Frontmost app remembered');
          } catch (error) {
            console.error('⚠️ Error remembering frontmost app:', error);
          }
        }

        // Annuler la fermeture programmée
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
          console.log('🚫 Cancelled close timer');
        }

        // Si le menu est déjà ouvert, changer immédiatement (ignorer suppression)
        if (isMenuOpen || window.styloAppState.isMenuOpen) {
          console.log(`🔄 Switching instantly to: ${action}`);
          // Changement instantané sans reset (panel déjà ouvert)
          this.showPanel(action);
          currentAction = action;
          window.styloAppState.currentAction = action;
        } else {
          // Ne pas ouvrir par hover si un clic vient d'arriver ou tant que la souris n'a pas quitté
          if (suppressHover || Date.now() < clickCooldownUntil) {
            console.log('🚫 Hover suppressed after click');
            return;
          }
          // Sinon, programmer l'ouverture après 1.5s
          console.log(`⏱️ Scheduling open for: ${action}`);
          hoverTimer = setTimeout(() => {
            console.log(`📂 Opening after delay: ${action}`);
            openMenu(action);
          }, 1500);
        }
      });

      // Sortie d'un bouton
      button.addEventListener('mouseleave', () => {
        console.log(`🖱️ Mouse left: ${action}`);
        // Annuler l'ouverture programmée
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        // Ne PAS réactiver suppressHover ni clickCooldownUntil ici
        // Ils restent actifs jusqu'à ce que la souris sorte complètement de Stylo
      });

      // Clic sur un bouton
      button.addEventListener('click', async (e) => {
        // Don't prevent default for drag functionality
        console.log(`🎯 Clicked: ${action}`);

        // Fermer le menu et exécuter l'action
        // Mettre une période de cooldown pour éviter l'ouverture par hover juste après le clic
        clickCooldownUntil = Date.now() + 1200; // un peu plus long que le délai de hover
        suppressHover = true; // ne pas rouvrir tant que la souris n'a pas quitté
        clearAllTimers();
        closeMenu();
        this.executeAction(action);
      });
    });

    // Zone Stylo (toolbar + panel)
    const styloArea = document.querySelector('.floating-panel');
    const panelArea = document.querySelector('#context-panel .filter-content') || document.getElementById('context-panel');

    [styloArea, panelArea].filter(Boolean).forEach(area => {
      // Entrée dans la zone Stylo
      area.addEventListener('mouseenter', () => {
        console.log('🖱️ Mouse entered Stylo area');
        // Annuler la fermeture programmée
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      });

      // Sortie de la zone Stylo
      area.addEventListener('mouseleave', () => {
        console.log('🖱️ Mouse left Stylo area');
        
        // Réinitialiser les flags de suppression quand on sort complètement de Stylo
        suppressHover = false;
        clickCooldownUntil = 0;
        
        // Programmer la fermeture quasi-instantanée
        scheduleClose();
      });
    });
  }

  // Exécuter l'action après que l'utilisateur a configuré les filtres
  executeAction(action) {
    console.log('🎯 executeAction() called with action:', action);
    console.log('🎯 isProcessing:', this.isProcessing);
    
    switch (action) {
      case 'improvement':
        console.log('🎯 Calling handlePromptEnhancement()...');
        this.handlePromptEnhancement();
        break;
      case 'reformulation':
        console.log('🎯 Calling handleRephrase()...');
        this.handleRephrase();
        break;
      case 'translation':
        console.log('🎯 Calling handleTranslate()...');
        this.handleTranslate();
        break;
      case 'voice':
        console.log('🎯 Calling handleVoiceProcessing()...');
        this.handleVoiceProcessing();
        break;
      default:
        console.error('❌ Unknown action:', action);
    }
  }

  // === GESTION DU PANNEAU CONTEXTUEL ===

  setupPanelListeners() {
    console.log('🔧 Setting up panel listeners...');
    
    // Bouton de fermeture
    const closeBtn = document.getElementById('panel-close');
    if (closeBtn) {
      console.log('✅ Close button found, attaching listener');
      closeBtn.addEventListener('click', () => {
        console.log('❌ Close button clicked');
        this.hidePanel();
      });
    } else {
      console.log('⚠️  Close button not found (header hidden)');
    }

    console.log('✅ Panel listeners setup complete');
    
    // NOTE: attachFilterListeners() est maintenant appelé dans showPanel()
    // après que les filtres soient affichés
    // L'action se lance via DOUBLE-CLIC sur le bouton d'action principal
  }

  setupFastScroll(panel) {
    if (!panel) return;
    
    // Retirer l'ancien listener s'il existe
    if (this.wheelHandler) {
      panel.removeEventListener('wheel', this.wheelHandler);
    }
    
    // Variables pour le momentum scrolling naturel
    let scrollVelocity = 0;
    let lastTime = Date.now();
    let animationFrame = null;
    
    // Fonction de momentum doux (comme sur mobile)
    const applyMomentum = () => {
      if (Math.abs(scrollVelocity) > 0.1) {
        panel.scrollTop += scrollVelocity;
        scrollVelocity *= 0.85; // Friction plus forte = ralentissement plus rapide
        animationFrame = requestAnimationFrame(applyMomentum);
      } else {
        scrollVelocity = 0;
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };
    
    // 📱 Handler naturel style mobile
    this.wheelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const now = Date.now();
      const deltaTime = Math.min(now - lastTime, 50);
      lastTime = now;
      
      // 📱 VITESSE NATURELLE (2.5x) - comme sur mobile
      const baseSpeed = 2.5;
      
      // Légère accélération si on scrolle vite (mais beaucoup moins qu'avant)
      const acceleration = Math.min(Math.abs(e.deltaY) / 200, 0.5); // Max 1.5x au lieu de 2x
      const scrollSpeed = baseSpeed * (1 + acceleration);
      
      // Calculer la vélocité pour le momentum doux
      const delta = e.deltaY * scrollSpeed;
      scrollVelocity = delta * 0.6; // Momentum réduit pour plus de contrôle
      
      // Scroll immédiat mais doux
      panel.scrollTop += delta;
      
      // Annuler l'ancien momentum et démarrer le nouveau
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      animationFrame = requestAnimationFrame(applyMomentum);
    };
    
    // Attacher le listener
    panel.addEventListener('wheel', this.wheelHandler, { passive: false });
    console.log('✅ Natural scroll enabled (mobile-like 2.5x speed)');
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

    console.log('📦 Panel element:', panel);
    if (!panel) {
      console.error('❌ Panel element not found!');
      return;
    }

    // Réinitialiser le panneau complètement
    panel.className = 'filter-modal';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-20px) scale(0.95)';
    panel.style.maxHeight = '0';
    panel.style.pointerEvents = 'none';
    panel.style.visibility = 'hidden';

    // Configurer le titre
    const config = {
      reformulation: 'Rephrasing',
      improvement: 'Enhancement',
      translation: 'Translation',
      voice: 'Voice Recognition'
    };

    const actionTitle = config[action] || 'Action';
    if (titleText) titleText.textContent = actionTitle;

    // Afficher les options IMMÉDIATEMENT selon l'action
    this.showOptions(action);

    // Ajuster la hauteur selon le contenu visible (sans espace blanc en bas)
    const optionsDiv = document.getElementById('panel-options');
    let computedHeight = 0;
    if (optionsDiv) {
      optionsDiv.style.display = 'block';
    }
    // Mesurer la hauteur exacte du contenu + padding top du panneau
    const contentEl = panel.querySelector('.filter-content');
    const paddingTop = parseInt(window.getComputedStyle(panel).paddingTop || '0', 10) || 0;
    const contentHeight = contentEl ? Math.ceil(contentEl.scrollHeight) : 0;
    computedHeight = paddingTop + contentHeight;

    // Afficher le panneau avec animation
    console.log('🎨 Adding show class for:', action);
    panel.classList.add('show');
    
    // Forcer les styles d'affichage
    panel.style.opacity = '1';
    panel.style.transform = 'translateY(0) scale(1)';
    panel.style.maxHeight = Math.max(0, computedHeight) + 'px';
    panel.style.pointerEvents = 'auto';
    panel.style.visibility = 'visible';
    
    // IMPORTANT: Attacher les listeners APRÈS avoir affiché les filtres
    setTimeout(() => {
      this.attachFilterListeners();
    }, 50);
    
    // Améliorer le scroll avec la molette de la souris (sur le contenu pour éviter pointer-events)
    const scrollTarget = panel.querySelector('.filter-content') || panel;
    this.setupFastScroll(scrollTarget);
    
    // Redimensionner la fenêtre pour afficher le panneau (ajustée au contenu, sans espace blanc)
    if (window.electronAPI && window.electronAPI.resizeWindow) {
      // computedHeight inclut déjà le paddingTop qui décale sous la toolbar,
      // donc ne pas additionner 50 encore une fois pour éviter l'espace blanc.
      const targetHeight = Math.max(50, Math.max(0, computedHeight));
      window.electronAPI.resizeWindow(200, targetHeight);
      console.log('🖼️ Window resized to:', targetHeight);
    }
    
    this.currentAction = action;
    // Mettre à jour l'état global pour les changements instantanés
    if (window.styloAppState) {
      window.styloAppState.isMenuOpen = true;
      window.styloAppState.currentAction = action;
    }

    console.log('📂 Panel opened successfully for:', action);
  }

  hidePanel() {
    console.log('📂 Hiding panel');
    const panel = document.getElementById('context-panel');
    if (panel) {
      // Retirer les classes d'état
      panel.classList.remove('show', 'success', 'error');
      
      // Redimensionner la fenêtre à la taille originale
      if (window.electronAPI && window.electronAPI.resizeWindow) {
        window.electronAPI.resizeWindow(200, 50);
        console.log('🖼️ Window resized back to toolbar size');
      }

      // Réinitialiser après l'animation
      setTimeout(() => {
        this.hideOptions();
        // S'assurer que le panel est complètement caché
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-20px) scale(0.95)';
        panel.style.maxHeight = '0';
        panel.style.pointerEvents = 'none';
        panel.style.visibility = 'hidden';
      }, 200);
    }
    
    this.currentAction = null;
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
    console.log(`🎨 Showing options for: ${action}`);
    
    const optionsDiv = document.getElementById('panel-options');
    const rephraseOptions = document.getElementById('options-rephrase');
    const improvementOptions = document.getElementById('options-improvement');
    const translationOptions = document.getElementById('options-translation');
    const voiceOptions = document.getElementById('options-voice');

    // Cacher toutes les options IMMÉDIATEMENT
    [rephraseOptions, improvementOptions, translationOptions, voiceOptions].forEach(el => {
      if (el) {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
      }
    });

    // Afficher les options appropriées IMMÉDIATEMENT
    let targetOptions = null;
    switch(action) {
      case 'reformulation':
        targetOptions = rephraseOptions;
        break;
      case 'improvement':
        targetOptions = improvementOptions;
        break;
      case 'translation':
        targetOptions = translationOptions;
        break;
      case 'voice':
        targetOptions = voiceOptions;
        break;
    }

    if (targetOptions) {
      console.log(`✅ Showing ${action} options`);
      
      // Afficher immédiatement
      targetOptions.style.display = 'flex';
      
      // Animer l'apparition après un micro-délai
      requestAnimationFrame(() => {
        targetOptions.style.opacity = '1';
        targetOptions.style.transform = 'translateY(0)';
      });
      
      if (optionsDiv) {
        optionsDiv.style.display = 'block';
      }
    } else {
      console.warn(`⚠️ No options found for action: ${action}`);
    }

    // Remonter en haut du panneau
    const panel = document.getElementById('context-panel');
    if (panel) {
      panel.scrollTop = 0;
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
    } else if (action === 'voice') {
      return {
        language: getActiveFilterValue('voice-language', 'en'),
        quality: getActiveFilterValue('voice-quality', 'standard'),
        speed: getActiveFilterValue('voice-speed', 'normal')
      };
    }
    return {};
  }

  async handlePromptEnhancement() {
    console.log('✨ handlePromptEnhancement() STARTED');
    console.log('✨ isProcessing:', this.isProcessing);
    
    if (this.isProcessing) {
      console.log('⏳ Already processing, ignoring click');
      return;
    }

    console.log('✨ Starting prompt enhancement workflow...');

    // Cacher le panneau pendant l'exécution
    this.hidePanel();
    
    console.log('🔄 Panel hidden, starting processing...');

    this.isProcessing = true;
    this.showLoading(true);
    
    console.log('✨ Status updated, starting processing...');

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
        throw new Error('Unable to copy text. Make sure your cursor is in a text field.');
      }

      // Nettoyer le texte
      copiedText = copiedText.trim();

      // Vérifier si c'est du JSON/HTML (popup d'erreur copiée par erreur)
      if (copiedText.startsWith('{') || copiedText.startsWith('<') || copiedText.includes('Error Message') || copiedText.includes('Raw Response')) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('The copied content appears to be an error popup. Close the error popup and try again.');
      }

      // Étape 3: Traitement IA
      this.updateStatus('AI processing...');
      this.updateProgress(40);

      // Récupérer les options
      const options = this.getOptions('improvement');
      console.log('⚙️ Options utilisées pour l\'amélioration:', options);

      let enhancedText;
      try {
        // 🎯 PASSER LES OPTIONS à l'API
        enhancedText = await this.callAI(copiedText, 'enhance-prompt', options);
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Error calling AI: ${error.message}`);
      }

      if (!enhancedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('AI did not return a result.');
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

    // Cacher le panneau pendant l'exécution
    this.hidePanel();
    
    console.log('🔄 Panel hidden, starting processing...');

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
        throw new Error('Unable to copy text. Make sure your cursor is in a text field.');
      }

      copiedText = copiedText.trim();

      // Étape 3: Traitement IA
      this.updateStatus('AI processing...');
      this.updateProgress(40);

      // Récupérer les options
      const options = this.getOptions('reformulation');
      console.log('⚙️ Options utilisées pour la reformulation:', options);

      let rephrasedText;
      try {
        // 🎯 PASSER LES OPTIONS à l'API
        rephrasedText = await this.callAI(copiedText, 'rephrase-text', options);
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Error calling AI: ${error.message}`);
      }

      if (!rephrasedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('AI did not return a result.');
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

    // Cacher le panneau pendant l'exécution
    this.hidePanel();
    
    console.log('🔄 Panel hidden, starting processing...');

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
        throw new Error('Unable to copy text. Make sure your cursor is in a text field.');
      }
      
      copiedText = copiedText.trim();
      
      // Étape 3: Traitement IA
      this.updateStatus('AI translation...');
      this.updateProgress(40);
      
      // Récupérer les options
      const options = this.getOptions('translation');
      console.log('⚙️ Options utilisées pour la traduction:', options);
      
      let translatedText;
      try {
        // 🎯 PASSER LES OPTIONS à l'API
        translatedText = await this.callAI(copiedText, 'translate-text', options);
      } catch (error) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error(`Error calling AI: ${error.message}`);
      }
      
      if (!translatedText) {
        await window.electronAPI.setClipboardText(oldClipboard);
        throw new Error('AI did not return a result.');
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
      
      // Get voice options from menu
      const options = this.getOptions('voice');
      this.debugLog('🎯 Voice options:', options);
      
      // Enhance the prompt with voice options
      const enhancedText = await this.enhancePrompt(text, options);
      
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


  async enhancePrompt(text, options = {}) {
    try {
      console.log('🤖 Enhancing prompt with options:', options);
      
      // Use the same callAI system as other buttons with options
      const enhancedText = await this.callAI(text, 'enhance-prompt', options);
      
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
    
    // FONCTION UNIQUE pour tous les boutons - utilise le provider approprié
    async callAI(text, action, options = {}) {
      // Choisir le provider selon l'action
      let provider;
      
      // DEBUG: Afficher toute la config disponible
      console.log('🔍 Available providers config:', window.APP_CONFIG?.providers);
      
      // Map action vers la clé de config
      if (action === 'enhance-prompt') {
        provider = window.APP_CONFIG.providers.enhance || window.APP_CONFIG.providers.default;
        console.log('📊 Enhancement selected:', provider);
      } else if (action === 'rephrase-text') {
        provider = window.APP_CONFIG.providers.rephrase || window.APP_CONFIG.providers.default;
        console.log('📊 Rephrase selected:', provider);
      } else if (action === 'translate-text') {
        provider = window.APP_CONFIG.providers.translate || window.APP_CONFIG.providers.default;
        console.log('📊 Translate selected:', provider);
      } else if (action === 'voice') {
        provider = window.APP_CONFIG.providers.voice || window.APP_CONFIG.providers.default;
        console.log('📊 Voice selected:', provider);
      } else {
        provider = window.APP_CONFIG.providers.default;
        console.log('📊 Default selected:', provider);
      }
      
      console.log(`🎯 FINAL: Using provider "${provider}" for action "${action}"`);
      console.log(`🎨 With options:`, options);
      
      // Router vers le bon provider avec les options
      if (provider === 'huggingface') {
        return await this.callHuggingFace(text, action, options);
      } else if (provider === 'openrouter') {
        return await this.callSupabaseOpenRouter(text, action, options);
      } else if (provider === 'letta') {
        return await this.callSupabaseLettA(text, action, options);
      } else {
        return await this.callSupabaseOpenAI(text, action, options);
      }
    }
    
    // ========== HUGGING FACE API ==========
    async callHuggingFace(text, action) {
      console.log('🤗 Calling Hugging Face API (Prompt++)...');
      
      // Vérifier la clé API
      if (!window.HUGGINGFACE_CONFIG.apiKey || window.HUGGINGFACE_CONFIG.apiKey === 'YOUR_HUGGINGFACE_API_KEY_HERE') {
        throw new Error('Hugging Face API key not configured. Please add your key in config.js');
      }
      
      const modelUrl = `${window.HUGGINGFACE_CONFIG.apiUrl}/${window.HUGGINGFACE_CONFIG.models.promptPlusPlus}`;
      
      try {
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.HUGGINGFACE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Hugging Face API error:', errorData);
          throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('✅ Hugging Face response:', data);
        
        // Le modèle retourne un array avec le texte généré
        if (Array.isArray(data) && data.length > 0) {
          return data[0].generated_text || data[0].text || text;
        } else if (data.generated_text) {
          return data.generated_text;
        } else {
          throw new Error('Unexpected response format from Hugging Face');
        }
      } catch (error) {
        console.error('❌ Error calling Hugging Face:', error);
        throw error;
      }
    }
    
    // Fonctions OpenRouter pour chaque action
    async callSupabaseOpenRouter(text, action, options = {}) {
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
      console.log(`🎨 Avec les options:`, options);
      
      // 🎯 ENVOYER LE TEXTE + LES OPTIONS (spread pour que les fonctions lisent directement)
      const response = await fetch(`${window.SUPABASE_CONFIG.url}${functionUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ 
          text,
          options,  // Keep options object
          ...options  // Spread individual options
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.enhanced_text || data.result || data.rephrased_text || data.translated_text;
    }
    
    // Fonctions OpenAI pour chaque action
    async callSupabaseOpenAI(text, action, options = {}) {
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
      console.log(`🎨 Avec les options:`, options);
      
      // 🎯 ENVOYER LE TEXTE + LES OPTIONS (spread pour que les fonctions lisent directement)
      const response = await fetch(`${window.SUPABASE_CONFIG.url}${functionUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ 
          text,
          options,  // Keep options object
          ...options  // Spread individual options
        })
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

  // ========== FONCTIONS LETTA AI (NOUVEAU PROVIDER) ==========
  
  // Fonction principale pour appeler les fonctions LettA via Supabase
  async callSupabaseLettA(text, action, options = {}) {
    try {
      console.log(`🚀 Calling Supabase LettA AI for ${action}...`);
      
      let functionUrl;
      let requestBody = { text, ...options };
      
      // Choisir la bonne fonction selon l'action
      switch (action) {
        case 'enhance-prompt':
          functionUrl = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.enhancePromptLettA}`;
          break;
        case 'rephrase-text':
          functionUrl = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.rephraseTextLettA}`;
          break;
        case 'translate-text':
          functionUrl = `${window.SUPABASE_CONFIG.url}${window.SUPABASE_CONFIG.functions.translateTextLettA}`;
          break;
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), window.APP_CONFIG.networkTimeout);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
          'apikey': window.SUPABASE_CONFIG.anonKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`❌ LettA API error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.enhanced_text || data.result || data.rephrased_text || data.translated_text;
    } catch (error) {
      console.error(`❌ Error calling LettA AI for ${action}:`, error);
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
