const router = require('express').Router();

router.use('/', require('./Login'));
router.use('/', require('./Edit'));
router.use('/', require('./Delete'));
router.use('/', require('./noteCreate'));
router.use('/', require('./noteDelete'));
router.use('/', require('./noteEdit'));
router.use('/', require('./Notes'));
router.use('/', require('./Register'));
router.use('/', require('./cronJob'));
router.use('/', require('./cronDeleteNotes'));
router.use('/', require('./cronDeleteUsers'));
router.use('/', require('./404Route'));

module.exports = router;