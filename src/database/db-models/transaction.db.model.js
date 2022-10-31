const mongoose = require("mongoose");
const utils = require("../../commons/functions");
const { Transaction } = require("../../entities");

const required = true;
const transactionSchema = new mongoose.Schema(
    {
        affiliate: {
            userId: {
                type: mongoose.Types.ObjectId,
                required,
                ref: "Affiliate"
            }
        },
        amount: {
            type: Number,
            validate: {
                validator: utils.isPositiveNumber,
                message: "Can't_Be_Negative"
            },
            required
        },
        reason: {
            kind: {
                type: String,
                required,
                enum: Object.keys(Transaction.Reason.kinds)
            },
            affiliate: {
                userId: {
                    type: mongoose.Types.ObjectId,
                    required: function () {
                        // @ts-ignore
                        const kind = this.kind;
                        return (
                            kind === Transaction.Reason.kinds.BecomeParent ||
                            kind === Transaction.Reason.kinds.ChildBecomeParent ||
                            kind === Transaction.Reason.kinds.ChildSoldProduct
                        );
                    },
                    ref: "Affiliate"
                }

            },
            productId: {
                type: mongoose.Types.ObjectId,
                required: function () {
                    // @ts-ignore
                    const kind = this.kind;
                    return (
                        kind === Transaction.Reason.kinds.SoldProduct ||
                        kind === Transaction.Reason.kinds.ChildSoldProduct
                    );
                },
                ref: "Product"
            }
        }
    },
    {
        timestamps: {
            createdAt: "transactedAt",
            updatedAt: false
        },
        strictQuery: false
    }
);

module.exports = mongoose.model("Transaction", transactionSchema, "transactions");