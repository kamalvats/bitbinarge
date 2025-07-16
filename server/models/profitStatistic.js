import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
var profitStatisticModel = new Schema(
  {
    today: {
      type: Array
    },
    weekly: {
      type: Array
    },
    monthly: {
      type: Array
    },
    yearly: {
      type: Array
    },
  },
  { timestamps: true }
);
profitStatisticModel.plugin(mongooseAggregatePaginate)
profitStatisticModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("profitStatistic", profitStatisticModel);

Mongoose.model("profitStatistic", profitStatisticModel).findOne({ userType: userType.ADMIN }, (err, result) => {
  if (err) {
    console.log("DEFAULT profitStatistic ERROR", err);
  }
  else if (result) {
    console.log("Default profitStatistic already exist.");
  }
  else {
    let obj = {
        today: [],
        weekly: [],
        monthly: [],
        yearly:[]
    };
    Mongoose.model("profitStatistic", profitStatisticModel)(obj).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT profitStatistic  creation ERROR", err1);
      } else {
        console.log("DEFAULT profitStatistic Created", result1);
      }
    });
  }
});
