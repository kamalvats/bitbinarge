import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';

const options = {
    collection: "keys",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        trustPaymentUserName: {
            type: String
        },
        trustPaymentPassword: {
            type: String
        },
        trustPaymentSiteReference: {
            type: String
        },
        trustPaymentAlias: {
            type: String
        },
        trustPaymentIssuer: {
            type: String
        },
        trustPaymentSecret: {
            type: String
        },
        trustPaymentUrl: {
            type: String
        },
    },
    options
);

module.exports = Mongoose.model("keys", schemaDefination);

Mongoose.model("keys", schemaDefination).findOne({}, (err, result) => {
    if (err) {
      console.log("Keys ERROR", err);
    }
    else if (result) {
      console.log("Default Keys already exist.");
    }
    else {
      let obj = {
        trustPaymentUserName: "",
        trustPaymentPassword: "",
        trustPaymentSiteReference: "",
        trustPaymentAlias: "",
        trustPaymentIssuer: "",
        trustPaymentSecret: "",
        trustPaymentUrl: "",
      };
      Mongoose.model("keys", schemaDefination)(obj).save((err1, result1) => {
        if (err1) {
          console.log("DEFAULT Keys  creation ERROR", err1);
        } else {
          console.log("DEFAULT Keys Created", result1);
        }
      });
    }
  });