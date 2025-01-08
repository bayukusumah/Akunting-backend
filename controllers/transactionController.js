const Transaction = require('../models/transaction');

exports.getHalTransactions = async (req, res) =>{
  const page = parseInt(req.query.halaman, 1) || 1;
  try{
    const { type } = req.params;
    const hal = await Transaction.getNoHalTransactions(type,page);
    res.json(hal);
  }catch(error){
    res.status(500).json({error: error.message});
  }
}

exports.getTransactions = async (req, res) => {
  const hal = parseInt(req.query.halaman, 1) || 1;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 20) || 20;
  try {
    const { type } = req.params;
    const transactions = await Transaction.getAllTransactions(type,hal,page,limit);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//jurnal umum
exports.createTransaction = async (req, res) => {
  try {
    const { descriptions, type, amount, ref,date,type_jurnal,hal } = req.body;
    await Transaction.createTransaction({ descriptions, type, amount, ref,date,type_jurnal,hal });
     res.status(201).json({ message: 'Transaction created successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//neraca
exports.getBalanceSheet = async (req, res) => {
  try {
    const [balanceSheet] = await Transaction.getBalanceSheet();
    res.json(balanceSheet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// buku besar
exports.getLedger = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const { ref } = req.params;
    const ledger = await Transaction.getLedger(ref,page,limit);
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// neraca saldo
exports.getTrialBalance = async (req, res) => {
  try {
    //const { jurnal } = req.params;
    const trialBalance = await Transaction.getTrialBalance();
    res.json(trialBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//jurnal penyesuaian
exports.getAdjustments = async(req, res) => {
  try {
    //const { jurnal } = req.params;
    const trialBalance = await Transaction.getAdjustments();
    res.json(trialBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};