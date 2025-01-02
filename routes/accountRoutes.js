const express = require('express');
const accountController = require('../controllers/accountController');
const router = express.Router();

router.get('/', accountController.getAccounts);
router.get('/list', accountController.getListAccounts);
router.post('/send', accountController.createAccount);

module.exports = router;