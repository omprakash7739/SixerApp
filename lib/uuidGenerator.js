const uuid = require('uuid');

const getUniqueId = () => {
    return uuid.v4().toLowerCase();
};

module.exports = {
    getUniqueId
};
