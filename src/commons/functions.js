const gvc = require("generate-sms-verification-code");
const nodemailer = require("nodemailer");
const color = require("cli-color");
const _ = require("lodash");
const { env } = require("../env");
const { requiredParamsNotFoundResponseText } = require("./variables");
function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}

function hasValue(element) {
    if (_.isNumber(element)) return true;
    else if (_.isUndefined(element) || _.isEmpty(element)) return false;
    else return true;
}

function createResult(success, result) {
    return { success, result: _.isUndefined(result) ? null : result };
}

function createVerificationCode() {
    return gvc(6, { type: "string" });
}

async function sendEmail({ subject, html, to, from = env.EMAIL_FROM, smtpUrl = env.SMTP_URL }) {
    if (!hasValue(to) ||
        !hasValue(subject) ||
        !hasValue(html)) {
        throw new Error(requiredParamsNotFoundResponseText);
    } else {
        const mailOptions = { from, to, subject, html };
        const transporter = nodemailer.createTransport(smtpUrl);
        return await transporter.sendMail(mailOptions);
    }
}
async function sendEmailVerificationCode(email) {
    const verificationCode = createVerificationCode();
    const subject = "Email verification";
    const html = `Verification code: ${verificationCode}`;
    await sendEmail({subject, html, to:email});
    const verificationToken = `${email}:${verificationCode}`;
    return verificationToken;
}

module.exports = {
    errorLog,
    hasValue,
    createResult,
    createVerificationCode,
    sendEmailVerificationCode
};