const express = require('express');
const catchErrors = require('../../lib/async-error');
const router = express.Router();


router.use(catchErrors(async (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        next({status: 401, msg: 'Unauthorized'});
    }
}));

router.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      status: err.status,
      msg: err.msg || err
    });
});


module.exports = router;
