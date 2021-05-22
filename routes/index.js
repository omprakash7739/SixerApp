const router = require('express').Router();
const {Users, Players, Wallets} = require('../models/schema');
const {HTTP_STATUS_CODE} = require('../lib/constants');
/* GET home page. */

const buyCheck = (wallet, playerId, quantity, priceOfOnePlayer) => {
    let res = {hasRequiredAmount: false};
    let requiredAmount = parseInt(quantity.toString()) * parseInt(priceOfOnePlayer.toString());
    if (wallet.balance >= requiredAmount) res.hasRequiredAmount = true;
    return res;
};


const buyPlayer = async (req, res, next) => {
    let playerId = req.body.playerId;
    let quantity = req.body.quantity;
    let userId = req.params.userId;
    if (playerId && quantity && userId) {
        userId = userId.toString().trim();
        let user = await Users.findOne({userId: userId});
        if (user) {
            let wallet = await Wallets.findOne({userId: userId});
            let players = wallet.players;
            let priceDetails = await Players.findOne({playerId: playerId});
            if (priceDetails && priceDetails.availableStocks >= parseInt(quantity.toString())) {
                let preCheck = buyCheck(wallet, playerId, quantity, priceDetails.playerId);
                if (preCheck.hasRequiredAmount) {
                    quantity = parseInt(quantity.toString());
                    players[playerId] = players[playerId] ? parseInt(players[playerId]) + quantity : quantity;
                    await Players.findOneAndUpdate({playerId: playerId}, {$dec: {availableStocks: quantity}});
                    let updatedWallet = await Wallets.findOneAndUpdate({userId: userId}, {$set: {players: players}}, {new: true});
                    return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                        message: 'Brought successfully',
                        status: 1,
                        wallet: updatedWallet
                    }).end();
                }
            } else {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    message: 'Player doesn\'t exist or required quantity is not available.',
                    status: 0
                }).end();
            }
        } else {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({message: 'Oops ! User Not Found', status: 0}).end();
        }

    } else {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({message: 'Missing require fields', status: 0}).end();
    }
};

const sellChecks = (wallet, playerId, quantity) => {
    let res = {hasRequiredAmount: false, hasPlayer: false};
    if (wallet.hasOwnProperty('playerId')) {
        res.hasPlayer = true;
        if (wallet[playerId] >= quantity) {
            res.hasRequiredAmount = true;
        }
    }
    return res;
};

const sellPlayer = async (req, res, next) => {
    try {
        let playerId = req.body.playerId;
        let quantity = req.body.quantity;
        let userId = req.params.userId;
        if (playerId && quantity) {
            quantity = parseInt(quantity.toString());
            let wallet = await Wallets.findOne({userId: userId}, {_id: 0, __v: 0});
            if (wallet) {
                let preCheck = sellChecks(wallet, playerId, quantity);
                if (preCheck.hasRequiredAmount) {
                    await Players.findOneAndUpdate({playerId: playerId}, {$inc: {quantity}});
                    let updatedWallet = await Wallets.findOneAndUpdate({userId: userId}, {$dec: {playerId: -quantity}}, {new: true});
                    return res.status(HTTP_STATUS_CODE.SUCCESS).json({
                        message: 'Sold Successfully',
                        wallet: updatedWallet
                    }).end();
                }
            } else {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({message: 'User Not Found', status: 0}).end();
            }
        } else {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({message: 'Oops ! Invalid params', status: 0}).end();
        }
    } catch (e) {
        console.error(e);
        return res.status(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE).json({
            message: 'Oops ! somethging went wrong.',
            status: 0
        }).end();
    }
};

const initPlayer = async (req, res, next) => {
    let players = [{playerId: 1, firstName: 'virat', lastName: 'kohali', availableStocks: 10}, {
        playerId: 2,
        firstName: 'Virendar',
        lastName: 'Sehwaag',
        availableStocks: 10
    }, {playerId: 3, firstName: 'Sachin', lastName: 'Tendulakar', availableStocks: 10}, {
        playerId: 4,
        firstName: 'Mahendra singh',
        lastName: 'Dhoni',
        availableStocks: 10
    }, {playerId: 5, firstName: 'Rohit', lastName: 'Sharma', availableStocks: 10}, {
        playerId: 6,
        firstName: 'kapil',
        lastName: 'Dev',
        availableStocks: 10
    }];

    players = players.map(d => {return {insertOne: d}});
    await Players.bulkWrite(players);
    return res.status(HTTP_STATUS_CODE.SUCCESS).json({message: 'Players Added'}).end();
};


router.get('/init', [initPlayer]);
router.post('/sellPlayer/:userId', [sellPlayer]);
router.post('/buyPlayer/:userId', [buyPlayer]);

module.exports = router;
