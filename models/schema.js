const mongoose = require('mongoose');
const dbConfig = require('../config/dbConfig');
mongoose.set('useFindAndModify', false);

const DB_CONN = mongoose.createConnection(dbConfig.dbAddress,
    {useNewUrlParser: true, useUnifiedTopology: true},
    (err) => {
        console.error(err);
    });

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: ''
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0.0
    },
    players: {
        type: Object,
        default: {}
    }
});

const playerSchema = new mongoose.Schema({
    playerId: {
        type: String,
        index: true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: ''
    },
    currentPrice: {
        type:Number,
        required: true,
        default: 0.0
    },
    availableStocks: {
        type: Number,
        required: true,
        default: 0
    }
});

const Users = DB_CONN.model(dbConfig.userModelName, userSchema);
const Wallets = DB_CONN.model(dbConfig.walletModelName, walletSchema);
const Players = DB_CONN.model(dbConfig.playerModelName, playerSchema);

module.exports = {
    Users,
    Wallets,
    Players
};
