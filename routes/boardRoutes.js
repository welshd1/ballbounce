const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

router.get('/', (req, res) => {
    res.render('../views/index.pug')
});

router.get('/hello', (req, res) => {
    res.send('hello world!');
});


router.get('/boards', boardController.getAllBoards);

module.exports = router;
