const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountsController = require('../controllers/accountController')

function asyncHandler(callback) {
    return async (req, res, next) => {
        try {
        await callback(req, res, next);
        } catch (error) {
        next(error);
        }
    };
}

router.get('/', asyncHandler(accountsController.myAccount));

module.exports = router;