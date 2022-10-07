const { createHash } = require("crypto");
const validator = require("validator");
const cryptoJS = require("crypto-js");
const shortUniqueId = require("short-unique-id");
const nodemailer = require("nodemailer");
const color = require("cli-color");
const _ = require("lodash");
const { env } = require("../env");
const { requiredParamsNotFoundResponseText } = require("./response-texts");

function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}

function hasValue(object) {
    if (_.isNumber(object)) return true;
    else if (_.isUndefined(object) || _.isEmpty(object)) return false;
    else return true;
}

function hasSingleValue(object) {
    return _.isNumber(object) || (_.isString(object) && !_.isEmpty(object));
}

function isNonEmptyString(object) {
    return _.isString(object) && !_.isEmpty(object);
}

function isEmail(email) {
    // @ts-ignore
    return _.isString(email) && validator.isEmail(email);
}

function createResult(success, result) {
    return { success, result: _.isUndefined(result) ? null : result };
}

function createVerificationCode(length = 6) {
    // @ts-ignore
    const uid = new shortUniqueId({ length, dictionary: "alpha_upper" });
    return uid();
}

async function sendEmail({ subject, html, to, from = env.EMAIL_FROM, smtpUrl = env.SMTP_URL }) {
    if (!hasSingleValue(to) ||
        !hasSingleValue(subject) ||
        !hasSingleValue(html)) {
        throw new Error(requiredParamsNotFoundResponseText);
    } else {
        const mailOptions = { from, to, subject, html };
        const transporter = nodemailer.createTransport(smtpUrl);
        return await transporter.sendMail(mailOptions);
    }
}

function encrypt(original) {
    // @ts-ignore
    return cryptoJS.AES.encrypt(JSON.stringify(original), env.PRIVATE_KEY).toString();
}

function decrypt(encrypted) {
    // @ts-ignore
    return cryptoJS.AES.decrypt(encrypted, env.PRIVATE_KEY).toString(cryptoJS.enc.Utf8);
}

function hash(string){
    return createHash("sha256").update(string).digest("hex");
}
module.exports = {
    errorLog,
    hasValue,
    hasSingleValue,
    isNonEmptyString,
    createResult,
    createVerificationCode,
    sendEmail,
    encrypt,
    decrypt,
    isEmail,
    hash
};