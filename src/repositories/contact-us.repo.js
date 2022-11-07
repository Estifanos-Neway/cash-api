const { ContactUs } = require("../entities");
const utils = require("../commons/functions");
const config = require("../configs");
const rc = require("../commons/response-codes");
const rt = require("../commons/response-texts");
const emailSubjects = require("../assets/emails/email-subjects.json");

module.exports = {
    send: async ({ fullName, phone, email, address, message }) => {
        const contactUs = new ContactUs({ fullName, phone, email, address, message });
        if (!contactUs.hasValidFullName()) {
            throw utils.createError(rt.invalidFullName, rc.invalidInput);
        } else if (!contactUs.hasValidPhone()) {
            throw utils.createError(rt.invalidPhone, rc.invalidInput);
        } else if (!contactUs.hasValidEmail()) {
            throw utils.createError(rt.invalidEmail, rc.invalidInput);
        } else if (!contactUs.hasValidAddress()) {
            throw utils.createError(rt.invalidAddress, rc.invalidInput);
        } else if (!contactUs.hasValidMessage(true)) {
            throw utils.createError(rt.invalidMessage, rc.invalidInput);
        } else {
            const html = contactUs.toEmailHtml();
            const subject = emailSubjects.contactUs;
            await utils.sendEmail({ subject, html, to: config.contactUsEmailTo });
            return true;
        }
    }
};