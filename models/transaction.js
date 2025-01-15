const db = require('../config/bd');
const Account = require('../models/account');
const Setting = require('../models/setting');
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
        const query = `SELECT a.code,a.name, 
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

 
  static async getAdjustedTrialBalance() {
    const neraca_saldo = await this.getTrialBalance();
    const penyesuaian  = await this.getAdjustments();
    var rows =neraca_saldo.data;
    var saldo =neraca_saldo.data;
    var sesuaikan = penyesuaian.data;
   for (let x=0;x<saldo.length;x++) {
      for(let y=0; y <sesuaikan.length;y++){  
          var tmp = saldo[x];
          var debit_saldo = parseInt(saldo[x].debit);
          var kredit_saldo = parseInt(saldo[x].kredit);
          var debit_penyesuaian = parseInt(sesuaikan[y].debit);
          var kredit_penyesuaian = parseInt(sesuaikan[y].kredit);
          
          if(saldo[x].code === sesuaikan[y].code){
            if((debit_saldo !== 0 && debit_penyesuaian !==0) && (kredit_saldo === 0 && kredit_penyesuaian ===0)){ 
              tmp.debit = parseInt(debit_saldo) + parseInt(debit_penyesuaian);
              sesuaikan.splice(y, 1);
            }    
            if(((debit_saldo === 0 && debit_penyesuaian ===0))&&(kredit_saldo !== 0 && kredit_penyesuaian !==0)){
              tmp.kredit = parseInt(kredit_saldo) + parseInt(kredit_penyesuaian);
            } 
            if(debit_saldo !== 0 && kredit_penyesuaian !==0){
              tmp.debit = parseInt(debit_saldo) - parseInt(kredit_penyesuaian);
              sesuaikan.splice(y, 1);
            }
          }
          rows[x] = tmp;
      }  
    }
    var tmp_rows = sesuaikan.filter(f => !rows.includes(f));
    const result = rows.concat(tmp_rows);
    return {data : result};
  }
  static async getIncomeStatement() {
    const tmpSetting = await Setting.getSetting();
    const setting = tmpSetting.data;
    const pendapatan = setting[0].pendapatan;
    const beban = setting[0].beban;
    const tmpSaldoSesuai = await this.getAdjustedTrialBalance();
    const SaldoSesuai = tmpSaldoSesuai.data;
    let rows=[];
    
    for(let x in SaldoSesuai){
      
      if(SaldoSesuai[x].code >=pendapatan && SaldoSesuai[x].code <= (pendapatan+99) ){
        rows.push(SaldoSesuai[x]);
      }
      if(SaldoSesuai[x].code >=beban && SaldoSesuai[x].code <= (beban+99) ){
        rows.push(SaldoSesuai[x]);
      }
    }
     return {data : rows};
  }
  static async getModal() {
    const tmpSetting = await Setting.getSetting();
    const setting = tmpSetting.data;
    const modal = setting[0].modal;
    const tmpSaldoSesuai = await this.getAdjustedTrialBalance();
    const SaldoSesuai = tmpSaldoSesuai.data;
    let rows=[];
    
    for(let x in SaldoSesuai){
      
      if(SaldoSesuai[x].code >=modal && SaldoSesuai[x].code <= (modal+99) ){
        rows.push(SaldoSesuai[x]);
      }
    }
     return {data : rows};
  }
  //neraca
  static async getBalanceSheet() {
    const tmpSetting = await Setting.getSetting();
    const tmpsaldoSesuai = await this.getAdjustedTrialBalance();
    const setting = tmpSetting.data;
    const saldoSesuai = tmpsaldoSesuai.data;
    const dataSetting = [];
    const rows = [];
    for(let i =0;i<100;i++){
        dataSetting.push((setting[0].pendapatan)+i);
        dataSetting.push((setting[0].modal)+i);
        dataSetting.push((setting[0].beban)+i);
    }
    for(let j in saldoSesuai){
      if(dataSetting.indexOf(saldoSesuai[j].code) === -1){
         rows.push(saldoSesuai[j]);
      }
    }
    return {data : rows};
  }
  static async getNelacaLajur(){
    const neracaSaldo = await this.getTrialBalance();
    const neracaPenyesuaian = await this.getAdjustments();
    const saldoPenyesuaian = await this.getAdjustedTrialBalance();
    const rugiLaba = await this.getIncomeStatement();
    const modal = await this.getModal();
    const neraca = await this.getBalanceSheet();
    const accun = await Account.getAccounts();
    const rows = [];
    const jumTotal = {"debitSaldo":0,"kreditSaldo":0,"debitSesuai":0,"kreditSesuai":0,
      "debitSaldoSesuai":0,"kreditSaldoSesuai":0,"debitLabaRugi":0,"kreditLabaRugi":0,
      "debitModal":0,"kreditModal":0,"debitNeraca":0,"KreditNeraca":0};
    const labaBersih = {"bersihDebit":0};  
    for(let i =0;i<accun.data.length;i++){
      const akun = {"code" : accun.data[i].code,"name":accun.data[i].name};   
      rows[i] = {akun};
      neracaSaldo.data.find(item =>{
        if(item.code === accun.data[i].code){
          const neracaSaldo = {"debit" : item.debit,"kredit":item.kredit};
          rows[i] = {...rows[i],neracaSaldo};
          jumTotal.debitSaldo += parseInt(neracaSaldo.debit);
          jumTotal.kreditSaldo += parseInt(neracaSaldo.kredit);  
        }
      });
      neracaPenyesuaian.data.find(item => {
        if(item.code === accun.data[i].code){
          const neracaPenyesuaian = item;
          rows[i] = { ...rows[i], neracaPenyesuaian};
          jumTotal.debitSesuai += parseInt(neracaPenyesuaian.debit);
          jumTotal.kreditSesuai += parseInt(neracaPenyesuaian.kredit);
        } 
      });
      saldoPenyesuaian.data.find(item =>{
        if(item.code === accun.data[i].code){
          const saldoPenyesuaian = item;
          rows[i] = { ...rows[i], saldoPenyesuaian};
          jumTotal.debitSaldoSesuai += parseInt(saldoPenyesuaian.debit);
          jumTotal.kreditSaldoSesuai += parseInt(saldoPenyesuaian.kredit);
        }  
      });
      rugiLaba.data.find(item =>{
        if(item.code === accun.data[i].code){ 
          const rugiLaba = item;
          rows[i] = { ...rows[i], rugiLaba};
          jumTotal.debitLabaRugi += parseInt(rugiLaba.debit);
          jumTotal.debitLabaRugi += parseInt(rugiLaba.kredit);
        }  
      });
      modal.data.find(item =>{
        if(item.code === accun.data[i].code){
          const neracaModal = item;
          rows[i] = { ...rows[i], neracaModal};
          jumTotal.debitModal += parseInt(neracaModal.debit);
          jumTotal.kreditModal += parseInt(neracaModal.kredit);
        }  
      });
      neraca.data.find(item => {
        if(item.code === accun.data[i].code){
          const neracaNeraca = item;
          rows[i] = { ...rows[i], neracaNeraca};
          jumTotal.debitNeraca += parseInt(neracaNeraca.debit);
          jumTotal.KreditNeraca += parseInt(neracaNeraca.kredit);
        }  
      });
    }
    labaBersih.bersihDebit = jumTotal.kreditLabaRugi -jumTotal.debitLabaRugi;
    jumTotal.kreditModal = jumTotal.kreditModal + labaBersih.bersihDebit;
    jumTotal.debitModal = jumTotal.kreditModal - jumTotal.debitModal; 
    jumTotal.KreditNeraca = jumTotal.KreditNeraca + jumTotal.debitModal;
    
     
   
    return {data : rows,total : jumTotal,bersih : labaBersih};
  }


  static async calculateTax(taxRate){
    const conn = await db.getConnection();
    const query = `
      SELECT 
        a.id AS account_id, 
        a.name AS account_name,
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) * ? AS tax
      FROM accounts a
      LEFT JOIN transaction t ON a.id = t.account_id
      GROUP BY a.id, a.name;
    `;
    const [rows] = await conn.query(query, [taxRate]);
    conn.release();
    return {data : rows};
  }
}

module.exports = Transaction;