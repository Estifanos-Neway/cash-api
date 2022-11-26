const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const utils = require("../../commons/functions");
const { User } = require("../../entities");
const { imageJsonSchema } = require("./db-model.commons");
const config = require("../../configs");

const required = true;
const unique = true;
const affiliateSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required
        },
        phone: {
            type: String,
            required,
            unique,
            validate: {
                validator: utils.isPhone,
                message: "Invalid_Phone"
            }
        },
        email: {
            type: String,
            unique,
            required,
            validate: {
                validator: utils.isEmail,
                message: "Invalid_Email"
            }
        },
        sanitizedEmail: {
            type: String,
            unique: true,
            validate: {
                validator: utils.isEmail,
                message: "Invalid_Email"
            }
        },
        passwordHash: {
            type: String,
            required
        },
        avatar: imageJsonSchema,
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Affiliate",
            immutable: true
        },
        childrenCount: {
            type: Number,
            default: 0,
        },
        wallet: {
            totalMade: {
                type: Number,
                default: 0,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            },
            currentBalance: {
                type: Number,
                default: 0,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            },
            canWithdrawAfter: {
                type: Number,
                default: config.affiliatesWallet.canWithdrawAfter,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            }
        },
        affiliationSummary: {
            totalRequests: {
                type: Number,
                default: 0,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            },
            acceptedRequests: {
                type: Number,
                default: 0,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            },
            rejectedRequests: {
                type: Number,
                default: 0,
                validate: {
                    validator: utils.isPositiveNumber,
                    message: "Can't_Be_Negative"
                }
            }
        }
    },
    {
        strictQuery: false,
        timestamps: {
            createdAt: "memberSince",
            updatedAt: false
        }
    }
);
// @ts-ignore
affiliateSchema.pre("save", function (next) {
    this.sanitizedEmail = utils.sanitizeEmail(this.email);
    next();
});
affiliateSchema.pre("findOneAndUpdate", async function (next) {
    // @ts-ignore
    const newEmail = this.getUpdate()?.email;
    if (newEmail) {
        this.set({ sanitizedEmail: utils.sanitizeEmail(newEmail) });
    }
    next();
});

affiliateSchema.plugin(uniqueValidator);
module.exports = mongoose.model(User.userTypes.Affiliate, affiliateSchema, "affiliates");