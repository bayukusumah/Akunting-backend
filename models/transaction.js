const db = require('../config/bd');

class Transaction {
  static async getNoHalTransactions(type,hal){
    const conn = await db.getConnection();
    const [rows] = await conn.query('SELECT DISTINCT hal FROM transaction where type_jurnal =? and hal = ?',[type,hal]);
    conn.release();
    return {data: rows};
  }
  static async getAllTransactions(type,hal,page = 1, limit = 20) {
    const conn = await db.getConnection();
    const offset = (page - 1) * limit;
      const [totalCountRows] = await conn.query('SELECT COUNT(*) as total FROM transaction where type_jurnal =? and hal = ? ',[type,hal]);
      const total = totalCountRows[0].total;  
     const [rows] = await conn.query(`SELECT * FROM transaction where type_jurnal =? and hal = ? LIMIT ? OFFSET ?`,[type,hal,limit, offset]);
     conn.release();
      return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };     
  }

  static async createTransaction(transaction) {
    
    const conn = await db.getConnection();
    const { descriptions, type, amount, ref,date,type_jurnal,hal} = transaction;
    const [rows] = await conn.query(
      'INSERT INTO transaction (descriptions, type, amount, ref,date,type_jurnal,hal) VALUES (?, ?, ?, ?,?,?,?)',
      [descriptions, type, amount, ref,date,type_jurnal,hal]
    );
    conn.release();
    return {data : rows};
  }
    // Buku Besar
    static async getLedger(ref,page = 1, limit = 10) {
      const conn = await db.getConnection();
      const offset = (page - 1) * limit;
      const [totalCountRows] = await conn.query('SELECT COUNT(*) as total FROM transaction WHERE transaction.ref = ?',[ref]);
      const total = totalCountRows[0].total;
      const [rows] = await conn.query(`SELECT * from transaction t WHERE t.ref = ? LIMIT ? OFFSET ?`,
        [ref,limit, offset]
      );
      conn.release();
      for (let x in rows) {
        switch(rows[x].type_jurnal){
          case "penyesuaian":
             rows[x].hal = "JP"+rows[x].hal;
        }
      } 
      return {
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }
}

module.exports = Transaction;
