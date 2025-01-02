const Account = require('../models/account');

exports.getAccounts = async(req,res) =>{
    try{
      const accounts = await Account.getAccounts();
      res.json(accounts);
    }catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getListAccounts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {  
    const accounts = await Account.getAllAccounts(page, limit);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { code, name, type } = req.body;
    await Account.createAccount({ code, name, type });
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
