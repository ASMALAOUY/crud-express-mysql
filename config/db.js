const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insertion de données de test
  const count = await db.get('SELECT COUNT(*) as count FROM products');
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO products (name, price, description) VALUES
      ('Ordinateur Portable Pro', 899.99, 'Ordinateur portable haute performance'),
      ('Smartphone Ultra', 699.99, 'Smartphone dernière génération'),
      ('Casque Audio Premium', 129.99, 'Casque audio sans fil')
    `);
  }
  
  console.log('Base de données SQLite initialisée');
  return db;
}

module.exports = { initializeDatabase, getDb: () => db };