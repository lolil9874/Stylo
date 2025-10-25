#!/usr/bin/env node

/**
 * Script de test pour le bridge natif AX
 * Teste les fonctionnalités principales du bridge
 */

const { exec } = require('child_process');
const path = require('path');

class AXBridgeTester {
  constructor() {
    this.bridgePath = path.join(__dirname, 'bin', 'StyloBridge');
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Test du bridge natif AX...\n');

    // Vérifier que le binaire existe
    await this.testBinaryExists();
    
    // Tester les permissions
    await this.testPermissions();
    
    // Tester les fonctions AX (si possible)
    await this.testAXFunctions();
    
    // Afficher les résultats
    this.displayResults();
  }

  async testBinaryExists() {
    console.log('📦 Test de l\'existence du binaire...');
    
    try {
      const { exec } = require('child_process');
      const result = await new Promise((resolve) => {
        exec(`test -f "${this.bridgePath}"`, (error) => {
          resolve({ success: !error, error: error?.message });
        });
      });
      
      if (result.success) {
        this.addResult('Binaire', true, 'Bridge natif trouvé');
      } else {
        this.addResult('Binaire', false, 'Bridge natif manquant - exécuter build.sh');
      }
    } catch (error) {
      this.addResult('Binaire', false, `Erreur: ${error.message}`);
    }
  }

  async testPermissions() {
    console.log('🔐 Test des permissions...');
    
    try {
      const result = await this.callBridge('checkPermissions');
      
      if (result.success) {
        const permissions = JSON.parse(result.data);
        this.addResult('Permissions', true, `Accessibilité: ${permissions.accessibility}, Input: ${permissions.inputMonitoring}, Screen: ${permissions.screenRecording}`);
      } else {
        this.addResult('Permissions', false, result.error);
      }
    } catch (error) {
      this.addResult('Permissions', false, `Erreur: ${error.message}`);
    }
  }

  async testAXFunctions() {
    console.log('🔍 Test des fonctions AX...');
    
    try {
      // Tester getFocusedTextValue
      const getResult = await this.callBridge('getFocusedTextValue');
      
      if (getResult.success) {
        this.addResult('AX Get', true, `Texte lu: "${getResult.data?.substring(0, 50)}..."`);
      } else {
        this.addResult('AX Get', false, getResult.error);
      }
      
      // Tester setFocusedTextValue
      const setResult = await this.callBridge('setFocusedTextValue', 'Test AX Bridge');
      
      if (setResult.success) {
        this.addResult('AX Set', true, 'Texte écrit avec succès');
      } else {
        this.addResult('AX Set', false, setResult.error);
      }
      
    } catch (error) {
      this.addResult('AX Functions', false, `Erreur: ${error.message}`);
    }
  }

  async callBridge(command, ...args) {
    return new Promise((resolve) => {
      const commandArgs = [command, ...args].map(arg => `"${arg}"`).join(' ');
      
      exec(`"${this.bridgePath}" ${commandArgs}`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }
        
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (parseError) {
          resolve({ success: false, error: 'Failed to parse bridge response' });
        }
      });
    });
  }

  addResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  }

  displayResults() {
    console.log('\n📊 Résultats des tests:\n');
    
    let passedTests = 0;
    let totalTests = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const statusText = result.success ? 'PASS' : 'FAIL';
      
      console.log(`${status} ${result.test}: ${statusText}`);
      console.log(`   ${result.message}\n`);
      
      if (result.success) passedTests++;
    });

    console.log(`📈 Résumé: ${passedTests}/${totalTests} tests passés`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Tous les tests sont passés ! Le bridge AX est prêt.');
    } else {
      console.log('⚠️  Certains tests ont échoué. Consultez les messages ci-dessus.');
      
      if (passedTests === 0) {
        console.log('\n💡 Suggestions:');
        console.log('1. Exécuter: cd native-bridge && ./build.sh');
        console.log('2. Accorder les permissions d\'accessibilité');
        console.log('3. Placer le curseur dans un champ de texte');
      }
    }
  }
}

// Exécuter les tests
const tester = new AXBridgeTester();
tester.runTests().catch(console.error);
