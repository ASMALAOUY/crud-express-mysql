const Product = require('../models/product');
const { body, validationResult } = require('express-validator');

// Validation rules
const productValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Le nom est requis').trim().escape(),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('description').optional().trim().escape()
  ];
};

// Vérification des erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('products/create', {
      title: 'Ajouter un produit',
      errors: errors.array(),
      product: req.body,
      errorMessage: errors.array()[0].msg
    });
  }
  next();
};

// Afficher tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const result = await Product.findAll(page, limit, search);
    
    res.render('products/index', { 
      title: 'Liste des produits', 
      products: result.products,
      pagination: result.pagination,
      searchQuery: search,
      currentPage: page,
      limit: limit
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).render('error', { 
      title: 'Erreur',
      message: 'Erreur lors de la récupération des produits' 
    });
  }
};

// Afficher les détails d'un produit
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render('error', { 
        title: 'Produit non trouvé',
        message: 'Le produit que vous recherchez n\'existe pas.' 
      });
    }
    res.render('products/details', { 
      title: product.name, 
      product 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).render('error', { 
      title: 'Erreur',
      message: 'Erreur lors de la récupération du produit' 
    });
  }
};

// Afficher le formulaire de création
exports.showCreateForm = (req, res) => {
  res.render('products/create', { 
    title: 'Ajouter un produit',
    errors: null,
    product: null
  });
};

// Créer un produit
exports.createProduct = [
  productValidationRules(),
  validate,
  async (req, res) => {
    try {
      const { name, price, description } = req.body;
      await Product.create({ name, price, description });
      req.session = req.session || {};
      req.session.successMessage = 'Produit ajouté avec succès !';
      res.redirect('/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      res.status(500).render('error', { 
        title: 'Erreur',
        message: 'Erreur lors de la création du produit' 
      });
    }
  }
];

// Afficher le formulaire de modification
exports.showEditForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render('error', { 
        title: 'Produit non trouvé',
        message: 'Le produit que vous souhaitez modifier n\'existe pas.' 
      });
    }
    res.render('products/edit', { 
      title: 'Modifier le produit', 
      product,
      errors: null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).render('error', { 
      title: 'Erreur',
      message: 'Erreur lors de la récupération du produit' 
    });
  }
};

// Mettre à jour un produit
exports.updateProduct = [
  productValidationRules(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('products/edit', {
        title: 'Modifier le produit',
        errors: errors.array(),
        product: { id: req.params.id, ...req.body },
        errorMessage: errors.array()[0].msg
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { name, price, description } = req.body;
      const updated = await Product.update(req.params.id, { name, price, description });
      if (updated) {
        req.session = req.session || {};
        req.session.successMessage = 'Produit modifié avec succès !';
        res.redirect('/products');
      } else {
        res.status(404).render('error', { 
          title: 'Produit non trouvé',
          message: 'Le produit que vous souhaitez modifier n\'existe pas.' 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      res.status(500).render('error', { 
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour du produit' 
      });
    }
  }
];

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (deleted) {
      req.session = req.session || {};
      req.session.successMessage = 'Produit supprimé avec succès !';
      res.redirect('/products');
    } else {
      res.status(404).render('error', { 
        title: 'Produit non trouvé',
        message: 'Le produit que vous souhaitez supprimer n\'existe pas.' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).render('error', { 
      title: 'Erreur',
      message: 'Erreur lors de la suppression du produit' 
    });
  }
};