const { createHash } = require("crypto");
const validator = require("validator");
const cryptoJS = require("crypto-js");
const shortUniqueId = require("short-unique-id");
const nodemailer = require("nodemailer");
const color = require("cli-color");
const _ = require("lodash");
const mimeTypes = require("mime-types");
const isImage = require("is-image");
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

function hasMultiValue(object) {
    return hasValue(object) && !hasSingleValue(object);
}

function isNonEmptyString(object) {
    return _.isString(object) && !_.isEmpty(object);
}

function isPositiveNumber(object) {
    return _.isNumber(object) && object >= 0;
}
function isEmail(email) {
    // @ts-ignore
    return _.isString(email) && validator.isEmail(email);
}

function createResult(success, result) {
    return { success, result: _.isUndefined(result) ? null : result };
}

function createUid(length = 32) {
    // @ts-ignore
    const uid = new shortUniqueId({ length });
    return uid();
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

function hash(string) {
    return createHash("sha256").update(string).digest("hex");
}

async function pipe(readable, writable) {
    return new Promise((resolve, reject) => {
        function handleError(error) {
            reject(error);
        }
        readable
            .on("error", handleError)
            .pipe(writable)
            .on("error", handleError)
            .on("finish", () => resolve(null));
    });
}

function isImageMime(mime) {
    return isImage(`sudo.${mimeTypes.extension(mime)}`);
}

function removeUndefined(object) {
    Object.keys(object).forEach(key => {
        if (object[key] === undefined) {
            delete object[key];
        }
    });
    return object;
}

module.exports = {
    errorLog,
    hasValue,
    hasSingleValue,
    hasMultiValue,
    isNonEmptyString,
    createResult,
    createUid,
    createVerificationCode,
    sendEmail,
    encrypt,
    decrypt,
    isEmail,
    hash,
    isPositiveNumber,
    pipe,
    isImageMime,
    removeUndefined
};