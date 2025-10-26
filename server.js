const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Stylo web version running at: http://localhost:${PORT}`);
  console.log(`📂 Open your browser and visit: http://localhost:${PORT}`);
});
