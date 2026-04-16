const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour les variables globales - AJOUTEZ CECI
app.use((req, res, next) => {
  res.locals.successMessage = null;
  res.locals.errorMessage = null;
  next();
});

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

// Import du contrôleur
const productController = require('./controllers/productController');

// Routes
app.get('/', (req, res) => res.redirect('/products'));
app.get('/products', productController.getAllProducts);
app.get('/products/create', productController.showCreateForm);
app.post('/products/create', productController.createProduct);
app.get('/products/:id', productController.getProductById);
app.get('/products/edit/:id', productController.showEditForm);
app.post('/products/:id/update', productController.updateProduct);
app.post('/products/:id/delete', productController.deleteProduct);

// Middleware d'erreur
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas.' 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Erreur serveur',
    message: 'Une erreur est survenue sur le serveur.' 
  });
});

// Démarrage avec SQLite
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(` Base de données: SQLite (pas besoin de mot de passe)`);
  });
}

start();