const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
import { type } from 'joi/lib/types/object';
import status from '../enums/status';
import subscriptionPlanType from '../enums/subscriptionPlanType';

const schema = mongoose.Schema;
const subscriptionPlanSchema = new schema({
    image:{type:String},
    title: { type: String },
    description: { type: String },
    minProfits: { type: Number },
    maxProfits: { type: Number },
    minInvestment:{type:Number},
    maxInvestment:{type:Number},
    profitPotential:{type:Number,default:1},
    exchanges:{type:[String]},
    arbitrage:{type:[String]},
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    },
}, { timestamps: true });
subscriptionPlanSchema.plugin(mongoosePaginate);
subscriptionPlanSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("poolingSubscriptionPlan", subscriptionPlanSchema);

mongoose.model("poolingSubscriptionPlan", subscriptionPlanSchema).findOne({  }, (err, result) => {
  if (err) {
    console.log("DEFAULT POOL ERROR", err);
  }
  else if (result) {
    console.log("Default pool already exist.");
  }
  else {
    let arr = [{
        title:"The SEED",
        description:"3 exchanges and duality arbitrage",
        minProfits: 6,
        maxProfits: 7,
        minInvestment:10,
        maxInvestment:500,
        profitPotential:2,
        exchanges: ["Binance","Mexc","Coinbase"],
        arbitrage:["Direct Arbitrage",]
    },
{
        title:"The CORE",
        description:"5 exchanges and duality and trigon arbitrage",
        minProfits: 8,
        maxProfits: 10,
        minInvestment:501,
        maxInvestment:5000,
        profitPotential:2.5,
        exchanges: ["Binance...............................","Mexc","Kraken","Bitmart","Coinbase"],
        arbitrage:["Direct Arbitrage","Triangular Arbitrage",]
    },
{
        title:"The Nexus",
        description:"7 exchanges and duality, trigon and horizon arbitrage",
        minProfits: 12,
        maxProfits: 15,
        minInvestment:5001,
        maxInvestment:Infinity,
        profitPotential:3,
        exchanges: ["Binance","Mexc","Kraken","Bitmart","Coinbase"],
        arbitrage:["Direct Arbitrage","Triangular Arbitrage","intra Arbitrage Single Exchange"]
    }]
    arr.forEach((data)=>{
        mongoose.model("poolingSubscriptionPlan", subscriptionPlanSchema)(data).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT POOL  creation ERROR", err1);
      } else {
        console.log("DEFAULT POOL Created", result1);
      }
    });
    })
  }
});