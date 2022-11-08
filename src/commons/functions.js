const platform = require("platform");
const mongoose = require("mongoose");
const { phone } = require("phone");
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
const rt = require("./response-texts");
const config = require("../configs");

function errorLog(errorMessage, error) {
    console.error(color.red(errorMessage), color.red("\n[\n"), error, color.red("\n]"));
}
function replaceAll(str, find, replaceWith) {
    return str.split(find).join(replaceWith);
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

function isPhone(value) {
    let phoneInfo = phone(value);
    if (phoneInfo.isValid) {
        return phoneInfo.phoneNumber;
    } else {
        phoneInfo = phone(value, { country: config.defaultCountryForPhone });
        return phoneInfo.isValid && phoneInfo.phoneNumber;
    }
}

function createUid(length = 32) {
    // @ts-ignore
    const uid = new shortUniqueId({ length });
    return uid();
}

function createVerificationCode(length = 8) {
    // @ts-ignore
    const uid = new shortUniqueId({ length, dictionary: "alpha_upper" });
    return uid();
}

async function sendEmail({ subject, html, to, from = env.EMAIL_FROM, smtpUrl = env.SMTP_URL }) {
    if (!hasSingleValue(to) ||
        !hasSingleValue(subject) ||
        !hasSingleValue(html)) {
        throw new Error(rt.requiredParamsNotFound);
    } else {
        const mailOptions = { from, to, subject, html };
        const transporter = nodemailer.createTransport(smtpUrl);
        return await transporter.sendMail(mailOptions);
    }
}

function encrypt(original) {
    // @ts-ignore
    const base64String = cryptoJS.AES.encrypt(original, env.PRIVATE_KEY).toString();
    return cryptoJS.enc.Hex.stringify(cryptoJS.enc.Base64.parse(base64String));
}

function decrypt(encrypted) {
    const base64String = cryptoJS.enc.Base64.stringify(cryptoJS.enc.Hex.parse(encrypted));
    // @ts-ignore
    return cryptoJS.AES.decrypt(base64String, env.PRIVATE_KEY).toString(cryptoJS.enc.Utf8);
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
    createUid,
    createVerificationCode,
    sendEmail,
    encrypt,
    decrypt,
    isEmail,
    isPhone,
    hash,
    isPositiveNumber,
    pipe,
    isImageMime,
    removeUndefined,
    replaceAll,
    createError: (message, code = 0) => {
        const error = Error(message);
        // @ts-ignore
        error.code = code;
        return error;
    },
    sanitizeEmail: (originalEmail) => {
        if (isEmail(originalEmail) && /@gmail\.com$/.test(originalEmail)) {
            let sanitized = originalEmail.split("@")[0];
            sanitized = sanitized.split("+")[0];
            sanitized = replaceAll(sanitized, ".", "");
            return sanitized + "@gmail.com";
        } else {
            return originalEmail;
        }
    },
    isValidDbId: (value) => mongoose.Types.ObjectId.isValid(value),
    generateDbId: () => mongoose.Types.ObjectId.generate().toString("hex"),
    trim: (value) => _.isString(value) ? value.trim() : value,
    createUseragentDeviceString: (useragent) => {
        const info = platform.parse(useragent);
        console.dir(info, { depth: null });
        const os = info.os ?? "unknown";
        const browser = info.name ?? "unknown";
        return `${os} (${browser})`;
    }
};