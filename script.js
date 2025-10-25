// Button interaction management
class FloatingInterface {
    constructor() {
        this.activeButton = null;
        this.buttons = document.querySelectorAll('.action-button');
        this.lastUsedInput = null; // Garde en mémoire la dernière input utilisée
        this.init();
    }

    init() {
        this.bindEvents();
        this.setInitialState();
        this.trackInputUsage(); // Surveille l'utilisation des inputs
    }

    bindEvents() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
            button.addEventListener('mouseenter', (e) => this.handleButtonHover(e, true));
            button.addEventListener('mouseleave', (e) => this.handleButtonHover(e, false));
        });
    }

    setInitialState() {
        // The first button (rephrasing) is active by default
        this.activeButton = this.buttons[0];
        this.updateButtonStates();
    }

    trackInputUsage() {
        // Surveille tous les champs de texte de la page
        const inputSelector = 'input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], textarea, [contenteditable="true"]';
        
        // Ajoute les listeners sur tous les inputs existants
        const addListeners = () => {
            document.querySelectorAll(inputSelector).forEach(input => {
                if (!input.hasAttribute('data-stylo-tracked')) {
                    input.setAttribute('data-stylo-tracked', 'true');
                    
                    // Quand on clique ou focus sur un input
                    input.addEventListener('focus', () => {
                        this.lastUsedInput = input;
                        console.log('📌 Input tracked:', input.tagName, input.id || input.className);
                    });
                    
                    // Quand on tape dedans
                    input.addEventListener('input', () => {
                        this.lastUsedInput = input;
                    });
                }
            });
        };
        
        // Ajoute les listeners au chargement
        addListeners();
        
        // Re-scan régulièrement pour les nouveaux inputs (SPAs)
        setInterval(addListeners, 2000);
        
        // Observe les changements du DOM
        const observer = new MutationObserver(addListeners);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    handleButtonClick(event) {
        const button = event.currentTarget;
        const action = button.dataset.action;
        
        // Ajouter l'effet de clic
        this.addClickEffect(button);
        
        // Changer l'état actif
        this.setActiveButton(button);
        
        // Simuler l'action
        this.performAction(action);
    }

    handleButtonHover(event, isEntering) {
        const button = event.currentTarget;
        
        if (isEntering) {
            button.style.transform = 'translateY(-2px) scale(1.05)';
        } else {
            if (button === this.activeButton) {
                button.style.transform = 'translateY(-2px) scale(1)';
            } else {
                button.style.transform = 'translateY(0) scale(1)';
            }
        }
    }

    addClickEffect(button) {
        // Ajouter la classe pour l'effet de vague
        button.classList.add('clicked');
        
        // Supprimer la classe après l'animation
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 600);
    }

    setActiveButton(button) {
        // Retirer l'état actif de tous les boutons
        this.buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.transform = 'translateY(0) scale(1)';
        });
        
        // Activer le bouton sélectionné
        button.classList.add('active');
        button.style.transform = 'translateY(-2px) scale(1)';
        
        this.activeButton = button;
    }

    updateButtonStates() {
        this.buttons.forEach(button => {
            if (button === this.activeButton) {
                button.classList.add('active');
                button.style.transform = 'translateY(-2px) scale(1)';
            } else {
                button.classList.remove('active');
                button.style.transform = 'translateY(0) scale(1)';
            }
        });
    }

    performAction(action) {
        console.log(`Action sélectionnée: ${action}`);
        
        // Simulation des différentes actions
        switch (action) {
            case 'correction':
                this.simulateTextCorrection();
                break;
            case 'reformulation':
                this.simulateTextReformulation();
                break;
            case 'translation':
                this.simulateTextTranslation();
                break;
            case 'improvement':
                this.simulatePromptImprovement();
                break;
            case 'voice':
                this.simulateVoiceInput();
                break;
        }
    }

    simulateTextReformulation() {
        console.log('✏️ Text rephrasing in progress...');
        this.showNotification('Text rephrasing activated');
    }

    simulateTextTranslation() {
        console.log('🌐 Text translation in progress...');
        this.showNotification('Text translation activated');
    }

    simulatePromptImprovement() {
        console.log('✨ Prompt improvement in progress...');
        this.showNotification('Detecting text field...');
        
        // Améliorer le texte via détection automatique
        this.enhancePromptAuto();
    }

    async enhancePromptAuto() {
        try {
            console.log('🔍 Starting automatic prompt enhancement...');
            this.showNotification('Detecting active text field...');
            
            // Détecter automatiquement le champ de texte actif
            const fieldResult = await window.electronAPI.getActiveTextField();
            
            if (!fieldResult.success) {
                console.error('❌ Failed to detect text field:', fieldResult.error);
                this.showNotification('No text field detected - trying clipboard method...');
                
                // Fallback vers la méthode clipboard
                console.log('🔄 Falling back to clipboard method...');
                return this.enhancePromptViaClipboard();
            }
            
            const { app, fieldName, text } = fieldResult;
            console.log(`📱 Detected field in ${app}:`, fieldName);
            console.log('📄 Field content:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
            
            if (!text || !text.trim()) {
                console.warn('⚠️ Text field is empty');
                this.showNotification('Text field is empty - type something first!');
                return;
            }

            console.log('🚀 Enhancing text via API...');
            this.showNotification('Enhancing with AI...');
            
            // Envoyer à la fonction Supabase
            const enhancedText = await this.sendToSupabase(text);
            
            console.log('✅ Enhanced text received!');
            console.log('📝 Length: ' + text.length + ' → ' + enhancedText.length + ' chars');
            
            if (enhancedText) {
                // Remplacer directement le texte dans le champ
                console.log('📋 Replacing text in field...');
                this.showNotification('Replacing text...');
                
                const replaced = await window.electronAPI.replaceActiveTextField(enhancedText);
                
                if (replaced.success) {
                    console.log('✅ Text replaced successfully!');
                    this.showNotification('✨ Enhanced & replaced!');
                } else {
                    console.error('❌ Failed to replace text:', replaced.error);
                    this.showNotification('Failed to replace - trying clipboard method...');
                    
                    // Fallback vers clipboard
                    return this.enhancePromptViaClipboard();
                }
            }
            
        } catch (error) {
            console.error('❌ Error in auto enhancement:', error);
            this.showNotification('Auto failed - trying clipboard method...');
            
            // Fallback vers clipboard
            return this.enhancePromptViaClipboard();
        }
    }

    async enhancePromptViaClipboard() {
        try {
            console.log('🔍 Starting prompt enhancement via clipboard...');
            this.showNotification('Selecting & copying text...');
            
            // Attendre un peu pour que l'utilisateur ait le temps de sélectionner
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Copier le texte sélectionné (simule Cmd+C)
            const result = await window.electronAPI.copySelectedText();
            
            if (!result.success) {
                console.error('❌ Failed to copy selected text');
                this.showNotification('Failed to copy - check permissions');
                return;
            }
            
            const originalText = result.text;
            console.log('📄 Copied text:', originalText.substring(0, 100) + (originalText.length > 100 ? '...' : ''));
            
            if (!originalText || !originalText.trim()) {
                console.warn('⚠️ No text selected');
                this.showNotification('Please select some text first!');
                return;
            }

            console.log('🚀 Enhancing text via API...');
            this.showNotification('Enhancing with AI...');
            
            // Envoyer à la fonction Supabase
            const enhancedText = await this.sendToSupabase(originalText);
            
            console.log('✅ Enhanced text received!');
            console.log('📝 Length: ' + originalText.length + ' → ' + enhancedText.length + ' chars');
            
            if (enhancedText) {
                // Coller le texte amélioré (Cmd+A puis Cmd+V)
                console.log('📋 Selecting all & pasting enhanced text...');
                this.showNotification('Replacing text...');
                
                const pasted = await window.electronAPI.pasteText(enhancedText);
                
                if (pasted) {
                    console.log('✅ Text replaced successfully!');
                    this.showNotification('✨ Enhanced & replaced!');
                } else {
                    console.error('❌ Failed to paste text');
                    this.showNotification('Failed to paste - check permissions');
                }
            }
            
        } catch (error) {
            console.error('❌ Error enhancing prompt:', error);
            this.showNotification('Error: ' + error.message);
        }
    }

    detectActiveTextInput() {
        console.log('🔎 Detecting active text input...');
        
        // PRIORITÉ 1: Le dernier input utilisé (tracked)
        if (this.lastUsedInput) {
            const value = this.lastUsedInput.value || this.lastUsedInput.textContent || '';
            if (value.trim()) {
                console.log('✅ Using last used input:', this.lastUsedInput.tagName, this.lastUsedInput.id || this.lastUsedInput.className);
                console.log('📝 Content:', value.substring(0, 100) + (value.length > 100 ? '...' : ''));
                return this.lastUsedInput;
            } else {
                console.log('⚠️ Last used input is empty');
            }
        }
        
        // PRIORITÉ 2: L'élément actuellement focusé
        let activeElement = document.activeElement;
        if (activeElement && this.isTextInput(activeElement)) {
            const value = activeElement.value || activeElement.textContent || '';
            if (value.trim()) {
                console.log('✅ Using focused element:', activeElement.tagName, activeElement.id || activeElement.className);
                return activeElement;
            }
        }
        
        // PRIORITÉ 3: Chercher n'importe quel input avec du contenu
        const textInputs = document.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], textarea, [contenteditable="true"]');
        console.log(`🔍 Searching ${textInputs.length} text inputs for content...`);
        
        for (let input of textInputs) {
            const value = input.value || input.textContent || '';
            if (value.trim()) {
                console.log(`✅ Found input with content: ${input.tagName} (${input.id || input.className})`);
                return input;
            }
        }
        
        console.warn('❌ No text input found with content');
        return null;
    }

    isTextInput(element) {
        const tagName = element.tagName.toLowerCase();
        const inputTypes = ['text', 'search', 'email', 'url', 'tel'];
        const contentEditable = element.getAttribute('contenteditable') === 'true';
        
        if (tagName === 'textarea') {
            return true;
        }
        
        if (tagName === 'input') {
            const type = element.type || 'text';
            return inputTypes.includes(type);
        }
        
        return contentEditable;
    }

    async sendToSupabase(text) {
        // Configuration Supabase
        const supabaseUrl = 'https://vkyfdunlbpzwxryqoype.supabase.co';
        const functionName = 'enhance-prompt';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWZkdW5sYnB6d3hyeXFveXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQ3OTUsImV4cCI6MjA3NjkzMDc5NX0.Qnduuj9IwhWtrOueYmBJP5nOCUS_XimrBZuvNcfT530';
        
        const url = `${supabaseUrl}/functions/v1/${functionName}`;
        
        try {
            console.log('📡 Connecting to Supabase function:', url);
            console.log('📝 Sending text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
            
            this.showNotification('Connecting to API...');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`
                },
                body: JSON.stringify({
                    text: text
                })
            });

            console.log('📬 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API error response:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                throw new Error(`API error: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (!data.enhanced_text) {
                throw new Error('No enhanced text received from API');
            }
            
            return data.enhanced_text;
            
        } catch (error) {
            console.error('❌ Supabase function error:', error);
            this.showNotification('API connection failed');
            throw error;
        }
    }

    replaceTextInInput(element, newText) {
        if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
            element.value = newText;
            
            // Déclencher les événements de changement
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (element.getAttribute('contenteditable') === 'true') {
            element.textContent = newText;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    simulateVoiceInput() {
        console.log('🎤 Voice mode activated...');
        this.showNotification('Voice mode activated - Speak now');
        
        // Special animation for voice button
        this.animateVoiceButton();
    }

    animateVoiceButton() {
        const voiceButton = document.querySelector('.voice-button');
        voiceButton.style.animation = 'subtlePulse 1s infinite';
        
        setTimeout(() => {
            voiceButton.style.animation = '';
        }, 5000);
    }

    showNotification(message) {
        // Create a notification that appears on top of the floating box
        const floatingPanel = document.querySelector('.floating-panel');
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
            pointer-events: none;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;
        
        floatingPanel.appendChild(notification);
        
        // Appearance animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (floatingPanel.contains(notification)) {
                    floatingPanel.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
}

// Initialize the interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FloatingInterface();
});

// Keyboard shortcuts management (optional)
document.addEventListener('keydown', (event) => {
    // Shortcuts to test buttons
    switch (event.key) {
        case '1':
            document.querySelector('[data-action="reformulation"]').click();
            break;
        case '2':
            document.querySelector('[data-action="translation"]').click();
            break;
        case '3':
            document.querySelector('[data-action="improvement"]').click();
            break;
        case '4':
            event.preventDefault();
            document.querySelector('[data-action="voice"]').click();
            break;
    }
});
