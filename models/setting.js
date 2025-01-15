const db = require('../config/bd');
class Setting {
    static async getSetting(){
      const conn = await db.getConnection();
      const [rows] = await conn.query('SELECT * FROM setting');
      conn.release();
      return {data : rows};
    }  
    static async createSetting(setting) {
      const conn = await db.getConnection();
      const { pendapatan, beban,modal } = setting;
     
      const rows = await conn.query(`INSERT INTO setting (no,pendapatan, beban,modal) VALUES (1,?,?,?) 
        ON DUPLICATE KEY UPDATE pendapatan=values(pendapatan), 
        beban=values(beban),modal=values(modal)`, [pendapatan, beban,modal]);
      conn.release();
      return {data : rows};
    }
  }
  
  module.exports = Setting;