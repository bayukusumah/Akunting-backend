const express = require('express');
const router = express.Router();

router.get('/',function(req,res,next){
    res.send('selamat data di akunting backend');
})
module.exports = router;