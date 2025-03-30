const crypto = require('crypto');

const RefferalCode = {
    generateReferralCode: function(length = 5) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from(crypto.randomBytes(length))
            .map(x => characters[x % characters.length])
            .join('');
    },

    generateUniqueReferralCode: function(existingCodes = []) {
        let code;
        do {
            code = this.generateReferralCode();
        } while (existingCodes.includes(code));
        return code;
    }
};

module.exports = RefferalCode;