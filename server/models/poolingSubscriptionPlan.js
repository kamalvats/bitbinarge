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
    minTotalTrades : { type: Number },
    maxTotalTrades : { type: Number },
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
        title:"Bronze",
        description:"This is a bronze plan",
        minProfits: 6,
        maxProfits: 7,
        minTotalTrades : 80,
        maxTotalTrades : 85
    },
{
        title:"Silver",
        description:"This is a silver plan",
        minProfits: 8,
        maxProfits: 10,
        minTotalTrades : 86,
        maxTotalTrades : 92
    },
{
        title:"Gold",
        description:"This is a gold plan",
        minProfits: 12,
        maxProfits: 15,
        minTotalTrades : 93,
        maxTotalTrades : 96
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