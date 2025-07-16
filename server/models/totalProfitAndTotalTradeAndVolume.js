import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
var totalProfitAndTotalTradeAndVolumeCronModel = new Schema(
  {
    totalProfit: {
      type: Number
    },
    totalTrades: {
      type: Number
    },
    totalTradingVolume: {
      type: Number
    },
  },
  { timestamps: true }
);
totalProfitAndTotalTradeAndVolumeCronModel.plugin(mongooseAggregatePaginate)
totalProfitAndTotalTradeAndVolumeCronModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("totalProfitAndTotalTradeAndVolume", totalProfitAndTotalTradeAndVolumeCronModel);
Mongoose.model("totalProfitAndTotalTradeAndVolume", totalProfitAndTotalTradeAndVolumeCronModel).findOne({ userType: userType.ADMIN }, (err, result) => {
  if (err) {
    console.log("DEFAULT totalProfitAndTotalTradeAndVolume ERROR", err);
  }
  else if (result) {
    console.log("Default totalProfitAndTotalTradeAndVolume already exist.");
  }
  else {
    let obj = {
        totalProfit: 0,
        totalTrades: 0,
        totalTradingVolume: 0
    };
    Mongoose.model("totalProfitAndTotalTradeAndVolume", totalProfitAndTotalTradeAndVolumeCronModel)(obj).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT totalProfitAndTotalTradeAndVolume  creation ERROR", err1);
      } else {
        console.log("DEFAULT totalProfitAndTotalTradeAndVolume Created", result1);
      }
    });
  }
});
