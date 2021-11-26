const auth = require('../modules/authCheck.js');

const middleWare = async(req, res, next) => {
    try {
        if (await auth.authCheck(req) == true) {
            next();
        } else {
            return res.status(500).json({ error: 'Invalid auth credentials' });
        }
    } catch (e) {
        return res.status(500).json({ error: 'Invalid auth credentials' });
    }
}

module.exports = {
    middleWare: middleWare
}