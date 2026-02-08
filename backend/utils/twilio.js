const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);

const sendSMSMessage = async (to, code) => {
    if (to.startsWith('0')) {
        to = '+84' + to.slice(1);
    } else if (to.startsWith('84')) {
        to = '+' + to;
    }
    
    return await client.verify.v2.services(serviceSid)
        .verifications
        .create({ to: to, channel: 'sms', customCode: code });
}

module.exports = {
    sendSMSMessage
};