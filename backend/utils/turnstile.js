const captchaVerify = async (captchaResponse, remoteip) => {
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', captchaResponse);
    formData.append('remoteip', remoteip);

    try {
        let verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });

        let response = await verify.json();

        return response.success;
    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = { captchaVerify };