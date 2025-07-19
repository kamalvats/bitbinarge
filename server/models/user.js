import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from '../enums/status';
import bcrypt from 'bcryptjs';
import paymentType from '../enums/paymentType';
import subscriptionPlanType from "../enums/subscriptionPlanType";
import mongoose from "mongoose";
var userModel = new Schema(
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    userName: {
      type: String
    },
    email: {
      type: String,
      default: ''
    },
    password: {
      type: String
    },
    countryCode: {
      type: String
    },
    mobileNumber: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE']
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    profilePic: {
      type: String
    },
    otp: {
      type: Number
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    otpExpireTime: {
      type: Number
    },
    userType: {
      type: String,
      default: userType.USER
    },
    status: {
      type: String,
      default: status.ACTIVE
    },
    deviceToken: {
      type: String
    },
    deviceType: {
      type: String
    },
    ibiId: {
      type: String
    },
    ibiName: {
      type: String
    },
    termsAndConditions: { type: String, enum: ["ACCEPT", "DECLINE"] },
    isSocial: { type: Boolean, default: false },
    socialId: { type: String },
    socialType: { type: String },
    connectedExchange: { type: Array },
    autoTrade: {
      triangular: {
        type: Boolean,
        default: false
      },
      loop: {
        type: Boolean,
        default: false
      },
      intra: {
        type: Boolean,
        default: false
      },
      direct: {
        type: Boolean,
        default: false
      },
      intraSingleExchange: {
        type: Boolean,
        default: false
      },
    },
    autoTradePlaceCount: {
      triangular: {
        type: Number,
        default: 0,
        max: 3
      },
      loop: {
        type: Number,
        default: 0,
        max: 1
      },
      intra: {
        type: Number,
        default: 0,
        max: 1
      },
      direct: {
        type: Number,
        default: 0,
        max: 1
      },
      intraSingleExchange: {
        type: Number,
        default: 0,
        max: 3
      },
    },
    sniperBot: {
      triangular: {
        type: Boolean,
        default: false
      },
      loop: {
        type: Boolean,
        default: false
      },
      intra: {
        type: Boolean,
        default: false
      },
      direct: {
        type: Boolean,
        default: false
      },
      intraSingleExchange: {
        type: Boolean,
        default: false
      },
    },
    permissions: {
      dashboard: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      staticContentManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      transactionManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      userManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false }, isdetails: { type: Boolean, default: false } },
      newsManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      videoManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      ipAddressManagemet: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      subAdminManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      subscriptionManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      couponManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
      tradeManagement: { isView: { type: Boolean, default: false }, isEdit: { type: Boolean, default: false } },
    },
    notifications: {
      trade_error: { type: Boolean, default: false },
      trade_cancel: { type: Boolean, default: false },
      trade_success: { type: Boolean, default: false },
      other: { type: Boolean, default: true }
    },
    referralCode: { type: String },
    speakeasy: { type: Boolean, default: false },
    base32: { type: String },
    speakeasyQRcode: { type: String },
    referredBy: { type: Mongoose.Types.ObjectId, ref: 'user' },
    subscriptionPlaneId: {
      type: Schema.Types.ObjectId,
      ref: 'buySubsciptionPlanHistory',
    },
    previousPlaneId: {
      type: Schema.Types.ObjectId,
      ref: 'buySubsciptionPlanHistory',
    },
    subscriptionPlaneStatus: { type: Boolean, default: false },
    currentPlanName: { type: String, default: '' },
    currentPlanStatus: { type: String, enum: ["ACTIVE", "INACTIVE"] },
    previousPlanName: { type: String, default: '' },
    previousPlanStatus: { type: String, enum: ["ACTIVE", "INACTIVE"] },
    isWalletGenerated: { type: Boolean, default: false },
    fuelUSDBalance: { type: Number, default: 0 },
    fuelFIEROBalance: { type: Number, default: 0 },
    walletIndex: { type: Number },
    planCapitalAmount: { type: Number, default: 0 },
    planProfit: { type: Number, default: 0 },
    rebalancingTrade: {
      triangular: {
        type: Boolean,
        default: false
      },
      loop: {
        type: Boolean,
        default: false
      },
      intra: {
        type: Boolean,
        default: false
      },
      direct: {
        type: Boolean,
        default: false
      },
      intraSingleExchange: {
        type: Boolean,
        default: false
      },
    },
    sniperBotPlaceTime: {
      triangular: {
        type: Number,
        default: 0
      },
      loop: {
        type: Number,
        default: 0
      },
      intra: {
        type: Number,
        default: 0
      },
      direct: {
        type: Number,
        default: 0
      },
      intraSingleExchange: {
        type: Number,
        default: 0
      },
    },
    userGroup: { type: String },
    paymentType: {
      type: String,
      enum: [paymentType.CRYPTO, paymentType.CARD, paymentType.CASH]
    },
    cryptoCurrency: {
      type: String,
    },
    transactionReference: {
      type: String,
    },
    subscriptionType: {
      type: String,
      enum: [subscriptionPlanType.PAID, subscriptionPlanType.CUSTOM, subscriptionPlanType.FREE],
    },
    isRejected: {
      type: Boolean,
      default: false
    },
    recursivePayment: { type: Boolean, default: true },
    totalAmount:{type:Number},
    isAttached:{type:Boolean,default:false}
  },
  { timestamps: true }
);
userModel.index({ location: "2dsphere" })
userModel.plugin(mongooseAggregatePaginate)
userModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("user", userModel);

Mongoose.model("user", userModel).findOne({ userType: userType.ADMIN }, (err, result) => {
  if (err) {
    console.log("DEFAULT ADMIN ERROR", err);
  }
  else if (result) {
    console.log("Default Admin already exist.");
  }
  else {
    let obj = {
      userType: userType.ADMIN,
      firstName: "Vishnu Deo",
      lastName: "Bhakta",
      gender: "MALE",
      countryCode: "+91",
      mobileNumber: 8521529565,
      email: "bitbinarge@nexarise.com",
      dateOfBirth: "25/04/1996",
      otpVerified: true,
      referralCode: 'de8521vi',
      password: bcrypt.hashSync("bitbinarge@1"),
      address: "Siwan, Bihar, India",
      permissions: {
        dashboard: { isView: true, isEdit: true },
        staticContentManagement: { isView: true, isEdit: true },
        transactionManagement: { isView: true, isEdit: true },
        userManagement: { isView: true, isEdit: true, isdetails: true },
        newsManagement: { isView: true, isEdit: true },
        videoManagement: { isView: true, isEdit: true },
        ipAddressManagemet: { isView: true, isEdit: true },
        subAdminManagement: { isView: true, isEdit: true },
        subscriptionManagement: { isView: true, isEdit: true },
        isUserDetails: { isView: true, isEdit: true },
        couponManagement: { isView: true, isEdit: true },
        tradeManagement: { isView: true, isEdit: true },
      },
      notifications: {
        trade_error: false,
        trade_cancel: false,
        trade_success: false,
        other: true
      }
    };
    Mongoose.model("user", userModel)(obj).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT ADMIN  creation ERROR", err1);
      } else {
        console.log("DEFAULT ADMIN Created", result1);
      }
    });
  }
});
