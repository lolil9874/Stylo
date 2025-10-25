#!/usr/bin/env node

/**
 * Script de test automatisé pour Stylo
 * Teste les fonctionnalités principales de l'application
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class StyloTester {
  constructor() {
    this.testResults = [];
    this.configFile = path.join(__dirname, 'config.js');
  }

  async runTests() {
    console.log('🧪 Démarrage des tests Stylo...\n');

    // Vérifier la configuration
    await this.testConfiguration();
    
    // Vérifier les permissions
    await this.testPermissions();
    
    // Vérifier les fichiers requis
    await this.testRequiredFiles();
    
    // Vérifier les dépendances
    await this.testDependencies();
    
    // Afficher les résultats
    this.displayResults();
  }

  async testConfiguration() {
    console.log('📋 Test de la configuration...');
    
    try {
      if (!fs.existsSync(this.configFile)) {
        this.addResult('Configuration', false, 'Fichier config.js manquant');
        return;
      }

      const configContent = fs.readFileSync(this.configFile, 'utf8');
      
      // Vérifier que les URLs sont configurées
      if (configContent.includes('your-project.supabase.co')) {
        this.addResult('Configuration', false, 'URLs Supabase non configurées');
      } else if (configContent.includes('your-anon-key-here')) {
        this.addResult('Configuration', false, 'Clé Supabase non configurée');
      } else {
        this.addResult('Configuration', true, 'Configuration valide');
      }
    } catch (error) {
      this.addResult('Configuration', false, `Erreur: ${error.message}`);
    }
  }

  async testPermissions() {
    console.log('🔐 Test des permissions...');
    
    try {
      // Test simple d'accessibilité
      const script = `
        tell application "System Events"
          try
            set frontApp to first application process whose frontmost is true
            return "SUCCESS"
          on error
            return "NO_PERMISSION"
          end try
        end tell
      `;
      
      exec(`osascript -e '${script}'`, (error, stdout) => {
        if (stdout.trim() === 'SUCCESS') {
          this.addResult('Permissions', true, 'Permissions d\'accessibilité OK');
        } else {
          this.addResult('Permissions', false, 'Permissions d\'accessibilité manquantes');
        }
      });
    } catch (error) {
      this.addResult('Permissions', false, `Erreur: ${error.message}`);
    }
  }

  async testRequiredFiles() {
    console.log('📁 Test des fichiers requis...');
    
    const requiredFiles = [
      'main.js',
      'preload.js',
      'script.js',
      'styles.css',
      'index.html',
      'package.json'
    ];

    let allFilesExist = true;
    const missingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        allFilesExist = false;
        missingFiles.push(file);
      }
    }

    if (allFilesExist) {
      this.addResult('Fichiers', true, 'Tous les fichiers requis sont présents');
    } else {
      this.addResult('Fichiers', false, `Fichiers manquants: ${missingFiles.join(', ')}`);
    }
  }

  async testDependencies() {
    console.log('📦 Test des dépendances...');
    
    try {
      const packageJsonPath = path.join(__dirname, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        this.addResult('Dépendances', false, 'package.json manquant');
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = ['electron'];
      
      let allDepsPresent = true;
      const missingDeps = [];

      for (const dep of requiredDeps) {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
          allDepsPresent = false;
          missingDeps.push(dep);
        }
      }

      if (allDepsPresent) {
        this.addResult('Dépendances', true, 'Toutes les dépendances requises sont présentes');
      } else {
        this.addResult('Dépendances', false, `Dépendances manquantes: ${missingDeps.join(', ')}`);
      }
    } catch (error) {
      this.addResult('Dépendances', false, `Erreur: ${error.message}`);
    }
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
      console.log('🎉 Tous les tests sont passés ! Stylo est prêt à être utilisé.');
    } else {
      console.log('⚠️  Certains tests ont échoué. Consultez les messages ci-dessus.');
    }
  }
}

// Exécuter les tests
const tester = new StyloTester();
tester.runTests().catch(console.error);
