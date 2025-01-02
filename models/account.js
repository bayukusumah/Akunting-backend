const db = require('../config/bd');
class Account {
    static async getAccounts(){
      const conn = await db.getConnection();
      const [rows] = await conn.query('SELECT * FROM accounts');
      conn.release();
      return {data : rows};
    }
    static async getAllAccounts(page = 1, limit = 10) {
      const conn = await db.getConnection();
      const offset = (page - 1) * limit;
      const [totalCountRows] = await conn.query('SELECT COUNT(*) as total FROM accounts');
      const total = totalCountRows[0].total;
      const pageOK = total / limit;
      const [rows] = await conn.query('SELECT * FROM accounts LIMIT ? OFFSET ?',[limit, offset]);
      conn.release();
      return {
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
  
    static async createAccount(account) {
      const conn = await db.getConnection();
      const { code, name, type } = account;
      const [rows] = await conn.query('INSERT INTO accounts (code, name) VALUES (?, ?)', [code, name]);
      conn.release();
      return {data : rows};
    }
  }
  
  module.exports = Account;