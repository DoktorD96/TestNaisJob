var express = require('express');
const { Error } = require('mongoose');
var router = express.Router();

// #Error 404 and other handling

router.use(function(req, res, next) {
    next(new Error('Not Found'))
});
router.use(function(err, req, res, next) {
    res.status(500).send({
        status: 500,
        message: '404 Internal error',
        type: 'internal'
    })
});

module.exports = router;