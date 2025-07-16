import Mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import status from '../enums/status';

const options = {
    collection: "fuelWalletDeductionHistory",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        profit: {type: Number},
        amount: { type: Number },
        coinName: { type: String, enum: ["FIERO", "USD"] },
        subscriptionId: { type: Schema.Types.ObjectId, ref: 'buySubsciptionPlanHistory' },
        arbitrageName:{type: String},
        userId: { type: Schema.Types.ObjectId, ref: 'user' },
        triangularId: { type: Schema.Types.ObjectId, ref: 'triangularArbitrage' },
        intraId: { type: Schema.Types.ObjectId, ref: 'intraArbitrageSingleExchange' },
        directId: { type: Schema.Types.ObjectId, ref: 'directArbitrage' },
        transactionType: { type: String },
        status: {
            type: String, default: status.ACTIVE,
            enum: [status.ACTIVE, status.BLOCK, status.DELETE]
        }
    },
    options
);

schemaDefination.plugin(mongoosePaginate);
module.exports = Mongoose.model("fuelWalletDeductionHistory", schemaDefination);