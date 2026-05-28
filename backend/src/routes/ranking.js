const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/rankingController');
const { verifyToken } = require('../middleware/auth');

router.get('/',   verifyToken, ctrl.getRanking);
router.get('/me', verifyToken, ctrl.getMyStats);

module.exports = router;
