const router = require('express').Router();
const {getUniqueId} = require('../lib/uuidGenerator');
const {HTTP_STATUS_CODE} = require('../lib/constants');
const {Users, Wallets} = require('../models/schema');
/* GET users listing. */

router.post('/add', async function (req, res, next) {
    let email = req.body.email;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    if (email && firstName && lastName) {
        let user = await Users.findOne({email: email.toString().toLowerCase().trim()});
        if (user) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({message: 'User already exist', status: 0}).end();
        } else {
            let userParams = {
                userId: getUniqueId(),
                email: email.toString().toLowerCase().trim(),
                firstName: firstName.toString().trim(),
                lastName: lastName.toString().trim()
            };
            let newUser = new Users(userParams);
            const wallet = {userId: userParams.userId, balance: 0.0, players: {}};
            let walletAssociated = new Wallets(wallet);
            newUser.save(e => {
                if (e) {
                    console.error(e);
                    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                        message: 'Oops ! something went wrong.',
                        status: 0
                    }).end();
                } else {
                    walletAssociated.save(er => {
                        if (er) {
                            console.error(er);
                            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                                message: 'Oops ! something went wrong.',
                                status: 0
                            }).end();
                        } else {
                            return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                                message: 'user added successfully',
                                user: userParams
                            }).end();
                        }
                    });
                }
            });
        }
    } else {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            message: 'Oops ! invalid params provided',
            status: 0
        }).end();
    }
});

module.exports = router;
