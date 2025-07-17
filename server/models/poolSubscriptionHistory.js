const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
import { type } from 'joi/lib/types/object';
import status from '../enums/status';
import subscriptionPlanType from '../enums/subscriptionPlanType';

const schema = mongoose.Schema;
const poolSubscriptionHistorySchema = new schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    subscriptionPlanId: {
        type: mongoose.Types.ObjectId,
        ref: 'poolingSubscriptionPlan',
    },
    profit: {
        type: Number
    },
    totalProfit:{
        type:Number,
        default:0
    },
    investedAmount: {
        type: Number
    },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    },
}, { timestamps: true });
poolSubscriptionHistorySchema.plugin(mongoosePaginate);
poolSubscriptionHistorySchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("poolSubscriptionHistory", poolSubscriptionHistorySchema);
