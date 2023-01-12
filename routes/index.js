const router = module.exports = require('express').Router();

router.use('/', require('./landing'))


router.use('/oauth', require('./oauth'));

router.use('/owners', require('./owners'));

router.use('/pouches', require('./pouches'));
router.use('/seeds', require('./seeds'))
