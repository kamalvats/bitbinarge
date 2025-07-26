const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
import { type } from 'joi/lib/types/object';
import status from '../enums/status';
import subscriptionPlanType from '../enums/subscriptionPlanType';
import arbitrage from '../enums/arbitrage';

const schema = mongoose.Schema;
const subscriptionPlanSchema = new schema({
    value: {
        type: Number
    },
    yearlyValue: {
        type: Number
    },
    // recursiveValue: { type: String },
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
    planStatus: { type: String, enum: ["ACTIVE", "INACTIVE"],default:"ACTIVE" },
    // currency: { type: String },
    planDuration: { type: String },
    // startTime: { type: Date },
    // endTime: { type: Date },
    exchangeUID: { type: Array },
    arbitrageName: { type: Array },
    pairs: { type: Array },
    capital: { type: Number },
    profits: { type: Number },
    coinType: { type: String, enum: ["USD", "FIERO", "NOT"], default: "USD" },
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
    fuelWallet:{type:Number}

    
}, { timestamps: true });
subscriptionPlanSchema.plugin(mongoosePaginate);
subscriptionPlanSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("subsciptionPlan", subscriptionPlanSchema);


mongoose.model("subsciptionPlan", subscriptionPlanSchema).findOne({  }, (err, result) => {
  if (err) {
    console.log("DEFAULT PLAN ERROR", err);
  }
  else if (result) {
    console.log("Default PLAN already exist.");
  }
  else {
    let arr = [
        {
        value: 10,
        yearlyValue: 100,
        type: "pro",
        title: "NANO",
        tradeFee: "30",
        description: "Launch Plan – Start Your Trading Journey",
        arbitrageName: ["Direct Arbitrage",],
        // capital: 0,
        profits: 0,
        isFuelDeduction: true,
        exchangeUID:["mexc", "binance", "coinbase" ],
        fuelWallet:10
    },
    {
        value: 20,
        yearlyValue: 200,
        type: "pro",
        title: "VECTOR",
        tradeFee: "30",
        description: "Momentum Plan – Scale with Smarter Moves",
        arbitrageName: ["Direct Arbitrage", "Triangular Arbitrage",],
        // capital: 0,
        profits: 0,
        isFuelDeduction: true,
        exchangeUID:["mexc", "binance", "coinbase"],
        fuelWallet:10
    },
    {
        value: 30,
        yearlyValue: 300,
        type: "pro",
        title: "SYNAPSE",
        tradeFee: "30",
        description: "Precision Plan – Optimize Like a Pro",
        arbitrageName: ["Direct Arbitrage", "Triangular Arbitrage",],
        // capital: 0,
        profits: 0,
        isFuelDeduction: true,
        exchangeUID:["mexc",  "bitmart", "binance", "coinbase", ],
        fuelWallet:10
    },
    {
        value: 50,
        yearlyValue: 500,
        type: "pro",
        title: "QUANTUM",
        tradeFee: "20",
        description: "Mastery Plan – Unleash Full Potential",
        arbitrageName: ["Direct Arbitrage", "Triangular Arbitrage", "intra Arbitrage Single Exchange"],
        // capital: 0,
        profits: 0,
        isFuelDeduction: true,
        exchangeUID:["mexc", "kraken", "bitmart", "binance", "coinbase", ],
        fuelWallet:10
    },
]
    arr.forEach((data)=>{
        mongoose.model("subsciptionPlan", subscriptionPlanSchema)(data).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT PLAN  creation ERROR", err1);
      } else {
        console.log("DEFAULT PLAN Created", result1);
      }
    });
    })
  }
});