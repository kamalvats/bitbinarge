
import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import aggregatePaginate from "mongoose-aggregate-paginate";
import status from '../enums/status';
import { type } from "joi/lib/types/object";

var transactionModel = new Schema(
    {
        amount: {
            type: Number
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        withdrawalAddress: {
            type: String
        },
        order_id: {
            type: String
        },
        transactionHash: { type: String },
        transactionType: {
            type: String,
            enum: ["DEPOSIT", "WITHDRAW","BUY","TRADE","REWARD","SUBSCRIBED","CLAIMED","DEDUCTION","TRANSFER"],
        },
        transactionSubType:{
            type: String
        },
        depositedBy: {
            type: String
        },
        walletType: {
            type: String
        },
        reason: {
            type: String
        },
        status: {
            type: String,
            enum: ["PENDING","CANCELED","COMPLETED","APPROVED","REJECTED"],
            default:"PENDING"
        },
        profitPath:{type:Object},
        subscriptionPlanId:{type:Schema.Types.ObjectId,ref:"poolingSubscriptionPlan"},
        subscriptionPlanIdBot:{type:Schema.Types.ObjectId,ref:"buySubsciptionPlanHistory"},
        totalPlanInvestment:{type:Number},
        profit:{type:Number},
        profitPercentage:{type:Number},
        tradeAmount:{type:Number},
        trnasactionHash:{type:String},
        date:{type:Date},
        transferTo:{type:Schema.Types.ObjectId,ref:"user"},
        internalTransferTo:{type:String}
       },
    { timestamps: true }
);

transactionModel.plugin(mongoosePaginate);
transactionModel.plugin(aggregatePaginate);
module.exports = Mongoose.model("transaction", transactionModel);