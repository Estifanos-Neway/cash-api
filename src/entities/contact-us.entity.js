const _ = require("lodash");
const utils = require("../commons/functions");
const fs = require("fs");
const path = require("path");
let contactUsEmail = fs.readFileSync(path.resolve("src", "assets", "emails", "contact-us.email.html"), { encoding: "utf-8" });
module.exports = class ContactUs {
    // fullName
    fullName;
    hasValidFullName() {
        return !!utils.isNonEmptyString(this.fullName) || _.isUndefined(this.fullName);
    }

    // phone
    #phone;
    set phone(phone) {
        const validPhone = utils.isPhone(phone);
        if (validPhone) {
            this.#phone = validPhone;
        } else {
            this.#phone = phone;
        }
    }
    get phone() {
        return this.#phone;
    }
    hasValidPhone() {
        const phone = this.phone;
        return !!utils.isPhone(phone) || _.isUndefined(phone);
    }

    // email
    #email;
    set email(email) {
        if (_.isString(email)) {
            email = email.toLowerCase();
        }
        this.#email = email;
    }
    get email() {
        return this.#email;
    }
    hasValidEmail(strict) {
        const email = this.email;
        return utils.isEmail(email) || (!strict && _.isUndefined(email));
    }

    // address
    address;
    hasValidAddress() {
        return !!utils.isNonEmptyString(this.address) || _.isUndefined(this.address);
    }

    // message
    message;
    hasValidMessage(strict) {
        return utils.isNonEmptyString(this.message) || (!strict && _.isUndefined(this.message));
    }

    constructor({ fullName, phone, email, address, message }) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.message = message;
    }

    toJson() {
        return utils.removeUndefined({
            fullName: this.fullName,
            phone: this.phone,
            email: this.email,
            address: this.address,
            message: this.message
        });
    }

    toEmailHtml() {
        contactUsEmail = utils.replaceAll(contactUsEmail, "-1-fullName-9-", this.fullName ?? "-");
        contactUsEmail = utils.replaceAll(contactUsEmail, "-1-phone-9-", this.phone ?? "-");
        contactUsEmail = utils.replaceAll(contactUsEmail, "-1-email-9-", this.email ?? "-");
        contactUsEmail = utils.replaceAll(contactUsEmail, "-1-address-9-", this.address ?? "-");
        contactUsEmail = utils.replaceAll(contactUsEmail, "-1-message-9-", this.message ?? "-");
        return contactUsEmail;
    }
};