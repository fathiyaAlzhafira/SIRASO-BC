const express = require('express');
const router = express.Router();
const historyController = require('../controller/historyController');
const authUser = require('../middleware/authUser');

router.get('/', historyController.getHistory);
router.delete('/delete-all', historyController.deleteAllHistory);

module.exports = router;
