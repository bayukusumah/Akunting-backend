const express = require('express');
const transactionController = require('../controllers/transactionController');
const router = express.Router();

router.get('/:type/hal', transactionController.getHalTransactions);
router.get('/:type/list', transactionController.getTransactions);
router.post('/send', transactionController.createTransaction); //jurnal umum
router.get('/ledger/:ref', transactionController.getLedger); //buku besar
module.exports = router;
