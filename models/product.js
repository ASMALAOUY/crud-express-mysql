const { getDb } = require('../config/db');

class Product {
  static async findAll(page = 1, limit = 10, search = '') {
    const db = getDb();
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products';
    let whereClause = '';
    const params = [];
    
    if (search) {
      whereClause = ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += whereClause + ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const products = await db.all(query, params);
    
    let totalQuery = 'SELECT COUNT(*) as total FROM products';
    if (search) {
      totalQuery += ' WHERE name LIKE ? OR description LIKE ?';
    }
    const totalResult = await db.get(totalQuery, search ? [`%${search}%`, `%${search}%`] : []);
    
    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalResult.total / limit),
        totalItems: totalResult.total,
        hasPrev: page > 1,
        hasNext: page < Math.ceil(totalResult.total / limit)
      }
    };
  }

  static async findById(id) {
    const db = getDb();
    return await db.get('SELECT * FROM products WHERE id = ?', [id]);
  }

  static async create(productData) {
    const db = getDb();
    const { name, price, description } = productData;
    const result = await db.run(
      'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
      [name, price, description || null]
    );
    return result.lastID;
  }

  static async update(id, productData) {
    const db = getDb();
    const { name, price, description } = productData;
    const result = await db.run(
      'UPDATE products SET name = ?, price = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, price, description || null, id]
    );
    return result.changes > 0;
  }

  static async delete(id) {
    const db = getDb();
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = Product;