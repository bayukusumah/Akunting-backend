const express = require('express');
const transactionController = require('../controllers/transactionController');
const router = express.Router();

router.get('/:type/hal', transactionController.getHalTransactions);
router.get('/:type/list', transactionController.getTransactions);
router.post('/send', transactionController.createTransaction); //jurnal umum
router.get('/ledger/:ref', transactionController.getLedger); //buku besar
router.get('/trial-balance', transactionController.getTrialBalance); //neraca saldo
router.get('/adjustments', transactionController.getAdjustments); // neraca penyesuaian
module.exports = router;
