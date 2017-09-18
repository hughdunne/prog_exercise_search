var express = require('express');
var router = express.Router();

var db = require('../queries');

router.get('/api/user/search', db.searchUser);
router.get('/api/user/:id', db.getSingleUser);

module.exports = router;
