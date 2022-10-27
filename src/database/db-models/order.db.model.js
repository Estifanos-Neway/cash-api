const mongoose = require("mongoose");
const utils = require("../../commons/functions");
const { Order } = require("../../entities");

const required = true;
const orderSchema = new mongoose.Schema(
    {
        product: {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product",
                required
            }
        },
        orderedBy: {
            fullName: {
                type: String,
                required
            },
            phone: {
                type: String,
                required,
                validate: {
                    validator: (value) => {
                        utils.isPhone(value);
                    },
                    message: "Invalid_Phone"
                }
            },
            companyName: String
        },
        affiliateId: mongoose.Schema.Types.ObjectId,
        status: {
            type: String,
            enum: Object.keys(Order.statuses),
            default: Order.statuses.Pending
        }
    },
    {
        timestamps: {
            createdAt: "orderedAt",
            updatedAt: false
        },
        strictQuery: false
    }
);

module.exports = mongoose.model("Order", orderSchema, "orders");