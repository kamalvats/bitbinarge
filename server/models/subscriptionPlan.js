const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
import { type } from 'joi/lib/types/object';
import status from '../enums/status';
import subscriptionPlanType from '../enums/subscriptionPlanType';

const schema = mongoose.Schema;
const subscriptionPlanSchema = new schema({
    value: {
        type: String
    },
    recursiveValue: { type: String },
    planId: {
        type: String
    },
    validity: {
        type: String
    },
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user',
    },
    type: {
        type: String,
        // enum:[subscriptionPlanType.FREE,subscriptionPlanType.LIGHT,subscriptionPlanType.ADVANCE,subscriptionPlanType.PRO]
    },
    title: { type: String },
    tradeFee: { type: String },
    description: { type: String },
    planStatus: { type: String, enum: ["ACTIVE", "INACTIVE"] },
    currency: { type: String },
    planDuration: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    exchangeUID: { type: Array },
    arbitrageName: { type: Array },
    pairs: { type: Array },
    capital: { type: Number },
    profits: { type: Number },
    coinType: { type: String, enum: ["USD", "FIERO", "NOT"], default: "NOT" },
    isFuelDeduction: { type: Boolean, default: false },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    },
    subscriptionType:{
        type: String,
        enum: [subscriptionPlanType.PAID, subscriptionPlanType.CUSTOM, subscriptionPlanType.FREE],
        default:subscriptionPlanType.PAID
    },
    show:{
        type: Boolean,
        default:false
    }
}, { timestamps: true });
subscriptionPlanSchema.plugin(mongoosePaginate);
subscriptionPlanSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("subsciptionPlan", subscriptionPlanSchema);
