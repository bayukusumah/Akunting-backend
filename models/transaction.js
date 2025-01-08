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
// // Neraca saldo
static async getTrialBalance() {
const conn = await db.getConnection();
  const query = `SELECT 
                a.name,a.code, 
                SUM(CASE WHEN b.type = 'debit' THEN b.amount ELSE 0 END) AS debit,
                SUM(CASE WHEN b.type = 'kredit' THEN b.amount ELSE 0 END) AS kredit
            FROM 
                transaction b,accounts a where a.code = b.ref and b.type_jurnal <>'penyesuaian'
            GROUP BY ref;`;
  const [rows] = await  conn.query(query);
  conn.release();

  for (let x in rows) {
    var debit = rows[x].debit;
    var kredit = rows[x].kredit;
    if(debit !== 0 && kredit !==0){
      if(debit > kredit) {
        rows[x].debit = debit - kredit;
        rows[x].kredit =0;
      }
  }
  if(debit === 0 && kredit !==0){
    rows[x].debit = 0;
  }
  }
  return {data : rows};
}
  
  static async getAdjustments() {
    const conn = await db.getConnection();
    const query = `SELECT 
                    a.name,a.code, 
                    SUM(CASE WHEN b.type = 'debit' THEN b.amount ELSE 0 END) AS debit,
                    SUM(CASE WHEN b.type = 'kredit' THEN b.amount ELSE 0 END) AS kredit
                FROM 
                    transaction b,accounts a where a.code = b.ref and b.type_jurnal ='penyesuaian'
                     GROUP BY b.id`;
    const [rows] = await conn.query(query);
    conn.release();
    return {data : rows};
}
}

module.exports = Transaction;
