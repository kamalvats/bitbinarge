import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import status from '../enums/status';

const options = {
    collection: "fuelWalletTransactionHistory",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        fromAddress: {
            type: String
        },
        walletType: {
            type: String
        },
        amount: { type: Number },
        transactionHash: { type: String },
        coinName: { type: String, enum: ["FIERO", "USD","NOT"] },
        transactionType: { type: String, enum: ["DEPOSIT", "WITHDRAW"] },
        userId: { type: Schema.Types.ObjectId, ref: 'user' },
        status: {
            type: String, default: status.ACTIVE,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE]
        }
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
module.exports = Mongoose.model("fuelWalletTransactionHistory", schemaDefination);