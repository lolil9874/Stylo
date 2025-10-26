# 🐛 Guide de Débogage Voice Deepgram

## 🔍 **Étapes de Débogage :**

### **1. Test Simple (Recommandé) :**
1. **Ouvrez** `test-deepgram-simple.html` dans votre navigateur
2. **Cliquez** sur "Commencer l'enregistrement"
3. **Autorisez** l'accès au microphone
4. **Parlez** et regardez les logs
5. **Cliquez** sur "Arrêter" après quelques secondes

### **2. Vérifications dans la Console :**

#### **Logs Attendus :**
```
🚀 Test Deepgram initialisé
🎤 Démarrage de l'enregistrement...
✅ Accès microphone accordé
🔗 Connexion à: wss://api.deepgram.com/v1/listen?...
✅ Connexion Deepgram établie
🎵 Streaming audio démarré
📨 Message reçu: {...}
📝 Final: "votre texte"
```

#### **Erreurs Possibles :**
- `❌ Erreur: NotAllowedError` → Microphone refusé
- `❌ Erreur WebSocket: ...` → Problème de connexion Deepgram
- `❌ Erreur: NetworkError` → Problème de réseau

### **3. Test dans Stylo :**

#### **Ouvrez la Console :**
1. **Lancez** Stylo : `npm start`
2. **Ouvrez** les DevTools (F12)
3. **Cliquez** sur le bouton micro
4. **Regardez** les logs dans la console

#### **Logs Attendus :**
```
🎤 Voice button clicked!
🎙️ Starting Deepgram workflow...
🔑 Using Deepgram key: af9416509c6bf8b512b3...
🌍 Language: fr
✅ Microphone access granted
🔗 Deepgram WebSocket connection established
🎵 Deepgram audio streaming started
📝 Final transcript: "votre texte"
🤖 Enhancing prompt...
✅ Prompt enhanced successfully
✅ Deepgram workflow completed successfully
```

### **4. Problèmes Courants :**

#### **A. Microphone Non Détecté :**
- **Vérifiez** les permissions du navigateur
- **Testez** avec `test-deepgram-simple.html`
- **Utilisez** Chrome ou Edge

#### **B. Connexion Deepgram Échoue :**
- **Vérifiez** votre connexion internet
- **Vérifiez** la clé API Deepgram
- **Testez** avec le fichier simple

#### **C. Pas de Transcription :**
- **Parlez** plus fort et plus clairement
- **Attendez** 2-3 secondes après avoir parlé
- **Vérifiez** que le microphone fonctionne

#### **D. Erreur 401 Supabase :**
- **Vérifiez** la clé Supabase dans `config.js`
- **Testez** l'API directement

### **5. Solutions :**

#### **Si Rien Ne Fonctionne :**
1. **Testez** `test-deepgram-simple.html` d'abord
2. **Vérifiez** les logs dans la console
3. **Testez** avec un autre navigateur
4. **Vérifiez** les permissions microphone

#### **Si Deepgram Fonctionne Mais Pas Stylo :**
1. **Vérifiez** que `config.js` est chargé
2. **Vérifiez** les logs dans la console Stylo
3. **Redémarrez** Stylo

## 🎯 **Prochaines Étapes :**

1. **Testez** `test-deepgram-simple.html`
2. **Partagez** les logs de la console
3. **Identifiez** où ça bloque
4. **Corrigeons** le problème spécifique

**Dites-moi ce que vous voyez dans les logs !** 🔍
