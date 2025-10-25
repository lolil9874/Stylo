#!/bin/bash

# Script de compilation du bridge natif Stylo
# Compile le binaire Swift pour macOS

set -e

echo "🔨 Compilation du bridge natif Stylo..."

# Vérifier que Swift est disponible
if ! command -v swift &> /dev/null; then
    echo "❌ Swift n'est pas installé. Veuillez installer Xcode Command Line Tools."
    exit 1
fi

# Créer le dossier de sortie
mkdir -p ../bin

# Compiler le binaire
echo "📦 Compilation en cours..."
swiftc -o ../bin/StyloBridge StyloBridge.swift -framework ApplicationServices -framework Foundation

# Rendre le binaire exécutable
chmod +x ../bin/StyloBridge

# Vérifier la compilation
if [ -f "../bin/StyloBridge" ]; then
    echo "✅ Bridge natif compilé avec succès: bin/StyloBridge"
    
    # Test rapide
    echo "🧪 Test du bridge..."
    ../bin/StyloBridge checkPermissions
else
    echo "❌ Échec de la compilation"
    exit 1
fi

echo "🎉 Bridge natif prêt à être utilisé !"
