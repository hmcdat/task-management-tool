const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
        user: process.env.EMAIL_USER || "hmcdat@gmail.com",
        pass: process.env.EMAIL_PASS || "123456789",
    },
});

const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "HMCDAT"}" <${process.env.EMAIL_FROM_ADDRESS || "hmcdat@gmail.com"}>`,
        to,
        subject,
        html,
    };

    return await transporter.sendMail(mailOptions);
};

const emailAccessCode = async (to, code) => {
    const html = `
        Dear user,<br/><br/>
        Your login code is: <strong>${code}</strong><br/>
        This code will expire in 3 minutes.<br/><br/>
        Regards,<br/>
        Technical Team.
    `;
    return await sendEmail(to, "[Task Management] Your Access Code", html);
};

const emailAccountSetup = async (to, setupToken) => {
    const setupUrl = encodeURIComponent(`${process.env.FRONTEND_URL || "http://localhost:3000"}/account-setup/${to}/${setupToken}`);
    const html = `
        Dear user,<br/><br/>
        Please click the link below to set up your account:<br/>
        <a href="${setupUrl}">${setupUrl}</a><br/><br/>
        Regards,<br/>
        Technical Team.
    `;
    return await sendEmail(to, "[Task Management] Set Up Your Account", html);
};

module.exports = {
    sendEmail,
    emailAccessCode,
    emailAccountSetup,
};