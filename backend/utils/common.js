function safeUserOutput(user) {
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.setupToken;
    delete safeUser.accessCodeType;
    delete safeUser.accessCodeValidUntil;
    delete safeUser.accessCodeTryCount;
    delete safeUser.accessCode;
    return safeUser;
}

function validObjectId(data) {
   return /^[0-9a-fA-F]{24}$/.test(data);
}

module.exports = {
    safeUserOutput,
    validObjectId
};