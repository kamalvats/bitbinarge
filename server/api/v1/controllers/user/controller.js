import Joi from "joi";
import Mongoose from "mongoose";
import _, { find } from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import auth from "../../../../helper/auth"
import speakeasy from 'speakeasy';
import userType from "../../../../enums/userType";
import {
  userServices
} from '../../services/user';
import exchange from '../../../../models/exchange';
import axios from 'axios';
import {
  getTransactionDetailForUsd, getTransactionDetailForFiero
} from "../../../../helper/blockChainFunction/eth"
const { userCheck, paginateSearch, insertManyUser, createAddress, checkUserExists, emailMobileExist, createUser, findUser, updateUser, updateUserById, checkSocialLogin, multiUpdateUser, findUserWithPopulate, findAllUser } = userServices;
import { buySubsciptionPlanHistoryServices } from "../../services/buySubscriptionPlanHistory";
const { buySubsciptionPlanCount, buySubsciptionPlanCreate, buySubscriptionhPlanList, buySubscriptionPlanList, buySubsciptionPlanData, buySubsciptionPlanUpdate, lastedBuyPlan, updateManySubscription, buySubscriptionhPlanListLimit } = buySubsciptionPlanHistoryServices
import { subscriptionPlanServices } from '../../services/subscriptionPlan'
const { findSubscriptionPlan, subscriptionPlanList, updateSubscriptionPlan, updateManySubscriptionPlan } = subscriptionPlanServices
import { fuelWalletTransactionHistoryServices } from "../../services/fuelWalletTransactionHistory"
const { createFuelWalletTransactionHistory, findFuelWalletTransactionHistory, paginateSearchFuelWalletHistory } = fuelWalletTransactionHistoryServices
let blockChainFunctionController = require('../../controllers/cronjob/blockChainFunctionController')
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(blockChainFunctionController.etherRPC));
import { triangularServices } from "../../services/triangular"
const { multiTriangularUpdate, triangularUpdate, triangularAllList } = triangularServices
import { intraAbitrageSingleExchangeServices } from "../../services/intraArbitrageSingleExchange"
const { multiArbitrageSingleExchangeUpdate } = intraAbitrageSingleExchangeServices
import { userWalletServices } from "../../services/userWallet"
const { userWalletDelete, findUserWallet } = userWalletServices
import { fuelWalletDeductionHistoryServices } from "../../services/fuelWalletDeductionHistory"
const { paginateSearchFuelWalletDeductionHistory, fuelWalletDeductionHistoryList, fuelWalletDeductionHistoryUpdate, updateFuelWalletDeductionHistory, findFuelWalletDeductionHistory } = fuelWalletDeductionHistoryServices
import { ipAddressCheckServices } from "../../services/ipAddressCheck"
const { findIpAddressCheck } = ipAddressCheckServices
import { ipAddressServices } from "../../services/ipAddress"
const { findIpAddress } = ipAddressServices
const currencyPairs = require('../../../../helper/currencyPairs');
import { sniperBotServices } from "../../services/sniperBot"
const { multiSniperUpdate } = sniperBotServices
import { walletServices } from "../../services/wallet"
const { connectedExchangeUpdateMany } = walletServices
import { docusealServices } from "../../services/docuseal"
const { createDocuseal, findDocuseal, updateDocuseal, listDocuseal, createUpdatDocuseal } = docusealServices
import paymentType from '../../../../enums/paymentType';
import { couponServices } from "../../services/coupon"
const { createCoupon, findCoupon, updateCoupon, listCoupon, couponListPagination } = couponServices
import couponType from "../../../../enums/couponType";
import { couponHistoryServices } from "../../services/couponHistory"
const { createCouponHistory, updateCouponHistory, findCouponHistory } = couponHistoryServices
import trustPaymentCoin from '../../../../helper/trustPaymentCoin.json'
import trustPaymentCountry from '../../../../helper/trustPaymentCountries.json'
import subscriptionPlanType from "../../../../enums/subscriptionPlanType"
import { pairsServices } from "../../services/pairs"
const { createPairs, updatePairs, findPairs } = pairsServices
import arbitrage from "../../../../enums/arbitrage";
import { keysServices } from "../../services/keys"
const { createKeys, findKeys, updateKeys, keysList } = keysServices
import { transactionServices } from '../../services/transaction'
const { createTransaction, findTransaction, updateTransaction, transactionPaginateSearch, transactionList, aggregateSearchtransaction } = transactionServices
import { poolingSubscriptionPlanServices } from '../../services/poolingSubscriptionPlan'
const { createPoolingSubscriptionPlan, findPoolingSubscriptionPlan, updatePoolingSubscriptionPlan, paginateSearchPoolingSubscriptionPlan, poolingSubscriptionPlanList } = poolingSubscriptionPlanServices
import { poolSubscriptionHistoryPlanServices } from '../../services/poolSubscriptionHistory'
const { createPoolSubscriptionHistoryPlan, findPoolSubscriptionHistoryPlan, updatePoolSubscriptionHistoryPlan, poolSubscriptionHistoryPlanList } = poolSubscriptionHistoryPlanServices
import aedGardoPaymentFunctions from '../../../../helper/aedGardoPaymentFunctions';
import c from "config";
import { WalletType } from "binance-api-node";
const { customAlphabet } = require('nanoid');

export class userController {
  /**
   * @swagger
   * /user/userSignup:
   *   post:
   *     tags:
   *       - USER
   *     description: userSignup
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: firstName
   *         description: First name
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: Last name
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: true
   *       - name: dateOfBirth
   *         description: dateOfBirth
   *         in: formData
   *         required: false
   *       - name: gender
   *         description: gender
   *         in: formData
   *         required: false
   *         enum: [MALE,FEMALE]
   *       - name: address
   *         description: address
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city
   *         in: formData
   *         required: false
   *       - name: state
   *         description: state
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country
   *         in: formData
   *         required: false
   *       - name: referralId
   *         description: referralId
   *         in: formData
   *         required: false
   *       - name: ibiId
   *         description: ibiId
   *         in: formData
   *         required: false
   *       - name: ibiName
   *         description: ibiName
   *         in: formData
   *         required: false
   *       - name: termsAndConditions
   *         description: termsAndConditions
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         type: file
   *         in: formData
   *         description: Profile picture
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userSignup(req, res, next) {
    const validationSchema = {
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      countryCode: Joi.string().optional(),
      mobileNumber: Joi.string().optional(),
      dateOfBirth: Joi.string().optional(),
      gender: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      profilePic: Joi.string().optional(),
      referralId: Joi.string().allow("").optional(),
      ibiId: Joi.string().optional(),
      ibiName: Joi.string().optional(),
      termsAndConditions: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, mobileNumber, firstName, password, referralId } =
        validatedBody;
      let userInfo = await findUser({
        $and: [
          {
            $or: [
              {
                email: email,
              },
              {
                mobileNumber: mobileNumber,
              },
            ],
          },
          {
            status: {
              $ne: status.DELETE,
            },
          },
        ],
      });
      if (userInfo) {
        if (userInfo.isSocial == true) {
          throw apiError.conflict(responseMessage.SOCIAL_LOGIN);
        }
        if (userInfo.email == email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        } else if (userInfo.mobileNumber == mobileNumber) {
          throw apiError.conflict(responseMessage.MOBILE_EXIST);
        }
      }
      if (referralId) {
        let findRefferal = await findUser({
          referralCode: referralId,
          status: {
            $ne: status.DELETE,
          },
        });
        if (!findRefferal) {
          throw apiError.badRequest(responseMessage.INVALID_REFERRAL);
        }
        validatedBody.referredBy = findRefferal._id;
      }
      if (!validatedBody.termsAndConditions) {
        validatedBody.termsAndConditions = "DECLINE";
      }
      validatedBody.referralCode = commonFunction.generateRefferalCode();
      validatedBody.password = bcrypt.hashSync(validatedBody.password);
      validatedBody.otp = commonFunction.getOTP();
      validatedBody.otpExpireTime =
        new Date().getTime() + config.get("OTP_TIME_MINUTE") * 60 * 1000;
      let array = ["USER0", "USER1"];
      let randomElement = array[Math.floor(Math.random() * array.length)];
      validatedBody.userGroup = randomElement;
      await commonFunction.signResendOtp(email, firstName, validatedBody.otp);
      // if (req.files.length != 0) {
      //     validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
      // }
      const nanoid = customAlphabet('0123456789', 6);
      let code = await nanoid()
      validatedBody.code = code
      let result = await createUser(validatedBody);


      result = JSON.parse(JSON.stringify(result));
      delete result.password;
      delete result.otp;
      return res.json(new response(result, responseMessage.USER_CREATED));
    } catch (error) {
      console.log("error=======>138", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/verifyOTP:
   *   patch:
   *     tags:
   *       - USER
   *     description: verifyOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOTP
   *         description: verifyOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/verifyOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async verifyOTP(req, res, next) {
    let validationSchema = {
      email: Joi.string().required(),
      otp: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, otp } = validatedBody;
      let userResult = await findUser({
        // isSocial: false,
        $and: [
          {
            $or: [
              {
                email: email,
              },
              {
                mobileNumber: email,
              },
            ],
          },
          {
            status: {
              $ne: status.DELETE,
            },
          },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (Date.now() > userResult.otpExpireTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }
      if (userResult.otp != otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_OTP);
      }

      let updateResult = await updateUser(
        {
          _id: userResult._id,
        },
        {
          otpVerified: true,
        }
      );
      let token = await commonFunction.getToken({
        _id: updateResult._id,
        email: updateResult.email,
        userType: updateResult.userType,
      });
      var obj = {
        _id: userResult._id,
        email: userResult.email,
        googleAuthenction: userResult.speakeasy,
        status: userResult.status,
        userType: userResult.userType,
      };
      if (userResult.speakeasy == false) {
        obj.token = token;
      } else {
        obj.token = "";
      }
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/resendOTP:
   *   patch:
   *     tags:
   *       - USER
   *     description: resendOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resendOTP
   *         description: resendOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async resendOTP(req, res, next) {
    let validationSchema = {
      email: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email } = validatedBody;
      let userResult = await findUser({
        // isSocial: false,
        $and: [
          {
            $or: [
              {
                email: email,
              },
              {
                mobileNumber: email,
              },
            ],
          },
          {
            status: {
              $ne: status.DELETE,
            },
          },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let otp = await commonFunction.getOTP();
      let otpExpireTime =
        Date.now() + config.get("OTP_TIME_MINUTE") * 60 * 1000;
      if (userResult.email == email) {
        await commonFunction.signResendOtp(email, userResult.firstName, otp);
      }
      // if (userResult.mobileNumber == email) {
      //     await commonFunction.sendSms(userResult.countryCode + userResult.mobileNumber, otp);
      // }
      let updateResult = await updateUser(
        {
          _id: userResult._id,
        },
        {
          otp: otp,
          otpExpireTime: otpExpireTime,
        }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      const keysToRemove = [
        "planProfit",
        "fuelFIEROBalance",
        "fuelUSDBalance",
        "speakeasyQRcode",
        "sniperBotPlaceTime",
        "connectedExchange",
        "_id",
        "permissions",
        "password",
        "otp",
        "autoTrade",
        "autoTradePlaceCount",
        "sniperBot",
        "notifications",
        "rebalancingTrade",
      ];
      keysToRemove.forEach((key) => delete updateResult[key]);
      return res.json(new response(updateResult, responseMessage.OTP_SEND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/forgotPassword:
   *   patch:
   *     tags:
   *       - USER
   *     description: forgotPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: forgotPassword
   *         description: forgotPassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/forgotPassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async forgotPassword(req, res, next) {
    let validationSchema = {
      email: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email } = validatedBody;
      let userResult = await findUser({
        // isSocial: false,
        $and: [
          {
            $or: [
              {
                email: email,
              },
              {
                mobileNumber: email,
              },
            ],
          },
          {
            status: {
              $ne: status.DELETE,
            },
          },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let otp = await commonFunction.getOTP();
      let otpExpireTime =
        Date.now() + config.get("OTP_TIME_MINUTE") * 60 * 1000;
      if (userResult.email == email) {
        await commonFunction.signForgotOtp(email, userResult.firstName, otp);
      }
      // if (userResult.mobileNumber == email) {
      //     await commonFunction.sendSms(userResult.countryCode + userResult.mobileNumber, otp);
      // }
      let updateResult = await updateUser(
        {
          _id: userResult._id,
        },
        {
          otp: otp,
          otpExpireTime: otpExpireTime,
        }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      const keysToRemove = [
        "planProfit",
        "fuelFIEROBalance",
        "fuelUSDBalance",
        "speakeasyQRcode",
        "sniperBotPlaceTime",
        "connectedExchange",
        "_id",
        "permissions",
        "password",
        "otp",
        "autoTrade",
        "autoTradePlaceCount",
        "sniperBot",
        "notifications",
        "rebalancingTrade",
      ];
      keysToRemove.forEach((key) => delete updateResult[key]);
      return res.json(new response(updateResult, responseMessage.OTP_SEND));
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/resetPassword:
   *   patch:
   *     tags:
   *       - USER
   *     description: resetPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: resetPassword
   *         description: resetPassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resetPassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */

  async resetPassword(req, res, next) {
    const validationSchema = {
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      const { password, confirmPassword } = validatedBody;
      let userInfo = await findUser({
        _id: req.userId,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userInfo) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (password != confirmPassword) {
        throw apiError.badRequest(responseMessage.PWD_CONFPWD_NOT_MATCH);
      }
      if (userInfo.otpVerified == false) {
        throw apiError.unauthorized(responseMessage.RESET_OTP_NOT_VERIFY);
      }
      let updateResult = await updateUserById(
        {
          _id: userInfo._id,
        },
        {
          $set: {
            password: bcrypt.hashSync(password),
          },
        }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      delete updateResult.password;
      delete updateResult.otp;
      return res.json(new response(updateResult, responseMessage.PWD_CHANGED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userLogin:
   *   post:
   *     tags:
   *       - USER
   *     description: userLogin
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userLogin
   *         description: userLogin
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/userLogin'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async userLogin(req, res, next) {
    let validationSchema = {
      email: Joi.string().required(),
      password: Joi.string().required(),
      ip: Joi.string().optional(),
      termsAndConditions: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, password, mobileNumber } = validatedBody;
      var userResult = await findUser({
        $and: [
          {
            $or: [
              {
                email: email,
              },
              {
                mobileNumber: email,
              },
            ],
          },
          {
            status: {
              $ne: status.DELETE,
            },
          },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (!userResult.password) {
        throw apiError.badRequest(responseMessage.SOCIAL_ALREADY_LOGIN);
      }
      // if (userResult.isSocial == true) {
      //     throw apiError.badRequest(responseMessage.SOCIAL_ALREADY_LOGIN);
      // }
      // if (userResult.otpVerified === false) {
      //     throw apiError.badRequest(responseMessage.OTP_NOT_VERIFY);
      // }
      if (bcrypt.compareSync(password, userResult.password) == false) {
        throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
      }
      if (userResult.userType == userType.SUBADMIN) {
        let ipAddressCheckRes = await findIpAddressCheck({
          isTrue: true,
          status: { $ne: status.DELETE },
        });
        if (ipAddressCheckRes) {
          if (!validatedBody.ip) {
            throw apiError.badRequest(responseMessage.ENTER_IP_ADDRESS);
          }
          let checkIpCorrect = await findIpAddress({
            ip: validatedBody.ip,
            status: status.ACTIVE,
          });
          if (!checkIpCorrect) {
            throw apiError.badRequest(responseMessage.NOT_ALLOW);
          }
        }
      }
      var otp = commonFunction.getOTP();
      var otpExpireTime = new Date().getTime() + 180000;
      await commonFunction.signloignOtp(email, userResult.firstName, otp);
      if (!validatedBody.termsAndConditions || !userResult.termsAndConditions) {
        validatedBody.termsAndConditions =
          userResult.termsAndConditions || "DECLINE";
      }
      let results = await updateUser(
        {
          _id: userResult._id,
        },
        {
          otp: otp,
          otpExpireTime: otpExpireTime,
          termsAndConditions: validatedBody.termsAndConditions,
        }
      );
      results = JSON.parse(JSON.stringify(results));
      const keysToRemove = [
        "planProfit",
        "fuelFIEROBalance",
        "fuelUSDBalance",
        "speakeasyQRcode",
        "sniperBotPlaceTime",
        "connectedExchange",
        "_id",
        "permissions",
        "password",
        "otp",
        "autoTrade",
        "autoTradePlaceCount",
        "sniperBot",
        "notifications",
        "rebalancingTrade",
      ];
      keysToRemove.forEach((key) => delete results[key]);
      // let token = await commonFunction.getToken({ _id: userResult._id, email: userResult.email, userType: userResult.userType });
      // let obj = {
      //     _id: userResult._id,
      //     fullName: userResult.fullName,
      //     email: userResult.email,
      //     userType: userResult.userType,
      //     otpVerification: userResult.otpVerified,
      //     token: token
      // }
      return res.json(new response(results, responseMessage.OTP_SEND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getProfile:
   *   get:
   *     tags:
   *       - USER
   *     description: getProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async getProfile(req, res, next) {
    try {
      // console.log('get profile 427',)
      let userResult = await findUserWithPopulate({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let [walletAddressRes, docusealRes] = await Promise.all([
        findUserWallet({ userId: userResult._id }),
        findDocuseal({ userId: userResult._id }),
      ]);
      userResult = JSON.parse(JSON.stringify(userResult));
      if (walletAddressRes) {
        // userResult.walletFieroAddress = walletAddressRes.walletFieroAddress;
        userResult.walletUsdAddress = walletAddressRes.walletUsdAddress;
      }
      if (docusealRes) {
        userResult.isDocuseal = true;
      }
      delete userResult.password;
      delete userResult.otp;
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/editUserProfile:
   *   put:
   *     tags:
   *       - USER
   *     description: editUserProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: firstName
   *         description: First name
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: Last name
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: dateOfBirth
   *         description: dateOfBirth
   *         in: formData
   *         required: false
   *       - name: gender
   *         description: gender
   *         in: formData
   *         required: false
   *         enum: [MALE,FEMALE]
   *       - name: address
   *         description: address
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city
   *         in: formData
   *         required: false
   *       - name: state
   *         description: state
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         type: file
   *         in: formData
   *         description: Profile picture
   *       - name: ibiId
   *         description: ibiId
   *         in: formData
   *         required: false
   *       - name: ibiName
   *         description: ibiName
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editUserProfile(req, res, next) {
    const validationSchema = {
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().optional(),
      countryCode: Joi.string().optional(),
      mobileNumber: Joi.string().optional(),
      dateOfBirth: Joi.string().optional(),
      gender: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      profilePic: Joi.string().optional(),
      ibiId: Joi.string().optional(),
      ibiName: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, mobileNumber } = validatedBody;
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let sameUserResult = await findUser({
        $and: [
          { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
          { _id: { $ne: userResult._id }, status: { $ne: status.DELETE } },
        ],
      });
      if (sameUserResult) {
        if (sameUserResult.email == email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        } else if (sameUserResult.mobileNumber == mobileNumber) {
          throw apiError.conflict(responseMessage.MOBILE_EXIST);
        }
      }
      // if (req.files.length != 0) {
      //     validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
      // }
      let updateResult = await updateUser(
        { _id: userResult._id },
        { $set: validatedBody }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      delete updateResult.password;
      delete updateResult.otp;
      return res.json(
        new response(updateResult, responseMessage.PROFILE_UPDATED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/changePassword:
   *   put:
   *     tags:
   *       - USER
   *     description: changePassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: oldPassword
   *         description: oldPassword
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async changePassword(req, res, next) {
    const validationSchema = {
      oldPassword: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, oldPassword, password, confirmPassword } = validatedBody;
      let userResult = await findUser({
        _id: req.userId,
        userType: userType.USER,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (password != confirmPassword) {
        throw apiError.badRequest(responseMessage.PWD_CONFPWD_NOT_MATCH);
      }
      if (bcrypt.compareSync(oldPassword, userResult.password) == false) {
        throw apiError.invalid(responseMessage.PWD_NOT_MATCH);
      }
      let updateResult = await updateUserById(
        {
          _id: userResult._id,
        },
        {
          $set: {
            password: bcrypt.hashSync(password),
          },
        }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      delete updateResult.password;
      delete updateResult.otp;
      return res.json(new response(updateResult, responseMessage.PWD_CHANGED));
    } catch (error) {
      return next(error);
    }
  }

  // /**
  //  * @swagger
  //  * /user/buySubscription:
  //  *   post:
  //  *     tags:
  //  *       - SUBSCRIPTION
  //  *     description: buySubscription
  //  *     produces:
  //  *       - application/json
  //  *     parameters:
  //  *       - name: token
  //  *         description: User token
  //  *         in: header
  //  *         required: true
  //  *       - name: subscriptionPlanId
  //  *         description: subscriptionPlanId
  //  *         in: formData
  //  *         required: true
  //  *     responses:
  //  *       200:
  //  *         description: Login successfully.
  //  *       402:
  //  *         description: Incorrect login credential provided.
  //  *       404:
  //  *         description: User not found.
  //  */
  // async buySubscription(req, res, next) {
  //     const validationSchema = {
  //         subscriptionPlanId: Joi.string().required(),
  //     };
  //     try {
  //         const validatedBody = await Joi.validate(req.body, validationSchema);
  //         let userResult = await findUser({_id: req.userId,status: {$ne: status.DELETE}
  //         });
  //         if (!userResult) {
  //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
  //         }
  //         let subscriptionRes = await findSubscriptionPlan({_id: validatedBody.subscriptionPlanId,planStatus: 'ACTIVE',status: status.ACTIVE})
  //         if (!subscriptionRes) {
  //             throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
  //         }
  //         let checkExist = await buySubsciptionPlanData({userId: userResult._id,planStatus: 'ACTIVE',status: status.ACTIVE})
  //         if (checkExist) {
  //             throw apiError.conflict(responseMessage.SUBSCRIPTION_PLAN_ALREADY_EXIST);
  //         }
  //         let adminToken
  //         try {
  //             adminToken = await axios.get(`https://np.astroqunt.app/auth/token`, {
  //                 headers: {
  //                     'Content-Type': 'application/json',
  //                     'x-api-key': config.get('nowPaymentTokenApiKey')
  //                 }
  //             });
  //         } catch (error) {
  //             throw apiError.internal(error.response.data.message);
  //         }
  //         let order_id = commonFunction.generateOrder()
  //         console.log("hsdfjhsdjfhsdjfhsjdhfjsdhfjsdhfjsdhjfsdjf",order_id)
  //         let emailObject = {
  //             email: userResult.email,
  //             subscription_plan_id: Number(subscriptionRes.planId),
  //             // order_id:order_id
  //         }
  //         let response2
  //         try {
  //         response2 = await axios.post(`https://api.nowpayments.io/v1/subscriptions`, emailObject, {
  //             headers: {
  //                 'x-api-key': config.get('nowPaymentApiKey'),
  //                 'Authorization': `Bearer ${adminToken.data.token}`,
  //                 'Content-Type': 'application/json'
  //             }
  //         });
  //         } catch (error) {
  //             throw apiError.internal(error.response.data.message);
  //         }
  //         console.log("sdhfjsdhjfhsdjfhsdjfhjsdfhjsdhfjsfjshfjsdf",response2.data,response2.data.result[0].id)
  //         let obj = {
  //             userId: userResult._id,
  //             subScriptionPlanId: subscriptionRes._id,
  //             tradeFee: subscriptionRes.tradeFee,
  //             nowPaymentSubscriptionId: subscriptionRes.planId,
  //             pay_amount:subscriptionRes.value,
  //             pay_currency:subscriptionRes.currency,
  //             isMailed: true,
  //             order_id: order_id,
  //             transactionId:response2.data.result[0].id,
  //             planStatus: "PENDING",
  //             payment_status: "PENDING"
  //         }
  //         let createObj = await buySubsciptionPlanCreate(obj)

  //         return res.json(new response(createObj, responseMessage.BUY_PLAN1));

  //     } catch (error) {
  //         return next(error);
  //     }
  // }

  /**
   * @swagger
   * /user/buySubscription:
   *   post:
   *     tags:
   *       - SUBSCRIPTION
   *     description: buySubscription
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: subscriptionPlanId
   *         description: subscriptionPlanId
   *         in: formData
   *         required: true
   *       - name: walletType
   *         description: walletType
   *         in: formData
   *         required: true
   *       - name: planType
   *         description: planType(MONTHLY/YEARLY)
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async buySubscription(req, res, next) {
    const validationSchema = {
      // currency_to: Joi.string().required(),
      subscriptionPlanId: Joi.string().required(),
      planType: Joi.string().required(),
      walletType: Joi.string().required(),
      // couponCode: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      userResult = JSON.parse(JSON.stringify(userResult))
      let subscriptionRes = await findSubscriptionPlan({
        _id: validatedBody.subscriptionPlanId,
        planStatus: "ACTIVE",
        status: status.ACTIVE,
        subscriptionType: { $ne: subscriptionPlanType.FREE },
      });
      if (!subscriptionRes) {
        throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
      }
      let planAmount = validatedBody.planType == "MONTHLY" ? subscriptionRes.value : subscriptionRes.yearlyValue
      if(validatedBody.walletType == "MAIN"){
        let getWalletBalance = await aedGardoPaymentFunctions.getWalletBalance(userResult.code, config.get("aedgardoApiKey"));
      if (getWalletBalance.status == false) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (getWalletBalance.result.status == 0) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      let amount = Number(getWalletBalance.result.data.amount)
      if (planAmount > amount) {
        throw apiError.notFound("Low balance. Please add funds to your wallet.");
      }
      }else{

      }
      
      let deduction = await aedGardoPaymentFunctions.deduction(userResult.code, planAmount, config.get("aedgardoApiKey"), "fund", "debit");
      if (deduction.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (deduction.result.status == 0) {
        throw apiError.notFound(deduction.result.message);
      }
      //deduction


      var endTime = new Date();
      endTime.setTime(
        endTime.getTime() +
        Number(validatedBody.planType == "MONTHLY" ? 30 : 365) * 24 * 60 * 60 * 1000
      );
      let startTime = new Date();
      let obj = {
        userId: userResult._id,
        subScriptionPlanId: subscriptionRes._id,
        tradeFee: subscriptionRes.tradeFee,
        startTime: startTime,
        endTime: endTime,
        price_amount: planAmount,
        // payment_id: result.data.payment_id,
        pay_address: userResult.aedGardoAddress,
        // payment_status: result.data.payment_status,
        // pay_currency: result.data.pay_currency,
        // pay_amount: result.data.pay_amount,
        // price_currency: result.data.price_currency,
        // order_id: result.data.order_id,
        // planStatus: subscriptionRes.planStatus,
        exchangeUID: subscriptionRes.exchangeUID,
        arbitrageName: subscriptionRes.arbitrageName,
        pairs: subscriptionRes.pairs,
        capital: subscriptionRes.capital,
        profits: subscriptionRes.profits,
        coinType: subscriptionRes.coinType,
        isFuelDeduction: subscriptionRes.isFuelDeduction,
        planStatus: "ACTIVE",
        planType: validatedBody.planType,
        paymentType: "PAID"
      };
      let createObj = await buySubsciptionPlanCreate(obj);
      if (userResult.subscriptionPlaneId) {
        let priviousRes = await lastedBuyPlan({
          userId: userResult._id,
          _id: userResult.subscriptionPlaneId,
          _id: {
            $ne: createObj._id
          }
        })
        if (priviousRes) {
          let [inActiveAll, updateRes] = await Promise.all([
            buySubsciptionPlanUpdate({
              _id: priviousRes._id
            }, {
              planStatus: "INACTIVE"
            }),
            updateUser({
              _id: userResult._id
            }, {
              previousPlaneId: priviousRes._id,
              previousPlanName: priviousRes.subScriptionPlanId.type,
              previousPlanStatus: "INACTIVE",
            })
          ])
        }
      }

      await updateUser({
        _id: userResult._id
      }, {
        subscriptionPlaneId: createObj._id,
        currentPlanName: subscriptionRes.title,
        currentPlanStatus: "ACTIVE",
        subscriptionPlaneStatus: true,
        planCapitalAmount: subscriptionRes.capital,
        // planProfit: subscriptionRes.profits,
        paymentType: "PAID",
        // cryptoCurrency: subscription.pay_currency,
        subscriptionType: subscriptionRes.subscriptionType
      })
       let order_id = commonFunction.generateOrder();
                              await createTransaction({
                                userId: userResult._id,
                                amount: planAmount,
                                transactionType: "DEDUCTION",
                                transactionSubType:"BUY PLAN",
                                order_id: order_id,
                                status: status.COMPLETED,
                                walletType: validatedBody.walletType,
                                subscriptionPlanIdBot: createObj._id
                              });
      return res.json(
        new response(createObj, "Plan bought successfully")
      );

    } catch (error) {
      return next(error);
    }
  }

  async checkNowpaymentStatus(req, res, next) {
    try {
      const hmac = crypto.createHmac(
        "sha512",
        "VLETNSI/D/tuz5NwPUzjokReXl262WgO"
      );
      hmac.update(JSON.stringify(params, Object.keys(params).sort()));
      const signature = hmac.digest("hex");
      console.log("===================================>><<<", req.body);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getNowPaymentcoins:
   *   get:
   *     tags:
   *       - SUBSCRIPTION
   *     description: getNowPaymentcoins
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async getNowPaymentcoins(req, res, next) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": config.get("nowPaymentApiKey"),
      };
      // let result = await axios.get(config.get('nowPaymentUrl') + 'v1/currencies', {
      let result = await axios.get(
        config.get("nowPaymentUrl") + "v1/merchant/coins",
        {
          headers,
        }
      );
      if (result.status == 200) {
        let currencies = { currencies: result.data.selectedCurrencies };
        return res.json(new response(currencies, responseMessage.DATA_FOUND));
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/myPlan:
   *   get:
   *     tags:
   *       - SUBSCRIPTION
   *     description: myPlan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *       - name: planStatus
   *         description: planStatus
   *         in: query
   *         required: false
   *       - name: paymentStatus
   *         description: paymentStatus
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async myPlan(req, res, next) {
    const validationSchema = {
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      planStatus: Joi.string().optional(),
      paymentStatus: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let result = await buySubscriptionPlanList(validatedBody);
      if (result.docs.length == 0) {
        throw apiError.notFound(responseMessage.PLAN_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.PLAN_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/viewPlan:
   *   get:
   *     tags:
   *       - SUBSCRIPTION
   *     description: viewPlan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: planId
   *         description: planId
   *         in: query
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async viewPlan(req, res, next) {
    const validationSchema = {
      planId: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      let result = await buySubsciptionPlanData({
        _id: validatedBody.planId,
      });
      if (!result) {
        throw apiError.notFound(responseMessage.PLAN_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.PLAN_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/socialLogin:
   *   post:
   *     tags:
   *       - SOCIAL LOGIN
   *     description: socialLogin
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: socialId
   *         description: socialId
   *         in: formData
   *         required: true
   *       - name: socialType
   *         description: socialType
   *         in: formData
   *         required: true
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: true
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: true
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: termsAndConditions
   *         description: termsAndConditions
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async socialLogin(req, res, next) {
    const validationSchema = {
      socialId: Joi.string().required(),
      socialType: Joi.string().required(),
      firstName: Joi.string().required(),
      email: Joi.string().optional(),
      lastName: Joi.string().required(),
      termsAndConditions: Joi.string().optional(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { socialId, socialType, firstName, email, lastName } =
        validatedBody;
      var userInfo = await findUser({
        email: email,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!validatedBody.termsAndConditions) {
        validatedBody.termsAndConditions = "DECLINE";
      }
      if (!userInfo) {
        let array = ["USER0", "USER1"];
        let randomElement = array[Math.floor(Math.random() * array.length)];
        let referralRes = commonFunction.generateRefferalCode();
        var data = {
          socialId: socialId,
          socialType: socialType,
          firstName: firstName,
          lastName: lastName,
          email: email,
          isSocial: true,
          otpVerified: true,
          referralCode: referralRes,
          termsAndConditions: validatedBody.termsAndConditions,
          userGroup: randomElement,
        };
        const nanoid = customAlphabet('0123456789', 6);
        let code = await nanoid()
        data.code = code
        let result = await createUser(data);
        let token = await commonFunction.getToken({
          _id: result._id,
          email: result.email,
          userType: result.userType,
        });
        return res.json(
          new response(
            {
              result,
              token,
            },
            responseMessage.LOGIN
          )
        );
      } else {
        // if (userInfo.isSocial == false) {
        //     throw apiError.conflict(responseMessage.SOCIAL_EMAIL);
        // }
        let token = await commonFunction.getToken({
          _id: userInfo._id,
          email: userInfo.email,
          userType: userInfo.userType,
        });
        var data = {
          socialId: socialId,
          socialType: socialType,
          firstName: firstName,
          lastName: lastName,
          email: email,
          isSocial: true,
          otpVerified: true,
          termsAndConditions: validatedBody.termsAndConditions,
        };
        let result = await updateUser(
          {
            _id: userInfo._id,
          },
          {
            $set: data,
          }
        );
        return res.json(
          new response(
            {
              result,
              token,
            },
            responseMessage.LOGIN
          )
        );
      }
    } catch (error) {
      console.log("socialLogin ===========", error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script(req, res, next) {
    try {
      // let resulst = await multiUpdateUser({isSocial: {"$exists": false}}, {isSocial: false})
      // await multiUpdateUser({isWalletGenerated: {"$exists": false}}, {isWalletGenerated: false})
      // await multiUpdateUser({fuelBalance: {"$exists": false}}, {fuelBalance: 0})
      let updateRes = await multiTriangularUpdate(
        { isFirstStrategy: { $exists: false } },
        { isFirstStrategy: true }
      );
      let updateRes1 = await multiArbitrageSingleExchangeUpdate(
        { isFirstStrategy: { $exists: false } },
        { isFirstStrategy: true }
      );
      let result = {
        triangular: updateRes,
        intra: updateRes1,
      };
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/updateTermsAndConditions:
   *   get:
   *     tags:
   *       - USER
   *     description: getProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: termsAndConditions
   *         description: termsAndConditions
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async updateTermsAndConditions(req, res, next) {
    try {
      // console.log('get profile 427',)
      let userResult = await findUser({
        _id: req.userId,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (!req.query.termsAndConditions || !userResult.termsAndConditions) {
        req.query.termsAndConditions =
          userResult.termsAndConditions || "DECLINE";
      }
      if (req.query.termsAndConditions) {
        await updateUser(
          {
            _id: userResult._id,
          },
          {
            termsAndConditions: req.query.termsAndConditions,
          }
        );
      }
      userResult = JSON.parse(JSON.stringify(userResult));
      delete userResult.password;
      delete userResult.otp;
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script1:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script1(req, res, next) {
    try {
      let result0 = await multiUpdateUser(
        { planCapitalAmount: { $exists: false } },
        { planCapitalAmount: 0 }
      );
      // let result1 = await multiUpdateUser(
      //   { planProfit: { $exists: false } },
      //   { planProfit: 0 }
      // );
      let reulst3 = await updateManySubscription(
        { exchangeUID: { $exists: false } },
        { exchangeUID: [] }
      );
      let reulst4 = await updateManySubscription(
        { arbitrageName: { $exists: false } },
        { arbitrageName: [] }
      );
      let reulst5 = await updateManySubscription(
        { pairs: { $exists: false } },
        { pairs: [] }
      );
      let reulst6 = await updateManySubscription(
        { capital: { $exists: false } },
        { capital: 0 }
      );
      let reulst7 = await updateManySubscription(
        { profits: { $exists: false } },
        { profits: 0 }
      );
      let reulst11 = await updateManySubscription(
        { coinType: { $exists: false } },
        { coinType: "NOT" }
      );
      let reulst12 = await updateManySubscription(
        { isFuelDeduction: { $exists: false } },
        { isFuelDeduction: false }
      );
      // let result10 = await multiUpdateUser({}, { $unset: { isWalletFieroGenerated: 1, isWalletUsdGenerated: 1 } })
      // let reulst8=await multiUpdateUser({isWalletGenerated: {"$exists": false}}, {isWalletGenerated: false})
      let reulst13 = await multiUpdateUser(
        { fuelUSDBalance: { $exists: false } },
        { fuelUSDBalance: 0 }
      );
      // let reulst14 = await multiUpdateUser(
      //   { fuelFIEROBalance: { $exists: false } },
      //   { fuelFIEROBalance: 0 }
      // );
      let reulst8 = await multiUpdateUser({}, { isWalletGenerated: false });
      let result9 = await userWalletDelete({});
      let result = {
        result0: result0,
        result1: result1,
        reulst3: reulst3,
        reulst4: reulst4,
        reulst5: reulst5,
        reulst6: reulst6,
        reulst7: reulst7,
        reulst8: reulst8,
        result9: result9,
        // result10: result10,
        reulst11: reulst11,
        reulst12: reulst12,
        reulst13: reulst13,
        // reulst14: reulst14,
      };
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/fuelWallet:
   *   post:
   *     tags:
   *       - Fuel Wallet
   *     description: script
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *       - name: walletType
   *         description: walletType
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async fuelWallet(req, res, next) {
    const validationSchema = {
      amount: Joi.string().required(),
      walletType: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      let amount = Number(validatedBody.amount)
      let getWalletBalance = await aedGardoPaymentFunctions.getWalletBalance(userResult.code, config.get("aedgardoApiKey"));
      if (getWalletBalance.status == false) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (getWalletBalance.result.status == 0) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (Number(getWalletBalance.result.data.amount) < amount) {
        throw apiError.unauthorized("Low Balance");
      }
      let deduction = await aedGardoPaymentFunctions.deduction(userResult.code, amount, config.get("aedgardoApiKey"), "fund", "debit");
      if (deduction.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (deduction.result.status == 0) {
        throw apiError.notFound(deduction.result.message);
      }
      validatedBody.coinName == "USD"
      validatedBody.transactionType = "DEPOSIT";
      validatedBody.userId = userResult._id;
      validatedBody.walletType = validatedBody.walletType;
      let updateRes = await updateUser(
        { _id: userResult._id },
        { $inc: { fuelUSDBalance: Number(validatedBody.amount) } }
      );
 let result = await createFuelWalletTransactionHistory(validatedBody)
      return res.json(
        new response({}, responseMessage.TRANSACTION_SUCCESS)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/myFuelWalletHistory:
   *   get:
   *     tags:
   *       - Fuel Wallet
   *     description: myFuelWalletHistory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async myFuelWalletHistory(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let walletAddressRes = await paginateSearchFuelWalletHistory(
        validatedBody
      );
      if (walletAddressRes.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(walletAddressRes, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/myFuelWalletDeducteHistory:
   *   get:
   *     tags:
   *       - Fuel Wallet
   *     description: myFuelWalletDeducteHistory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async myFuelWalletDeducteHistory(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let walletAddressRes = await paginateSearchFuelWalletDeductionHistory(
        validatedBody
      );
      if (walletAddressRes.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(walletAddressRes, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script2:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script2(req, res, next) {
    try {
      let getAllSubscription = await subscriptionPlanList({
        recursiveValue: { $exists: false },
      });
      for (let i = 0; i < getAllSubscription.length; i++) {
        let result = await updateSubscriptionPlan(
          { _id: getAllSubscription[i]._id },
          { recursiveValue: getAllSubscription[i].value }
        );
      }
      return res.json(
        new response(getAllSubscription, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/editUserProfileByAdmin:
   *   put:
   *     tags:
   *       - USER
   *     description: editUserProfileByAdmin
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: formData
   *         required: true
   *       - name: firstName
   *         description: First name
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: Last name
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email
   *         in: formData
   *         required: false
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: false
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: dateOfBirth
   *         description: dateOfBirth
   *         in: formData
   *         required: false
   *       - name: gender
   *         description: gender
   *         in: formData
   *         required: false
   *         enum: [MALE,FEMALE]
   *       - name: address
   *         description: address
   *         in: formData
   *         required: false
   *       - name: city
   *         description: city
   *         in: formData
   *         required: false
   *       - name: state
   *         description: state
   *         in: formData
   *         required: false
   *       - name: country
   *         description: country
   *         in: formData
   *         required: false
   *       - name: profilePic
   *         type: file
   *         in: formData
   *         description: Profile picture
   *       - name: ibiId
   *         description: ibiId
   *         in: formData
   *         required: false
   *       - name: ibiName
   *         description: ibiName
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editUserProfileByAdmin(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().optional(),
      countryCode: Joi.string().optional(),
      mobileNumber: Joi.string().optional(),
      dateOfBirth: Joi.string().optional(),
      gender: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      profilePic: Joi.string().optional(),
      ibiId: Joi.string().optional(),
      ibiName: Joi.string().optional(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      const { email, mobileNumber } = validatedBody;
      let adminResult = await findUser({
        _id: req.userId,
        userType: { $in: [userType.ADMIN, userType.SUBADMIN] },
        status: { $ne: status.DELETE },
      });
      if (!adminResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let userResult = await findUser({
        _id: validatedBody.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let sameUserResult = await findUser({
        $and: [
          { $or: [{ email: email }, { mobileNumber: mobileNumber }] },
          { _id: { $ne: userResult._id }, status: { $ne: status.DELETE } },
        ],
      });
      if (sameUserResult) {
        if (sameUserResult.email == email) {
          throw apiError.conflict(responseMessage.EMAIL_EXIST);
        } else if (sameUserResult.mobileNumber == mobileNumber) {
          throw apiError.conflict(responseMessage.MOBILE_EXIST);
        }
      }
      // if (req.files.length != 0) {
      //     validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
      // }
      let updateResult = await updateUser(
        { _id: userResult._id },
        { $set: validatedBody }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      delete updateResult.password;
      delete updateResult.otp;
      return res.json(
        new response(updateResult, responseMessage.PROFILE_UPDATED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script3:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script3(req, res, next) {
    try {
      let totalPairs = currencyPairs.currencyPairs;
      let dynamicPairs = await findPairs({ status: status.ACTIVE });
      if (dynamicPairs) {
        totalPairs = [...new Set(totalPairs.concat(dynamicPairs.pairs))];
      }
      let reulst1 = await multiSniperUpdate(
        { isNumberOfTradeActive: { $exists: false } },
        { isNumberOfTradeActive: false, numberOfTrade: 0 }
      );
      let reulst2 = await multiSniperUpdate({}, { fromCoin: totalPairs });
      let reulst3 = await multiSniperUpdate(
        {},
        { toCoin: ["ETH", "BTC", "USDT"] }
      );
      let obj = {
        reulst1: reulst1,
        reulst2: reulst2,
        reulst3: reulst3,
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script4:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script4(req, res, next) {
    try {
      let reulst3 = await updateManySubscription(
        { planStatus: { $in: ["ACTIVE", "PENDING"] } },
        { $addToSet: { exchangeUID: "coinbase" } }
      );
      let reulst5 = await updateManySubscription(
        { planStatus: { $in: ["ACTIVE", "PENDING"] } },
        { $addToSet: { exchangeUID: "bitmart" } }
      );
      let reulst1 = await connectedExchangeUpdateMany(
        { uid: "coinbasepro" },
        { uid: "coinbase" }
      );
      let reulst2 = await multiTriangularUpdate(
        { exchangeName: "Coinbasepro" },
        { exchangeName: "Coinbase" }
      );
      let reulst4 = await multiArbitrageSingleExchangeUpdate(
        { exchangeName: "Coinbasepro" },
        { exchangeName: "Coinbase" }
      );
      let result6 = await exchange.findOneAndUpdate(
        { exchangeName: "Coinbasepro" },
        { exchangeName: "Coinbase", uid: "coinbase" }
      );
      let obj = {
        reulst1: reulst1,
        reulst2: reulst2,
        reulst3: reulst3,
        reulst4: reulst4,
        reulst5: reulst5,
        result6: result6,
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script5:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script5(req, res, next) {
    try {
      var endTime = new Date("2024-10-07");
      var toDate = new Date();
      let finalResult = [];
      let activePlan = await buySubscriptionhPlanList({
        $and: [{ endTime: { $gte: endTime } }, { endTime: { $lte: toDate } }],
        planStatus: "INACTIVE",
        status: status.ACTIVE,
      });
      for (let i = 0; i < activePlan.length; i++) {
        let userFindRes = await findUser({ _id: activePlan[i].userId._id });
        let priviousRes = await lastedBuyPlan({
          userId: activePlan[i].userId,
          _id: userFindRes.subscriptionPlaneId,
        });
        if (priviousRes.planStatus == "INACTIVE") {
          let planRes = await findSubscriptionPlan({
            _id: priviousRes.subScriptionPlanId._id,
          });
          if (planRes) {
            let pendingRes = await buySubsciptionPlanData({
              userId: activePlan[i].userId,
              payment_status: {
                $in: [
                  "waiting",
                  "confirming",
                  "confirmed",
                  "sending",
                  "partially_paid",
                ],
              },
            });
            if (pendingRes) {
              let priviousTime = new Date(priviousRes.endTime)
                .toISOString()
                .replace("-", "/")
                .split("T")[0]
                .replace("-", "/");
              await commonFunction.remainderNotificationMail(
                activePlan[i].userId.email,
                "Hi",
                planRes.type,
                pendingRes.pay_amount,
                priviousTime,
                pendingRes.pay_address,
                pendingRes.pay_currency,
                priviousTime,
                planRes.planDuration
              );
              finalResult.push(activePlan[i].userId.email);
            } else {
              if (planRes) {
                let order_id = commonFunction.generateOrder();
                const paymentData = {
                  price_amount: planRes.recursiveValue, // The payment amount
                  price_currency: "USD", // The currency you are paying with
                  pay_currency: priviousRes.pay_currency, // The cryptocurrency you want to receive
                  order_id: order_id, // Your order ID or identifier
                  ipn_callback_url:
                    "https://node.astroqunt.app/api/v1/admin/nowPaymentCallBack", // URL to receive IPN (Instant Payment Notification) callbacks
                  // ipn_callback_url: "https://3a60-182-71-75-106.ngrok-free.app/api/v1/admin/nowPaymentCallBack"
                };
                const headers = {
                  "Content-Type": "application/json",
                  "x-api-key": config.get("nowPaymentApiKey"),
                };
                console.log(
                  "=4346346374364736476346364346346364374",
                  paymentData
                );
                let result = await axios.post(
                  config.get("nowPaymentUrl") + "v1/payment",
                  paymentData,
                  { headers }
                );
                if (result.status == 201) {
                  if (result.data.payment_status == "waiting") {
                    let obj = {
                      userId: activePlan[i].userId._id,
                      subScriptionPlanId: planRes._id,
                      tradeFee: planRes.tradeFee,
                      price_amount: result.data.price_amount,
                      payment_id: result.data.payment_id,
                      pay_address: result.data.pay_address,
                      payment_status: result.data.payment_status,
                      pay_currency: result.data.pay_currency,
                      pay_amount: result.data.pay_amount,
                      price_currency: result.data.price_currency,
                      order_id: result.data.order_id,
                      // planStatus: planRes.planStatus,
                      exchangeUID: planRes.exchangeUID,
                      arbitrageName: planRes.arbitrageName,
                      pairs: planRes.pairs,
                      capital: planRes.capital,
                      profits: planRes.profits,
                      coinType: "NOT",
                      isFuelDeduction: false,
                    };
                    let createObj = await buySubsciptionPlanCreate(obj);
                    let priviousTime = new Date(priviousRes.endTime)
                      .toISOString()
                      .replace("-", "/")
                      .split("T")[0]
                      .replace("-", "/");
                    await commonFunction.remainderNotificationMail(
                      activePlan[i].userId.email,
                      "Hi",
                      planRes.type,
                      result.data.pay_amount,
                      priviousTime,
                      result.data.pay_address,
                      result.data.pay_currency,
                      priviousTime,
                      planRes.planDuration
                    );
                    finalResult.push(activePlan[i].userId.email);
                  }
                }
              }
            }
          }
        }
      }
      return res.json(new response(finalResult, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script6:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script6(req, res, next) {
    try {
      var endTime = new Date("2024-10-07");
      var toDate = new Date();
      let finalResult = [];
      let activePlan = await buySubscriptionhPlanList({
        $and: [{ endTime: { $gte: endTime } }, { endTime: { $lte: toDate } }],
        planStatus: "INACTIVE",
        status: status.ACTIVE,
      });
      for (let i = 0; i < activePlan.length; i++) {
        let userFindRes = await findUser({ _id: activePlan[i].userId._id });
        let priviousRes = await lastedBuyPlan({
          userId: activePlan[i].userId,
          _id: userFindRes.subscriptionPlaneId,
        });
        if (priviousRes.planStatus == "INACTIVE") {
          let planRes = await findSubscriptionPlan({
            _id: priviousRes.subScriptionPlanId._id,
          });
          if (planRes) {
            let pendingRes = await buySubsciptionPlanData({
              userId: activePlan[i].userId,
              payment_status: {
                $in: [
                  "waiting",
                  "confirming",
                  "confirmed",
                  "sending",
                  "partially_paid",
                ],
              },
            });
            if (pendingRes) {
              finalResult.push(activePlan[i].userId.email);
            } else {
              if (planRes) {
                finalResult.push(activePlan[i].userId.email);
              }
            }
          }
        }
      }
      return res.json(new response(finalResult, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script7:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script7(req, res, next) {
    try {
      let allFuelWalletDeduction = await fuelWalletDeductionHistoryList({
        status: status.ACTIVE,
        coinName: "FIERO",
      });
      let [triangularUpdate, intraUpdate, DirectUpdate] = await Promise.all([
        fuelWalletDeductionHistoryUpdate(
          { arbitrageName: arbitrage.TriangularArbitrage },
          { arbitrageName: "Quantum Loop" }
        ),
        fuelWalletDeductionHistoryUpdate(
          { arbitrageName: arbitrage.IntraArbitrageSingleExchange },
          { arbitrageName: "Quantum Bridge" }
        ),
        fuelWalletDeductionHistoryUpdate(
          { arbitrageName: arbitrage.DirectArbitrage },
          { arbitrageName: "Quantum Flow" }
        ),
      ]);
      if (allFuelWalletDeduction.length != 0) {
        for (let i = 0; i < allFuelWalletDeduction.length; i++) {
          if (allFuelWalletDeduction[i].coinName == "FIERO") {
            await updateUserById(
              { _id: allFuelWalletDeduction[i].userId },
              {
                $inc: {
                  fuelFIEROBalance: -Number(allFuelWalletDeduction[i].amount),
                  fuelUSDBalance: Number(allFuelWalletDeduction[i].amount),
                },
              },
              { new: true }
            );
          }
        }
      }
      return res.json(new response({}, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/buySubscriptionCard:
   *   post:
   *     tags:
   *       - SUBSCRIPTION
   *     description: buySubscription
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: subscriptionPlanId
   *         description: subscriptionPlanId
   *         in: formData
   *         required: true
   *       - name: billingstreet
   *         description: billingstreet
   *         in: formData
   *         required: true
   *       - name: billingtown
   *         description: billingtown
   *         in: formData
   *         required: true
   *       - name: billingpostcode
   *         description: billingpostcode
   *         in: formData
   *         required: true
   *       - name: billingcountryiso2a
   *         description: billingcountryiso2a
   *         in: formData
   *         required: true
   *       - name: billingcounty
   *         description: billingcounty
   *         in: formData
   *         required: true
   *       - name: couponCode
   *         description: couponCode
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async buySubscriptionCard(req, res, next) {
    const validationSchema = {
      subscriptionPlanId: Joi.string().required(),
      billingstreet: Joi.string().required(),
      billingtown: Joi.string().required(),
      billingpostcode: Joi.string().required(),
      billingcountryiso2a: Joi.string().required(),
      billingcounty: Joi.string().required(),
      couponCode: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let subscriptionRes = await findSubscriptionPlan({
        _id: validatedBody.subscriptionPlanId,
        planStatus: "ACTIVE",
        status: status.ACTIVE,
        subscriptionType: { $ne: subscriptionPlanType.FREE },
      });
      if (!subscriptionRes) {
        throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
      }
      let couponPrice = 0;
      let couponHistoryObj;
      if (validatedBody.couponCode) {
        let checkCouponCode = await findCouponHistory({
          couponCode: validatedBody.couponCode,
          status: status.ACTIVE,
        });
        if (!checkCouponCode) {
          throw apiError.notFound(responseMessage.COUPON_CODE_INVALID);
        }
        let checkCoupon = await findCoupon({
          _id: checkCouponCode.couponId,
          status: status.ACTIVE,
        });
        let checkPlan = checkCoupon.planId.find(
          (item) => item == validatedBody.subscriptionPlanId
        );
        if (!checkPlan) {
          throw apiError.notFound(responseMessage.COUPON_CODE_APPLICABLE);
        }
        if (
          checkCoupon.price >
          Number(subscriptionRes.value) + Number(subscriptionRes.recursiveValue)
        ) {
          throw apiError.notFound(responseMessage.PLAN_PRICE_LOW);
        }
        if (checkCoupon.couponType == couponType.EXCLUSIVE_COUPONS) {
          let checkUser = checkCoupon.inviteUser.find(
            (item) => item == userResult._id.toString()
          );
          if (!checkUser) {
            throw apiError.notFound(
              responseMessage.COUPON_CODE_APPLICABLE_USER
            );
          }
        }
        if (checkCoupon.couponType == couponType.BULK_COUPONS) {
          if (checkCoupon.quantity <= 0) {
            throw apiError.notFound(responseMessage.COUPON_LIMIT_EXCEED);
          }
        }
        let [checkCouponHistory, findNextCoupon] = await Promise.all([
          findCouponHistory({
            couponId: checkCoupon._id,
            userId: userResult._id,
            couponType: checkCoupon.couponType,
            isUse: true,
          }),
          findCouponHistory({
            couponId: checkCoupon._id,
            userId: { $exists: false },
            couponType: checkCoupon.couponType,
            isUse: false,
          }),
        ]);
        if (checkCouponHistory) {
          throw apiError.notFound(responseMessage.COUPON_ALREADY_USE);
        }
        couponPrice = Number(checkCoupon.price);
        couponHistoryObj = {
          userId: userResult._id,
          isUse: true,
          nextId: findNextCoupon._id,
          coupon_Id: findNextCoupon.couponId,
          planId: subscriptionRes._id,
        };
      }
      let dayBeforeExpire = 10;
      let dayAfterExpireGrace = -3;
      let buyAmount =
        Number(subscriptionRes.value) +
        Number(subscriptionRes.recursiveValue) -
        Number(couponPrice);
      let checkExist = await lastedBuyPlan({
        userId: userResult._id,
        planStatus: { $ne: "PENDING" },
        status: status.ACTIVE,
      });
      if (checkExist) {
        let priviousRes = await findSubscriptionPlan({
          _id: checkExist.subScriptionPlanId._id,
        });
        if (
          priviousRes.subscriptionType == subscriptionPlanType.PAID &&
          subscriptionRes.subscriptionType == subscriptionPlanType.PAID
        ) {
          const date1 = new Date(checkExist.endTime);
          const date2 = new Date();
          const differenceInTime = date2.getTime() - date1.getTime();
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          if (Math.round(differenceInDays) <= dayBeforeExpire) {
            if (Number(priviousRes.value) >= Number(subscriptionRes.value)) {
              if (
                Math.round(differenceInDays) <= dayBeforeExpire &&
                Math.round(differenceInDays) >= dayAfterExpireGrace
              ) {
                buyAmount = Number(subscriptionRes.recursiveValue);
              } else {
                throw apiError.conflict(
                  responseMessage.SUBSCRIPTION_PLAN_ALREADY_EXIST
                );
              }
            } else {
              buyAmount =
                Number(subscriptionRes.value) -
                Number(priviousRes.value) +
                Number(subscriptionRes.recursiveValue);
            }
          } else {
            buyAmount =
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue) -
              Number(couponPrice);
          }
        } else if (
          priviousRes.subscriptionType == subscriptionPlanType.CUSTOM &&
          subscriptionRes.subscriptionType == subscriptionPlanType.CUSTOM
        ) {
          const date1 = new Date(checkExist.endTime);
          const date2 = new Date();
          const differenceInTime = date2.getTime() - date1.getTime();
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          if (Math.round(differenceInDays) <= dayBeforeExpire) {
            if (
              Math.round(differenceInDays) <= dayBeforeExpire &&
              Math.round(differenceInDays) >= dayAfterExpireGrace
            ) {
              buyAmount = Number(subscriptionRes.recursiveValue);
            } else {
              throw apiError.conflict(
                responseMessage.SUBSCRIPTION_PLAN_ALREADY_EXIST
              );
            }
          } else {
            buyAmount =
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue) -
              Number(couponPrice);
          }
        } else if (
          (priviousRes.subscriptionType == subscriptionPlanType.CUSTOM ||
            priviousRes.subscriptionType == subscriptionPlanType.FREE) &&
          subscriptionRes.subscriptionType == subscriptionPlanType.PAID
        ) {
          buyAmount =
            Number(subscriptionRes.value) +
            Number(subscriptionRes.recursiveValue) -
            Number(couponPrice);
        } else {
          throw apiError.badRequest(responseMessage.INVALID_SUBSCRIPTION);
        }
      }
      if (Number(buyAmount) < 20) {
        throw apiError.badRequest(responseMessage.INVALID_COUPON_FOR_THIS_PLAN);
      }
      let order_id = commonFunction.generateOrder();
      let keys = await findKeys();
      if (!keys) {
        throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
      }
      let [trustPaymentIssuer, trustPaymentSiteReference, trustPaymentSecret] =
        await Promise.all([
          commonFunction.decrypt(keys.trustPaymentIssuer),
          commonFunction.decrypt(keys.trustPaymentSiteReference),
          commonFunction.decrypt(keys.trustPaymentSecret),
        ]);
      const payload = {
        iss: trustPaymentIssuer,
        iat: Math.floor(Date.now() / 1000),
        payload: {
          billingfirstname: userResult.firstName,
          billinglastname: userResult.lastName,
          billingstreet: validatedBody.billingstreet,
          billingtown: validatedBody.billingtown,
          billingcounty: validatedBody.billingcounty,
          billingpostcode: validatedBody.billingpostcode,
          billingcountryiso2a: validatedBody.billingcountryiso2a,
          billingemail: userResult.email,
          billingtelephone: userResult.mobileNumber,
          billingtelephonetype: "M",
          currencyiso3a: "USD",
          orderreference: order_id,
          sitereference: trustPaymentSiteReference,
          accounttypedescription: "ECOM",
          requesttypedescriptions: ["THREEDQUERY", "AUTH"],
          mainamount: buyAmount.toString(),
          credentialsonfile: "1",
          subscriptionnumber: "1",
          subscriptionfinalnumber: "0",
          subscriptiontype: "RECURRING",
        },
      };

      const secret = trustPaymentSecret;
      let token = jwt.sign(payload, secret, { algorithm: "HS256" });
      let obj = {
        userId: userResult._id,
        subScriptionPlanId: subscriptionRes._id,
        tradeFee: subscriptionRes.tradeFee,
        price_amount: buyAmount.toString(),
        payment_status: "finished",
        pay_currency: "USD",
        pay_amount: buyAmount.toString(),
        order_id: order_id,
        price_currency: "USD",
        exchangeUID: subscriptionRes.exchangeUID,
        arbitrageName: subscriptionRes.arbitrageName,
        pairs: subscriptionRes.pairs,
        capital: subscriptionRes.capital,
        profits: subscriptionRes.profits,
        coinType: subscriptionRes.coinType,
        isFuelDeduction: subscriptionRes.isFuelDeduction,
        paymentType: paymentType.CARD,
      };
      // let createObj = await buySubsciptionPlanCreate(obj)
      return res.json(
        new response(
          { token: token, obj: obj },
          responseMessage.TOKEN_GENERATED
        )
      );
    } catch (error) {
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/script8:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script8(req, res, next) {
    try {
      let saveData = [];
      let allUser = await findAllUser({ userGroup: { $exists: false } });
      for (let i = 0; i < allUser.length; i++) {
        let array = ["USER0", "USER1"];
        let randomElement = array[Math.floor(Math.random() * array.length)];
        console.log(randomElement);
        let updateRes = await updateUserById(
          { _id: allUser[i]._id },
          { userGroup: randomElement }
        );
        saveData.push(updateRes._id);
      }
      let resulst = await multiUpdateUser(
        {},
        {
          $set: {
            "sniperBotPlaceTime.triangular": Date.now(),
            "sniperBotPlaceTime.direct": Date.now(),
            "sniperBotPlaceTime.intraSingleExchange": Date.now(),
          },
        }
      );
      let paymentTypeRes = await multiUpdateUser(
        { paymentType: { $exists: false } },
        { paymentType: paymentType.CRYPTO }
      );
      let updatesubscriptionPlan = await updateManySubscription(
        { paymentType: { $exists: false } },
        { paymentType: paymentType.CRYPTO }
      );
      let allUserRes = await findAllUser({});
      let cryptoCurrencyArray = [];
      for (let i = 0; i < allUserRes.length; i++) {
        let buySubscriptionRes = await lastedBuyPlan({
          userId: allUserRes[i]._id,
        });
        if (buySubscriptionRes) {
          cryptoCurrencyArray.push(allUserRes[i]._id.toString());
          let updateRes = await updateUserById(
            { _id: allUserRes[i]._id },
            { cryptoCurrency: buySubscriptionRes.pay_currency }
          );
        }
      }
      let subcriptionPaid = await updateManySubscriptionPlan(
        { subscriptionType: { $exists: false } },
        { subscriptionType: subscriptionPlanType.PAID }
      );
      let subcriptionPaidRes = await updateManySubscriptionPlan(
        { show: { $exists: false } },
        { show: true }
      );
      let subscriptionRes = await multiUpdateUser(
        { subscriptionType: { $exists: false } },
        { subscriptionType: subscriptionPlanType.PAID }
      );
      let obj = {
        resulst: resulst,
        saveData: saveData,
        paymentTypeRes: paymentTypeRes,
        cryptoCurrencyArray: cryptoCurrencyArray,
        updatesubscriptionPlan: updatesubscriptionPlan,
        subcriptionPaid: subcriptionPaid,
        subcriptionPaidRes: subcriptionPaidRes,
        subscriptionRes: subscriptionRes,
      };
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/createdocusealinfo:
   *   post:
   *     tags:
   *       - USER
   *     description: createdocusealinfo
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: submission_id
   *         description: submission_id
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async createdocusealinfo(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var payload = {
        method: "get",
        url: `https://api.docuseal.eu/submissions/${req.body.submission_id}`,
        headers: {
          "X-Auth-Token": config.get("docuseal"),
        },
      };
      let docusealRes = await axios(payload);
      if (docusealRes.status == 200) {
        let obj = JSON.parse(JSON.stringify(docusealRes.data));
        obj.docuseal_status = obj.status;
        obj.userId = userResult._id;
        obj.status = "ACTIVE";
        let result = await createUpdatDocuseal({ userId: userResult._id }, obj);
        await updateUser(
          { _id: userResult._id },
          { $set: { isRejected: false } }
        );
        return res.json(new response(result, responseMessage.USER_DETAILS));
      } else {
        throw apiError.internal(responseMessage.INTERNAL_ERROR);
      }
    } catch (error) {
      const keys = Object.keys(error.response.data);
      if (keys[0] == "error") {
        return next(apiError.badRequest(error.response.data.error));
      } else if (keys[0] == "status") {
        return next(apiError.badRequest("Submission ID invalid."));
      }
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/updatePaymentMethod:
   *   put:
   *     tags:
   *       - USER
   *     description: updatePaymentMethod
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: paymentType
   *         description: paymentType (CRYPTO,CARD)
   *         in: formData
   *         required: true
   *       - name: currency
   *         description: currency
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async updatePaymentMethod(req, res, next) {
    const validationSchema = {
      paymentType: Joi.string().required(),
      currency: Joi.string().optional(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
        userType: userType.USER,
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }

      if (validatedBody.paymentType == "CRYPTO") {
        const headers = {
          "Content-Type": "application/json",
          "x-api-key": config.get("nowPaymentApiKey"),
        };
        let coinRes = await axios.get(
          config.get("nowPaymentUrl") + "v1/merchant/coins",
          { headers }
        );
        if (coinRes.status == 200) {
          let currencies = { currencies: coinRes.data.selectedCurrencies };
          let checkCurrencies = currencies.currencies.includes(
            validatedBody.currency
          );
          if (!checkCurrencies) {
            throw apiError.badRequest(responseMessage.INVALID_CURRENCY);
          }
          let result = await updateUser(
            { _id: userResult._id },
            {
              paymentType: paymentType.CRYPTO,
              cryptoCurrency: validatedBody.currency,
            }
          );
          return res.json(new response(result, responseMessage.CRYPTO_UPDATED));
        }
      }
      let keys = await findKeys();
      if (!keys) {
        throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
      }
      let [trustPaymentIssuer, trustPaymentSiteReference, trustPaymentSecret] =
        await Promise.all([
          commonFunction.decrypt(keys.trustPaymentIssuer),
          commonFunction.decrypt(keys.trustPaymentSiteReference),
          commonFunction.decrypt(keys.trustPaymentSecret),
        ]);
      const payload = {
        iss: trustPaymentIssuer,
        iat: Math.floor(Date.now() / 1000),
        payload: {
          currencyiso3a: "USD",
          orderreference: userResult._id,
          sitereference: trustPaymentSiteReference,
          accounttypedescription: "ECOM",
          requesttypedescriptions: ["THREEDQUERY", "ACCOUNTCHECK"],
          mainamount: "1",
          credentialsonfile: "1",
          subscriptionnumber: "1",
          subscriptionfinalnumber: "0",
          subscriptiontype: "RECURRING",
        },
      };

      const secret = trustPaymentSecret;
      let token = jwt.sign(payload, secret, { algorithm: "HS256" });
      return res.json(
        new response({ token: token }, responseMessage.CARD_UPDATED)
      );

      // } else {
      //     throw apiError.notFound(`${result.data.response[0].errormessage} - ${result.data.response[0].errordata[0]}`);

      // }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/trustPaymentCoin:
   *   get:
   *     tags:
   *       - USER
   *     description: Get coin.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async trustPaymentCoin(req, res, next) {
    try {
      return res.json(
        new response(trustPaymentCoin, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/checkAvailableCoupon:
   *   post:
   *     tags:
   *       - SUBSCRIPTION
   *     description: checkAvailableCoupon
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *       - name: subscriptionPlanId
   *         description: subscriptionPlanId
   *         in: formData
   *         required: true
   *       - name: couponCode
   *         description: couponCode
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async checkAvailableCoupon(req, res, next) {
    const validationSchema = {
      subscriptionPlanId: Joi.string().required(),
      couponCode: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let subscriptionRes = await findSubscriptionPlan({
        _id: validatedBody.subscriptionPlanId,
        planStatus: "ACTIVE",
        status: status.ACTIVE,
      });
      if (!subscriptionRes) {
        throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
      }
      let couponPrice = 0;
      if (validatedBody.couponCode) {
        let checkCouponCode = await findCouponHistory({
          couponCode: validatedBody.couponCode,
          status: status.ACTIVE,
        });
        if (!checkCouponCode) {
          throw apiError.notFound(responseMessage.COUPON_CODE_INVALID);
        }
        let checkCoupon = await findCoupon({
          _id: checkCouponCode.couponId,
          status: status.ACTIVE,
        });
        let checkPlan = checkCoupon.planId.find(
          (item) => item == validatedBody.subscriptionPlanId
        );
        if (!checkPlan) {
          throw apiError.notFound(responseMessage.COUPON_CODE_APPLICABLE);
        }
        if (
          checkCoupon.price >
          Number(subscriptionRes.value) + Number(subscriptionRes.recursiveValue)
        ) {
          throw apiError.notFound(responseMessage.PLAN_PRICE_LOW);
        }
        if (checkCoupon.couponType == couponType.EXCLUSIVE_COUPONS) {
          let checkUser = checkCoupon.inviteUser.find(
            (item) => item == userResult._id.toString()
          );
          if (!checkUser) {
            throw apiError.notFound(
              responseMessage.COUPON_CODE_APPLICABLE_USER
            );
          }
        }
        if (checkCoupon.couponType == couponType.BULK_COUPONS) {
          if (checkCoupon.quantity <= 0) {
            throw apiError.notFound(responseMessage.COUPON_LIMIT_EXCEED);
          }
        }
        let [checkCouponHistory, findNextCoupon] = await Promise.all([
          findCouponHistory({
            couponId: checkCoupon._id,
            userId: userResult._id,
            couponType: checkCoupon.couponType,
            isUse: true,
          }),
          findCouponHistory({
            couponId: checkCoupon._id,
            userId: { $exists: false },
            couponType: checkCoupon.couponType,
            isUse: false,
          }),
        ]);
        if (checkCouponHistory) {
          throw apiError.notFound(responseMessage.COUPON_ALREADY_USE);
        }
        couponPrice = Number(checkCoupon.price);
      }
      let dayBeforeExpire = 10;
      let dayAfterExpireGrace = -3;
      let finalResObj = {
        planAmount:
          Number(subscriptionRes.value) +
          Number(subscriptionRes.recursiveValue),
        couponAmount: Number(couponPrice),
        totalBuyAmount:
          Number(subscriptionRes.value) +
          Number(subscriptionRes.recursiveValue) -
          Number(couponPrice),
      };
      let buyAmount =
        Number(subscriptionRes.value) +
        Number(subscriptionRes.recursiveValue) -
        Number(couponPrice);
      let checkExist = await lastedBuyPlan({
        userId: userResult._id,
        planStatus: { $ne: "PENDING" },
        status: status.ACTIVE,
      });
      if (checkExist) {
        let priviousRes = await findSubscriptionPlan({
          _id: checkExist.subScriptionPlanId._id,
        });
        const date1 = new Date(checkExist.endTime);
        const date2 = new Date();
        const differenceInTime = date2.getTime() - date1.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        if (
          priviousRes.subscriptionType == subscriptionPlanType.PAID &&
          subscriptionRes.subscriptionType == subscriptionPlanType.PAID
        ) {
          if (Math.round(differenceInDays) <= dayBeforeExpire) {
            if (Number(priviousRes.value) >= Number(subscriptionRes.value)) {
              if (
                Math.round(differenceInDays) <= dayBeforeExpire &&
                Math.round(differenceInDays) >= dayAfterExpireGrace
              ) {
                buyAmount = Number(subscriptionRes.recursiveValue);
                finalResObj = {
                  planAmount: Number(subscriptionRes.recursiveValue),
                  couponAmount: 0,
                  totalBuyAmount: Number(subscriptionRes.recursiveValue),
                };
              } else {
                throw apiError.conflict(
                  responseMessage.SUBSCRIPTION_PLAN_ALREADY_EXIST
                );
              }
            } else {
              buyAmount =
                Number(subscriptionRes.value) -
                Number(priviousRes.value) +
                Number(subscriptionRes.recursiveValue);
              finalResObj = {
                planAmount:
                  Number(subscriptionRes.value) -
                  Number(priviousRes.value) +
                  Number(subscriptionRes.recursiveValue),
                couponAmount: 0,
                totalBuyAmount:
                  Number(subscriptionRes.value) -
                  Number(priviousRes.value) +
                  Number(subscriptionRes.recursiveValue),
              };
            }
          } else {
            buyAmount =
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue) -
              Number(couponPrice);
            finalResObj = {
              planAmount:
                Number(subscriptionRes.value) +
                Number(subscriptionRes.recursiveValue),
              couponAmount: Number(couponPrice),
              totalBuyAmount:
                Number(subscriptionRes.value) +
                Number(subscriptionRes.recursiveValue) -
                Number(couponPrice),
            };
          }
        } else if (
          priviousRes.subscriptionType == subscriptionPlanType.CUSTOM &&
          subscriptionRes.subscriptionType == subscriptionPlanType.CUSTOM
        ) {
          const date1 = new Date(checkExist.endTime);
          const date2 = new Date();
          const differenceInTime = date2.getTime() - date1.getTime();
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          if (Math.round(differenceInDays) <= dayBeforeExpire) {
            if (
              Math.round(differenceInDays) <= dayBeforeExpire &&
              Math.round(differenceInDays) >= dayAfterExpireGrace
            ) {
              buyAmount = Number(subscriptionRes.recursiveValue);
              finalResObj = {
                planAmount: Number(subscriptionRes.recursiveValue),
                couponAmount: 0,
                totalBuyAmount: Number(subscriptionRes.recursiveValue),
              };
            } else {
              throw apiError.conflict(
                responseMessage.SUBSCRIPTION_PLAN_ALREADY_EXIST
              );
            }
          } else {
            buyAmount =
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue) -
              Number(couponPrice);
            finalResObj = {
              planAmount:
                Number(subscriptionRes.value) +
                Number(subscriptionRes.recursiveValue),
              couponAmount: Number(couponPrice),
              totalBuyAmount:
                Number(subscriptionRes.value) +
                Number(subscriptionRes.recursiveValue) -
                Number(couponPrice),
            };
          }
        } else if (
          (priviousRes.subscriptionType == subscriptionPlanType.CUSTOM ||
            priviousRes.subscriptionType == subscriptionPlanType.FREE) &&
          subscriptionRes.subscriptionType == subscriptionPlanType.PAID
        ) {
          buyAmount =
            Number(subscriptionRes.value) +
            Number(subscriptionRes.recursiveValue) -
            Number(couponPrice);
          finalResObj = {
            planAmount:
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue),
            couponAmount: Number(couponPrice),
            totalBuyAmount:
              Number(subscriptionRes.value) +
              Number(subscriptionRes.recursiveValue) -
              Number(couponPrice),
          };
        } else {
          throw apiError.badRequest(responseMessage.INVALID_SUBSCRIPTION);
        }
      }
      if (Number(finalResObj.totalBuyAmount) < 20) {
        throw apiError.badRequest(responseMessage.INVALID_COUPON_FOR_THIS_PLAN);
      }
      return res.json(new response(finalResObj, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/getCustomPlan:
   *   get:
   *     tags:
   *       - USER
   *     description: getCustomPlan
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async getCustomPlan(req, res, next) {
    try {
      let userResult = await findUserWithPopulate({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (userResult.subscriptionType == subscriptionPlanType.CUSTOM) {
        let customRes = await lastedBuyPlan({
          userId: userResult._id,
          paymentType: paymentType.CASH,
          status: status.ACTIVE,
        });
        if (!customRes) {
          throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
        } else {
          let result = await findSubscriptionPlan({
            _id: customRes.subScriptionPlanId._id,
            status: status.ACTIVE,
          });
          if (result) {
            return res.json(
              new response(result, responseMessage.SUBSCRIPTION_PLAN)
            );
          } else {
            throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
          }
        }
      } else {
        throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
      }
    } catch (error) {
      return next(error);
    }
  }

  async getTrustPaymentResult(req, res, next) {
    try {
      const { query, body, headers } = req;

      if (!query || !query.url) {
        return next(new Error("Invalid query parameters."));
      }

      const urls = JSON.parse(query.url);

      if (body.errorcode !== "0") {
        return res.redirect(urls.failUrl);
      }
      let keys = await findKeys();
      if (!keys) {
        throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
      }
      let [trustPaymentSecret] = await Promise.all([
        commonFunction.decrypt(keys.trustPaymentSecret),
      ]);
      const data = await jwt.verify(body.jwt, trustPaymentSecret);
      const response = data.payload.response.find(
        (item) => item.requesttypedescription == "AUTH"
      );
      let objs = urls.obj;
      if (!response || response.errorcode !== "0" || !objs) {
        return res.redirect(urls.failUrl);
      }

      const userResult = await findUser({ _id: objs.userId });
      const subscriptionRes = await findSubscriptionPlan({
        _id: objs.subScriptionPlanId,
      });

      if (!userResult || !subscriptionRes) {
        return res.redirect(urls.failUrl);
      }

      const currentTime = new Date();
      let startTime = currentTime;
      let endTime = new Date(
        currentTime.getTime() +
        Number(subscriptionRes.planDuration) * 24 * 60 * 60 * 1000
      );
      let couponPrice = 0;
      let couponHistoryObj;
      if (userResult.subscriptionPlaneId) {
        const previousPlan = await lastedBuyPlan({
          userId: userResult._id,
          _id: userResult.subscriptionPlaneId,
          order_id: { $ne: response.orderreference },
        });

        if (previousPlan && previousPlan.status === status.ACTIVE) {
          const remainingDays = Math.round(
            (new Date(previousPlan.endTime) - currentTime) / (1000 * 3600 * 24)
          );
          if (remainingDays >= -3 && remainingDays <= 0) {
            startTime = new Date(previousPlan.endTime);
            endTime = new Date(
              startTime.getTime() +
              Number(subscriptionRes.planDuration) * 24 * 60 * 60 * 1000
            );
          }

          await Promise.all([
            buySubsciptionPlanUpdate(
              { _id: previousPlan._id },
              { planStatus: "INACTIVE" }
            ),
            updateUser(
              { _id: userResult._id },
              {
                previousPlaneId: previousPlan._id,
                previousPlanName: previousPlan.subScriptionPlanId.type,
                previousPlanStatus: "INACTIVE",
                paymentType: paymentType.CARD,
              }
            ),
          ]);
        }
      }
      const newSubscription = Object.assign(
        {
          payment_id: response.tid,
          pay_address: body.cardNumber,
          payment_status: "finished",
          transactionReference: response.transactionreference,
          settlestatus: response.settlestatus,
          startTime,
          endTime,
          planStatus: "ACTIVE",
        },
        urls.obj // Merge properties from urls.obj into the new object
      );
      // newSubscription.merge(urls.obj)
      const createdSubscription = await buySubsciptionPlanCreate(
        newSubscription
      );

      await updateUser(
        { _id: userResult._id },
        {
          subscriptionPlaneId: createdSubscription._id,
          currentPlanName: subscriptionRes.title,
          currentPlanStatus: "ACTIVE",
          subscriptionPlaneStatus: true,
          planCapitalAmount: subscriptionRes.capital,
          // planProfit: subscriptionRes.profits,
          paymentType: paymentType.CARD,
          transactionReference: createdSubscription.transactionReference,
          subscriptionType: subscriptionRes.subscriptionType,
        }
      );

      if (couponHistoryObj) {
        await Promise.all([
          updateCoupon(
            { _id: couponHistoryObj.coupon_Id },
            { $inc: { quantity: -1 } }
          ),
          updateCouponHistory(
            { _id: couponHistoryObj.nextId },
            couponHistoryObj
          ),
        ]);
      }

      return res.redirect(urls.successUrl);
    } catch (error) {
      return next(error);
    }
  }

  async trustPaymentUpdateCredential(req, res, next) {
    try {
      console.log("fsdnfsdfljsdfjksldjfklsd");
      const { query, body, headers } = req;

      if (!query || !query.url) {
        return next(new Error("Invalid query parameters."));
      }

      const urls = JSON.parse(query.url);

      if (body.errorcode !== "0") {
        return res.redirect(urls.failUrl);
      }

      let keys = await findKeys();
      if (!keys) {
        throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
      }
      let [trustPaymentSecret] = await Promise.all([
        commonFunction.decrypt(keys.trustPaymentSecret),
      ]);
      const data = await jwt.verify(body.jwt, trustPaymentSecret);
      const response = data.payload.response.find(
        (item) => item.requesttypedescription == "ACCOUNTCHECK"
      );

      if (!response || response.errorcode !== "0") {
        return res.redirect(urls.failUrl);
      }

      const userResult = await findUser({ _id: response.orderreference });

      if (!userResult) {
        return res.redirect(urls.failUrl);
      }

      await updateUser(
        { _id: userResult._id },
        {
          transactionReference: response.transactionreference,
          paymentType: "CARD",
        }
      );
      return res.redirect(urls.successUrl);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/trustPaymentCountries:
   *   get:
   *     tags:
   *       - USER
   *     description: Get coin.
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async trustPaymentCountries(req, res, next) {
    try {
      return res.json(
        new response(trustPaymentCountry, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script9:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script9(req, res, next) {
    try {
      let updateRes = await multiTriangularUpdate(
        {
          status: "ACTIVE",
          arbitrageStatus: "PENDING",
          isFirstStrategy: false,
        },
        { isFirstStrategy: true }
      );
      return res.json(new response(updateRes, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script10:
   *   get:
   *     tags:
   *       - script
   *     description: script
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script10(req, res, next) {
    try {
      let saveData = [];
      let trianagularAll = await triangularAllList({
        arbitrageStatus: "PENDING",
        arbitrageType: "SNIPER",
        sniperGroup: { $exists: false },
      });
      for (let i = 0; i < trianagularAll.length; i++) {
        let array = ["SNIPER0", "SNIPER1"];
        let randomElement = array[Math.floor(Math.random() * array.length)];
        let updateTriangular = await triangularUpdate(
          { _id: trianagularAll[i]._id },
          { sniperGroup: randomElement }
        );
        saveData.push(updateTriangular._id);
      }
      return res.json(new response(saveData, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script11:
   *   put:
   *     tags:
   *       - USER
   *     description: script11
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async script11(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let updateResult = await updateUser(
        { _id: userResult._id },
        { $set: req.body }
      );
      updateResult = JSON.parse(JSON.stringify(updateResult));
      delete updateResult.password;
      delete updateResult.otp;
      return res.json(
        new response(updateResult, responseMessage.PROFILE_UPDATED)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script12:
   *   put:
   *     tags:
   *       - USER
   *     description: script12
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async script12(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let findData = await findFuelWalletDeductionHistory({
        _id: req.body.walletId,
        userId: userResult._id,
      });
      if (!findData) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      let updateRes = await updateFuelWalletDeductionHistory(
        { _id: findData._id },
        { $set: req.body }
      );
      return res.json(new response(updateRes, responseMessage.PROFILE_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script15:
   *   post:
   *     tags:
   *       - script
   *     description: script15
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: subScriptionPlanId
   *         description: subScriptionPlanId
   *         in: formData
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: formData
   *         required: true
   *       - name: author
   *         description: author
   *         in: formData
   *         required: true
   *       - name: orderreference
   *         description: orderreference
   *         in: formData
   *         required: true
   *       - name: tid
   *         description: tid
   *         in: formData
   *         required: true
   *       - name: cardNumber
   *         description: cardNumber
   *         in: formData
   *         required: true
   *       - name: transactionreference
   *         description: transactionreference
   *         in: formData
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script15(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
      subScriptionPlanId: Joi.string().required(),
      author: Joi.string().required(),
      orderreference: Joi.string().required(),
      tid: Joi.string().required(),
      cardNumber: Joi.string().required(),
      transactionreference: Joi.string().required(),
      amount: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let author = "astroqunt_arbitragebot";
      if (req.body.author != author) {
        throw apiError.unauthorized(
          "You are not authorized for this activity."
        );
      }
      const userResult = await findUser({ _id: req.body.userId });
      const subscriptionRes = await findSubscriptionPlan({
        _id: req.body.subScriptionPlanId,
      });
      const currentTime = new Date();
      let startTime = currentTime;
      let endTime = new Date(
        currentTime.getTime() +
        Number(subscriptionRes.planDuration) * 24 * 60 * 60 * 1000
      );
      if (userResult.subscriptionPlaneId) {
        const previousPlan = await lastedBuyPlan({
          userId: userResult._id,
          _id: userResult.subscriptionPlaneId,
          order_id: { $ne: req.body.orderreference },
        });

        if (previousPlan && previousPlan.status === status.ACTIVE) {
          const remainingDays = Math.round(
            (new Date(previousPlan.endTime) - currentTime) / (1000 * 3600 * 24)
          );
          if (remainingDays >= -3 && remainingDays <= 0) {
            startTime = new Date(previousPlan.endTime);
            endTime = new Date(
              startTime.getTime() +
              Number(subscriptionRes.planDuration) * 24 * 60 * 60 * 1000
            );
          }

          await Promise.all([
            buySubsciptionPlanUpdate(
              { _id: previousPlan._id },
              { planStatus: "INACTIVE" }
            ),
            updateUser(
              { _id: userResult._id },
              {
                previousPlaneId: previousPlan._id,
                previousPlanName: previousPlan.subScriptionPlanId.type,
                previousPlanStatus: "INACTIVE",
                paymentType: paymentType.CARD,
              }
            ),
          ]);
        }
      }
      const newSubscription = Object.assign({
        payment_id: req.body.tid,
        pay_address: req.body.cardNumber,
        payment_status: "finished",
        transactionReference: req.body.transactionreference,
        settlestatus: "0",
        startTime,
        endTime,
        planStatus: "ACTIVE",
        userId: userResult._id,
        subScriptionPlanId: subscriptionRes._id,
        tradeFee: subscriptionRes.tradeFee,
        price_amount: req.body.amount,
        payment_status: "finished",
        pay_currency: "USD",
        pay_amount: req.body.amount,
        order_id: req.body.orderreference,
        price_currency: "USD",
        exchangeUID: subscriptionRes.exchangeUID,
        arbitrageName: subscriptionRes.arbitrageName,
        pairs: subscriptionRes.pairs,
        capital: subscriptionRes.capital,
        profits: subscriptionRes.profits,
        coinType: subscriptionRes.coinType,
        isFuelDeduction: subscriptionRes.isFuelDeduction,
        paymentType: paymentType.CARD,
      });
      const createdSubscription = await buySubsciptionPlanCreate(
        newSubscription
      );

      await updateUser(
        { _id: userResult._id },
        {
          subscriptionPlaneId: createdSubscription._id,
          currentPlanName: subscriptionRes.title,
          currentPlanStatus: "ACTIVE",
          subscriptionPlaneStatus: true,
          planCapitalAmount: subscriptionRes.capital,
          // planProfit: subscriptionRes.profits,
          paymentType: paymentType.CARD,
          transactionReference: createdSubscription.transactionReference,
          subscriptionType: subscriptionRes.subscriptionType,
        }
      );
      return res.json(new response([], responseMessage.PROFILE_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/script16:
   *   post:
   *     tags:
   *       - script
   *     description: script16
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: subScriptionPlanId
   *         description: subScriptionPlanId
   *         in: formData
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: formData
   *         required: true
   *       - name: author
   *         description: author
   *         in: formData
   *         required: true
   *       - name: cardNumber
   *         description: cardNumber
   *         in: formData
   *         required: true
   *       - name: transactionreference
   *         description: transactionreference
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script16(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
      subScriptionPlanId: Joi.string().required(),
      author: Joi.string().required(),
      cardNumber: Joi.string().required(),
      transactionreference: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let author = "astroqunt_arbitragebot";
      if (req.body.author != author) {
        throw apiError.unauthorized(
          "You are not authorized for this activity."
        );
      }
      let updateRes = await buySubsciptionPlanUpdate(
        { _id: req.body.subScriptionPlanId, userId: req.body.userId },
        {
          transactionReference: req.body.transactionReference,
          pay_address: req.body.cardNumber,
        }
      );
      return res.json(new response(updateRes, responseMessage.PROFILE_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/retryCardRecursivePayment:
   *   post:
   *     tags:
   *       - CARD
   *     description: retryCardRecursivePayment
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async retryCardRecursivePayment(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var endTime = new Date();
      var toDate = new Date();
      toDate.setTime(toDate.getTime() - 9 * 24 * 60 * 60 * 1000);
      let activePlan = await buySubscriptionhPlanList({
        $and: [{ endTime: { $gte: toDate } }, { endTime: { $lte: endTime } }],
        planStatus: "INACTIVE",
        status: status.ACTIVE,
        userId: userResult._id,
      });
      if (!activePlan) {
        throw apiError.notFound(
          "You are not eligible for reccuring payment. Please buy new plan."
        );
      }
      for (let i = 0; i < activePlan.length; i++) {
        let userFindRes = await findUser({
          _id: activePlan[i].userId._id,
          paymentType: paymentType.CARD,
          currentPlanStatus: "INACTIVE",
        });
        if (userFindRes) {
          let [priviousRes, planCounts] = await Promise.all([
            lastedBuyPlan({
              userId: activePlan[i].userId._id,
              _id: userFindRes.subscriptionPlaneId,
            }),
            buySubsciptionPlanCount({
              userId: activePlan[i].userId._id,
              paymentType: paymentType.CARD,
            }),
          ]);
          if (priviousRes.planStatus == "INACTIVE") {
            let planRes = await findSubscriptionPlan({
              _id: priviousRes.subScriptionPlanId._id,
              status: status.ACTIVE,
            });
            let order_id = commonFunction.generateOrder();
            let keys = await findKeys();
            if (!keys) {
              throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
            }
            let [
              trustPaymentAlias,
              trustPaymentSiteReference,
              trustPaymentUrl,
              userName,
              password,
            ] = await Promise.all([
              commonFunction.decrypt(keys.trustPaymentAlias),
              commonFunction.decrypt(keys.trustPaymentSiteReference),
              commonFunction.decrypt(keys.trustPaymentUrl),
              commonFunction.decrypt(keys.trustPaymentUserName),
              commonFunction.decrypt(keys.trustPaymentPassword),
            ]);
            if (planRes) {
              const paymentData = JSON.stringify({
                alias: trustPaymentAlias,
                version: "1.00",
                request: [
                  {
                    sitereference: trustPaymentSiteReference,
                    requesttypedescriptions: ["AUTH"],
                    accounttypedescription: "RECUR",
                    parenttransactionreference:
                      userFindRes.transactionReference,
                    mainamount: planRes.recursiveValue.toString(),
                    subscriptiontype: "RECURRING",
                    subscriptionnumber: "1",
                    credentialsonfile: "2",
                    orderreference: order_id,
                  },
                ],
              });
              let authToken =
                await commonFunction.generateTrustPaymentAuthToken(
                  userName,
                  password
                );
              const headers = {
                "Content-type": "application/json",
                Accept: "application/json",
                Authorization: "Basic " + authToken,
              };
              let result = await axios.post(trustPaymentUrl, paymentData, {
                headers,
              });
              console.log("fdsfl;sdfldsfklds", result.data);
              if (result.data.response[0].errorcode == "0") {
                var endTime = new Date();
                endTime.setTime(
                  endTime.getTime() +
                  Number(planRes.planDuration) * 24 * 60 * 60 * 1000
                );
                let startTime = new Date();
                let obj = {
                  userId: activePlan[i].userId._id,
                  subScriptionPlanId: planRes._id,
                  tradeFee: planRes.tradeFee,
                  price_amount: result.data.response[0].baseamount / 100,
                  payment_id: result.data.response[0].tid,
                  pay_address: result.data.response[0].maskedpan,
                  payment_status: "finished",
                  pay_currency: result.data.response[0].currencyiso3a,
                  pay_amount: result.data.response[0].baseamount / 100,
                  price_currency: result.data.response[0].currencyiso3a,
                  transactionReference:
                    result.data.response[0].transactionreference,
                  settlestatus: result.data.response[0].settlestatus,
                  order_id: result.data.response[0].orderreference,
                  exchangeUID: planRes.exchangeUID,
                  arbitrageName: planRes.arbitrageName,
                  pairs: planRes.pairs,
                  capital: planRes.capital,
                  profits: planRes.profits,
                  coinType: planRes.coinType,
                  isFuelDeduction: planRes.isFuelDeduction,
                  paymentType: paymentType.CARD,
                  startTime: startTime,
                  endTime: endTime,
                  planStatus: "ACTIVE",
                };
                let createObj = await buySubsciptionPlanCreate(obj);
                if (createObj) {
                  let [inActiveAll, updateRes] = await Promise.all([
                    buySubsciptionPlanUpdate(
                      { _id: activePlan[i]._id },
                      { planStatus: "INACTIVE" }
                    ),
                    updateUser(
                      { _id: createObj.userId },
                      {
                        previousPlaneId: activePlan[i]._id,
                        previousPlanName: planRes.type,
                        previousPlanStatus: "INACTIVE",
                        subscriptionPlaneId: createObj._id,
                        currentPlanName: planRes.title,
                        currentPlanStatus: "ACTIVE",
                        subscriptionPlaneStatus: true,
                        planCapitalAmount: planRes.capital,
                        // planProfit: planRes.profits,
                        paymentType: paymentType.CARD,
                        // transactionReference: createObj.transactionReference
                      }
                    ),
                  ]);
                }
                return res.json(
                  new response(
                    createObj,
                    "Recursive payment successfully executed."
                  )
                );
              } else {
                // await commonFunction.mailForExpCardPayment(activePlan[i].userId.email, 'Hi', planRes.type, activePlan[i].endTime, planRes.planDuration)
                console.log(
                  "Plan marked as INACTIVE due to non-payment after 10 days.",
                  `${result.data.response[0].errormessage} - ${result.data.response[0].errordata[0]}`
                );
                throw apiError.notFound(
                  `${result.data.response[0].errormessage} - ${result.data.response[0].errordata[0]}`
                );
              }
            } else {
              throw apiError.notFound("Subscription plan not found");
            }
          } else {
            throw apiError.notFound("Previous plan not found");
          }
        } else {
          throw apiError.notFound("User not found");
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/manualTrustPayment:
   *   put:
   *     tags:
   *       - USER
   *     description: manualTrustPayment
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async manualTrustPayment(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });

    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userData = await findUser({ email: validatedBody.email });
      if (!userData) {
        throw apiError.notFound("User not found");
      }

      const endTime = new Date();
      const toDate = new Date();
      toDate.setTime(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      let activePlans = await buySubscriptionhPlanListLimit({
        // $and: [{ endTime: { $gte: toDate } }, { endTime: { $lte: endTime } }],
        // planStatus: "INACTIVE",
        // status: status.ACTIVE,
        userId: userData._id,
      });
      let refKey;
      for (let plan of activePlans) {
        let userFindRes = await findUser({
          _id: plan.userId._id,
          paymentType: paymentType.CARD,
          // currentPlanStatus: "INACTIVE",
          recursivePayment: { $ne: false },
        });

        if (userFindRes) {
          let [previousRes, planCounts] = await Promise.all([
            lastedBuyPlan({
              userId: plan.userId._id,
              _id: userFindRes.subscriptionPlaneId,
            }),
            buySubsciptionPlanCount({
              userId: plan.userId._id,
              paymentType: paymentType.CARD,
            }),
          ]);
          let trxN = plan.trxNumber ? (plan.trxNumber + 1).toString() : "2";
          // if (previousRes.planStatus === "INACTIVE") {
          let planRes = await findSubscriptionPlan({
            _id: previousRes.subScriptionPlanId._id,
            status: status.ACTIVE,
          });
          if (!planRes) continue;

          let order_id = commonFunction.generateOrder();
          let keys = await findKeys();
          if (!keys) throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);

          let [
            trustPaymentAlias,
            trustPaymentSiteReference,
            trustPaymentUrl,
            userName,
            password,
          ] = await Promise.all([
            commonFunction.decrypt(keys.trustPaymentAlias),
            commonFunction.decrypt(keys.trustPaymentSiteReference),
            commonFunction.decrypt(keys.trustPaymentUrl),
            commonFunction.decrypt(keys.trustPaymentUserName),
            commonFunction.decrypt(keys.trustPaymentPassword),
          ]);

          const paymentData = JSON.stringify({
            alias: trustPaymentAlias,
            version: "1.00",
            request: [
              {
                sitereference: trustPaymentSiteReference,
                requesttypedescriptions: ["AUTH"],
                accounttypedescription: "RECUR",
                parenttransactionreference: userFindRes.transactionReference,
                mainamount: planRes.recursiveValue.toString(),
                subscriptiontype: "RECURRING",
                subscriptionnumber: trxN,
                credentialsonfile: "2",
                orderreference: order_id,
              },
            ],
          });

          let authToken = await commonFunction.generateTrustPaymentAuthToken(
            userName,
            password
          );
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authToken}`,
          };

          let result = await axios.post(trustPaymentUrl, paymentData, {
            headers,
          });
          if (result.data.response[0].errorcode === "0") {
            let startTime = new Date();
            let newEndTime = new Date(
              startTime.getTime() +
              Number(planRes.planDuration) * 24 * 60 * 60 * 1000
            );

            let subscriptionData = {
              userId: plan.userId._id,
              subScriptionPlanId: planRes._id,
              tradeFee: planRes.tradeFee,
              price_amount: result.data.response[0].baseamount / 100,
              payment_id: result.data.response[0].tid,
              pay_address: result.data.response[0].maskedpan,
              payment_status: "finished",
              pay_currency: result.data.response[0].currencyiso3a,
              pay_amount: result.data.response[0].baseamount / 100,
              price_currency: result.data.response[0].currencyiso3a,
              transactionReference:
                result.data.response[0].transactionreference,
              settlestatus: result.data.response[0].settlestatus,
              order_id: result.data.response[0].orderreference,
              startTime,
              endTime: newEndTime,
              planStatus: "ACTIVE",
              paymentType: paymentType.CARD,
              trxNumber: Number(trxN),
            };
            let createObj = await buySubsciptionPlanCreate(subscriptionData);
            if (createObj) {
              await Promise.all([
                buySubsciptionPlanUpdate(
                  { _id: plan._id },
                  { planStatus: "INACTIVE" }
                ),
                updateUser(
                  { _id: createObj.userId },
                  {
                    previousPlaneId: plan._id,
                    previousPlanName: planRes.type,
                    previousPlanStatus: "INACTIVE",
                    subscriptionPlaneId: createObj._id,
                    currentPlanName: planRes.title,
                    currentPlanStatus: "ACTIVE",
                    subscriptionPlaneStatus: true,
                    planCapitalAmount: planRes.capital,
                    // planProfit: planRes.profits,
                    paymentType: paymentType.CARD,
                  }
                ),
              ]);
            }
          } else {
            throw apiError.notFound(result.data.response[0].errormessage);
          }
          // }
        }
        refKey = userFindRes.transactionReference;
      }
      return res
        .status(200)
        .json({
          result: refKey,
          message: "Manual trust payment processing completed.",
        });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user/manualTrustPaymentWithAmount:
   *   put:
   *     tags:
   *       - USER
   *     description: manualTrustPaymentWithAmount
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async manualTrustPaymentWithAmount(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      amount: Joi.string().required(),
    });

    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userData = await findUser({ email: validatedBody.email });
      if (!userData) {
        throw apiError.notFound("User not found");
      }

      const endTime = new Date();
      const toDate = new Date();
      toDate.setTime(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      let activePlans = await buySubscriptionhPlanListLimit({
        // $and: [{ endTime: { $gte: toDate } }, { endTime: { $lte: endTime } }],
        // planStatus: "INACTIVE",
        // status: status.ACTIVE,
        userId: userData._id,
      });
      let refKey;
      for (let plan of activePlans) {
        let userFindRes = await findUser({
          _id: plan.userId._id,
          paymentType: paymentType.CARD,
          // currentPlanStatus: "INACTIVE",
          recursivePayment: { $ne: false },
        });

        if (userFindRes) {
          let [previousRes, planCounts] = await Promise.all([
            lastedBuyPlan({
              userId: plan.userId._id,
              _id: userFindRes.subscriptionPlaneId,
            }),
            buySubsciptionPlanCount({
              userId: plan.userId._id,
              paymentType: paymentType.CARD,
            }),
          ]);
          let trxN = plan.trxNumber ? (plan.trxNumber + 1).toString() : "2";
          // if (previousRes.planStatus === "INACTIVE") {
          let planRes = await findSubscriptionPlan({
            _id: previousRes.subScriptionPlanId._id,
            status: status.ACTIVE,
          });
          if (!planRes) continue;

          let order_id = commonFunction.generateOrder();
          let keys = await findKeys();
          if (!keys) throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);

          let [
            trustPaymentAlias,
            trustPaymentSiteReference,
            trustPaymentUrl,
            userName,
            password,
          ] = await Promise.all([
            commonFunction.decrypt(keys.trustPaymentAlias),
            commonFunction.decrypt(keys.trustPaymentSiteReference),
            commonFunction.decrypt(keys.trustPaymentUrl),
            commonFunction.decrypt(keys.trustPaymentUserName),
            commonFunction.decrypt(keys.trustPaymentPassword),
          ]);

          const paymentData = JSON.stringify({
            alias: trustPaymentAlias,
            version: "1.00",
            request: [
              {
                sitereference: trustPaymentSiteReference,
                requesttypedescriptions: ["AUTH"],
                accounttypedescription: "RECUR",
                parenttransactionreference: userFindRes.transactionReference,
                mainamount: validatedBody.amount,
                subscriptiontype: "RECURRING",
                subscriptionnumber: trxN,
                credentialsonfile: "2",
                orderreference: order_id,
              },
            ],
          });

          let authToken = await commonFunction.generateTrustPaymentAuthToken(
            userName,
            password
          );
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authToken}`,
          };

          let result = await axios.post(trustPaymentUrl, paymentData, {
            headers,
          });
          if (result.data.response[0].errorcode === "0") {
            let startTime = new Date();
            let newEndTime = new Date(
              startTime.getTime() +
              Number(planRes.planDuration) * 24 * 60 * 60 * 1000
            );

            let subscriptionData = {
              userId: plan.userId._id,
              subScriptionPlanId: planRes._id,
              tradeFee: planRes.tradeFee,
              price_amount: result.data.response[0].baseamount / 100,
              payment_id: result.data.response[0].tid,
              pay_address: result.data.response[0].maskedpan,
              payment_status: "finished",
              pay_currency: result.data.response[0].currencyiso3a,
              pay_amount: result.data.response[0].baseamount / 100,
              price_currency: result.data.response[0].currencyiso3a,
              transactionReference:
                result.data.response[0].transactionreference,
              settlestatus: result.data.response[0].settlestatus,
              order_id: result.data.response[0].orderreference,
              startTime,
              endTime: newEndTime,
              planStatus: "ACTIVE",
              paymentType: paymentType.CARD,
              trxNumber: Number(trxN),
            };
            let createObj = await buySubsciptionPlanCreate(subscriptionData);
            if (createObj) {
              await Promise.all([
                buySubsciptionPlanUpdate(
                  { _id: plan._id },
                  { planStatus: "INACTIVE" }
                ),
                updateUser(
                  { _id: createObj.userId },
                  {
                    previousPlaneId: plan._id,
                    previousPlanName: planRes.type,
                    previousPlanStatus: "INACTIVE",
                    subscriptionPlaneId: createObj._id,
                    currentPlanName: planRes.title,
                    currentPlanStatus: "ACTIVE",
                    subscriptionPlaneStatus: true,
                    planCapitalAmount: planRes.capital,
                    // planProfit: planRes.profits,
                    paymentType: paymentType.CARD,
                  }
                ),
              ]);
            }
          } else {
            throw apiError.notFound(result.data.response[0].errormessage);
          }
          // }
        }
        refKey = userFindRes.transactionReference;
      }
      return res
        .status(200)
        .json({
          result: refKey,
          message: "Manual trust payment processing completed.",
        });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user/script20:
   *   post:
   *     tags:
   *       - script
   *     description: script20
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: subScriptionPlanId
   *         description: subScriptionPlanId
   *         in: formData
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: formData
   *         required: true
   *       - name: author
   *         description: author
   *         in: formData
   *         required: true
   *       - name: endTime
   *         description: endTime
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async script20(req, res, next) {
    const validationSchema = {
      userId: Joi.string().required(),
      subScriptionPlanId: Joi.string().required(),
      author: Joi.string().required(),
      endTime: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let author = "astroqunt_arbitragebot";
      if (req.body.author != author) {
        throw apiError.unauthorized(
          "You are not authorized for this activity."
        );
      }
      let updateRes = await buySubsciptionPlanUpdate(
        { _id: req.body.subScriptionPlanId, userId: req.body.userId },
        { endTime: req.body.endTime }
      );
      return res.json(new response(updateRes, responseMessage.PROFILE_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/withdraw:
   *   post:
   *     tags:
   *       - WITHDRAW
   *     description: Withdraw amount
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *       - name: withdrawalAddress
   *         description: withdrawalAddress
   *         in: formData
   *         required: true
   *       - name: walletType
   *         description: walletType
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async withdraw(req, res, next) {
    var validationSchema = {
      amount: Joi.string().required(),
      withdrawalAddress: Joi.string().required(),
      walletType: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let amount = Number(validatedBody.amount)
      if(validatedBody.walletType == "MAIN"){
 let getWalletBalance = await aedGardoPaymentFunctions.getWalletBalance(userResult.code, config.get("aedgardoApiKey"));
      if (getWalletBalance.status == false) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (getWalletBalance.result.status == 0) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (Number(getWalletBalance.result.data.amount) < amount) {
        throw apiError.unauthorized("Low Balance");
      }
      let withdraws = await aedGardoPaymentFunctions.withDraw(userResult.code, config.get("aedgardoApiKey"), amount, validatedBody.withdrawalAddress);
      if (withdraws.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (withdraws.result.status == 0) {
        throw apiError.notFound(withdraws.result.message);
      }
      }
     
      let order_id = commonFunction.generateOrder();
      let result = await createTransaction({
        userId: userResult._id,
        amount: validatedBody.amount,
        withdrawalAddress: validatedBody.withdrawalAddress,
        transactionType: "WITHDRAW",
        status: "COMPLETED",
        order_id: order_id,
        walletType:validatedBody.walletType
      });
      return res.json(
        new response(result, "Withdrawal successfully.")
      );
    } catch (error) {
      console.log("========withdraw error", error);
      return next(error);
    }
  }
  /**
   * @swagger
   * /user/investInPool:
   *   post:
   *     tags:
   *       - USER MANAGEMENT
   *     description: investInPool
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: amount
   *         description: amount
   *         in: formData
   *         required: true
   *       - name: walletType
   *         description: walletType
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: Data not found.
   *       500:
   *         description: Internal Server Error
   *       501:
   *         description: Something went wrong!
   */
  async investInPool(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      userResult = JSON.parse(JSON.stringify(userResult));
      let amount = Number(req.body.amount)

      if(req.body.walletType == "MAIN"){
              let getWalletBalance = await aedGardoPaymentFunctions.getWalletBalance(userResult.code, config.get("aedgardoApiKey"));
      if (getWalletBalance.status == false) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (getWalletBalance.result.status == 0) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (Number(getWalletBalance.result.data.amount) < amount) {
        throw apiError.unauthorized("Low Balance");
      }
      }
      let memberId = userResult.code
      let deduction = await aedGardoPaymentFunctions.deduction(memberId, amount, config.get("aedgardoApiKey"), "fund", "debit");
      if (deduction.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (deduction.result.status == 0) {
        throw apiError.notFound(deduction.result.message);
      }
      //deduction

      let poolPlan = await findPoolingSubscriptionPlan({
        minInvestment: { $lte: amount },
        maxInvestment: { $gte: amount },
        status: status.ACTIVE,
      });
      if (!poolPlan) {
        throw apiError.unauthorized("Plan is not active for this amount");
      }

      // if (userResult.totalAmount < amount) {
      //   throw apiError.unauthorized("Low Balance");
      // }

      let alreadyInvested = await findPoolSubscriptionHistoryPlan({ userId: userResult._id, subscriptionPlanId: poolPlan._id })
      if (!alreadyInvested) {
        await createPoolSubscriptionHistoryPlan({
          userId: userResult._id,
          subscriptionPlanId: poolPlan._id,
          investedAmount: amount,
          status: status.ACTIVE,
        });
      } else {
        if (alreadyInvested.status == status.INACTIVE) {
          await updatePoolSubscriptionHistoryPlan(
            { _id: alreadyInvested._id },
            { $set: { investedAmount: amount, status: status.ACTIVE, profit: 0, totalProfit: 0 } }
          );
        } else {
          await updatePoolSubscriptionHistoryPlan(
            { _id: alreadyInvested._id },
            { investedAmount: alreadyInvested.investedAmount + amount }
          );
        }

      }
      await updateUser({ _id: userResult._id }, { $inc: { totalAmount: -amount } })
      let order_id = commonFunction.generateOrder();
      await createTransaction({
        userId: userResult._id,
        amount: amount,
        transactionType: "DEDUCTION",
        transactionSubType :"SUBSCRIBED",
        order_id: order_id,
        status: status.COMPLETED,
        subscriptionPlanId: poolPlan._id,
        walletType: req.body.walletType
      });
      return res.json(new response({}, "Invested successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/deposit:
 *   post:
 *     tags:
 *       - USER MANAGEMENT
 *     description: deposit
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
  async deposit(req, res, next) {
    const validationSchema = {
      // amount: Joi.number().required(),
      // trnasactionHash:Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }

      let isVerified = await aedGardoPaymentFunctions.deposit(userResult.code, config.get("aedgardoApiKey"));
      if (isVerified.status == false) {
        throw apiError.unauthorized("Something went wrong");
      }
      if (isVerified.result.status == 0) {
        throw apiError.unauthorized(isVerified.result.message);
      }
      validatedBody.amount = Number(isVerified.result.data.amount)
      let isAlreadyPresent = await findTransaction({ trnasactionHash: isVerified.result.data.hash })
      if (isAlreadyPresent) {
        throw apiError.unauthorized("Deposit not done");
      }
      await updateUser({ _id: userResult._id }, { $inc: { totalAmount: validatedBody.amount } })
      let order_id = commonFunction.generateOrder();
      await createTransaction({
        userId: userResult._id,
        amount: validatedBody.amount,
        transactionType: "DEPOSIT",
        order_id: order_id,
        status: status.COMPLETED,
        trnasactionHash: isVerified.result.data.hash,
        depositedBy:"SELF"
      });
      return res.json(new response({}, "Deposit succesfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/getActivePoolPlans:
 *   get:
 *     tags:
 *       - USER MANAGEMENT
 *     description: getActivePoolPlans
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
  async getActivePoolPlans(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await poolSubscriptionHistoryPlanList({ userId: userResult._id });
      if (data.length == 0) {
        throw apiError.notFound("No active plan found");
      }
      return res.json(new response(data, "Plan found successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
* @swagger
* /user/viewActivePoolPlans:
*   get:
*     tags:
*       - USER MANAGEMENT
*     description: viewActivePoolPlans
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*       - name: _id
*         description: _id
*         in: query
*         required: true
*     responses:
*       200:
*         description: Data found successfully.
*       404:
*         description: Data not found.
*       500:
*         description: Internal Server Error
*       501:
*         description: Something went wrong!
*/
  async viewActivePoolPlans(req, res, next) {
    let schema = {
      _id: Joi.string().required(),
    }
    try {
      let validatedBody = await Joi.validate(req.query, schema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await findPoolSubscriptionHistoryPlan({ _id: validatedBody._id, status: status.ACTIVE, userId: userResult._id });
      if (!data) {
        throw apiError.notFound("No active plan found");
      }
      return res.json(new response(data, "Plan found successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
* @swagger
* /user/viewActivePoolDetails:
*   get:
*     tags:
*       - USER MANAGEMENT
*     description: viewActivePoolDetails
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*       - name: _id
*         description: _id
*         in: query
*         required: true
*     responses:
*       200:
*         description: Data found successfully.
*       404:
*         description: Data not found.
*       500:
*         description: Internal Server Error
*       501:
*         description: Something went wrong!
*/
  async viewActivePoolDetails(req, res, next) {
    let schema = {
      _id: Joi.string().required(),
    }
    try {
      let validatedBody = await Joi.validate(req.query, schema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await findPoolSubscriptionHistoryPlan({ subscriptionPlanId: validatedBody._id, status: status.ACTIVE, userId: userResult._id });
      if (!data) {
        throw apiError.notFound("No active plan found");
      }
      return res.json(new response(data, "Plan found successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/poolStats:
 *   get:
 *     tags:
 *       - USER MANAGEMENT
 *     description: poolStats
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: poolId
 *         description: poolId
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
  async poolStats(req, res, next) {
    var validationSchema = {
      poolId: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate(req.query, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let poolData = await findPoolingSubscriptionPlan({ _id: validatedBody.poolId })
      if (!poolData) {
        throw apiError.notFound("Pool not found")
      }
      let planInvestment = await poolSubscriptionHistoryPlanList({
        subscriptionPlanId: poolData._id,
        userId: userResult._id
      });
      let totalPlanInvestment = planInvestment.reduce(
        (acc, curr) => acc + curr.investedAmount,
        0
      );

      let allTrxToday = await transactionList({ userId: userResult._id,subscriptionPlanId: poolData._id, transactionSubType :"SUBSCRIBED", createdAt: { $gte: new Date(new Date().toISOString().slice(0, 10)) } },
        { createdAt: { $lte: new Date(new Date().toISOString().slice(0, 10) + 'T23:59:59.999Z') } })
      let todayInvestedAmount = allTrxToday.reduce((acc, curr) => acc + curr.amount, 0);
      let todayProfit = allTrxToday.reduce((acc, curr) => acc + curr.profit, 0);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      let userTrx = await transactionList({
        subscriptionPlanId: poolData._id,
        transactionType: "TRADE",
        userId: userResult._id,
        createdAt: { $gte: thirtyDaysAgo }
      })
      let userTotalProfit = userTrx.reduce((acc, curr) => acc + curr.profit, 0);
      let userAvgProfit = userTotalProfit == 0 ? 0 : userTotalProfit / userTrx.length;

      let obj = {
        totalPlanInvestment: totalPlanInvestment,
        todayInvestedAmount: todayInvestedAmount,
        todayProfit: todayProfit,
        totalProfit: planInvestment.totalProfit,
        userTotalProfit: userTotalProfit,
        userAvgProfit: userAvgProfit
      }
      return res.json(new response(obj, "Request created successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/poolGraph:
 *   get:
 *     tags:
 *       - USER
 *     description: poolGraph
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
 */
  async poolGraph(req, res, next) {
    try {
      const user = await findUser({
        _id: req.userId,
        status: status.ACTIVE
      });

      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      const days = 30;
      const weekDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const allPoolPlans = await poolingSubscriptionPlanList({ status: "ACTIVE" });

      const weekDataRes = {};

      for (let plan of allPoolPlans) {
        const data = await transactionList({
          userId: user._id,
          subscriptionPlanId: plan._id,
          transactionType: "TRADE",
          createdAt: { $gte: weekDate }
        });

        weekDataRes[plan.title] = data;
      }

      return res.json(new response(weekDataRes, responseMessage.DATA_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/transactionHistory:
   *   get:
   *     tags:
   *       - ADMIN_TRANSACTION_LIST
   *     description: get transaction list for particular user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: userId
   *         description: userId
   *         in: query
   *         required: false
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *       - name: transactionType
   *         description: transactionType
   *         in: query
   *         required: false
   *       - name: status
   *         description: status
   *         in: query
   *         required: false
   *       - name: notEqual
   *         description: notEqual
   *         in: query
   *         required: false
   *       - name: arbitrageName
   *         description: arbitrageName
   *         in: query
   *         required: false
   *       - name: walletType
   *         description: walletType
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Data found successfully.
   *       404:
   *         description: Data not found.
   *       500:
   *         description: Internal Server Error
   *       501:
   *         description: Something went wrong!
   */

  async transactionHistory(req, res, next) {
    const validationSchema = {
      userId: Joi.string().optional(),
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      transactionType: Joi.string().optional(),
      status: Joi.string().optional(),
      notEqual: Joi.string().optional(),
      arbitrageName: Joi.string().optional(),
      walletType: Joi.string().optional()
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      let adminResult = await findUser({
        _id: req.userId,
        status: status.ACTIVE
      });
      if (!adminResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      if (adminResult.userType == "USER") {
        validatedBody.userId = adminResult._id
      }
      let transactionHistory = await aggregateSearchtransaction(validatedBody);
      if (transactionHistory.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(transactionHistory, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/claimReward:
 *   put:
 *     tags:
 *       - USER
 *     description: claimReward
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: planId
 *         description: planId
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */

  async claimReward(req, res, next) {
    const validationSchema = {
      planId: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        status: status.ACTIVE
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let findPlan = await findPoolSubscriptionHistoryPlan({ id: validatedBody.plamId, status: "ACTIVE" })
      if (!findPlan) {
        throw apiError.unauthorized("Plan not found");
      }
      let deduction = await aedGardoPaymentFunctions.deduction(userResult.code, findPlan.profit, config.get("aedgardoApiKey"), "income", "credit");
      if (deduction.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (deduction.result.status == 0) {
        throw apiError.notFound(deduction.result.message);
      }
      await updateUser({ _id: userResult._id }, { $inc: { totalAmount: findPlan.profit } })
      await updatePoolSubscriptionHistoryPlan({ _id: findPlan._id }, { $set: { profit: 0 } })
      await createTransaction({
        userId: userResult._id,
        amount: findPlan.profit,
        transactionType: "TRANSFER",
        subscriptionPlanList: findPlan.subscriptionPlanId
      })
      return res.json(
        new response(transactionHistory, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/verify:
 *   get:
 *     tags:
 *       - USER
 *     description: getProfile
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: User Id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Login successfully.
 *       402:
 *         description: Incorrect login credential provided.
 *       404:
 *         description: User not found.
 */
  async verify(req, res, next) {
    try {
      let userResult = await findUserWithPopulate({
        _id: req.query._id,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      // let [walletAddressRes, docusealRes] = await Promise.all([
      //   findUserWallet({ userId: userResult._id }),
      //   findDocuseal({ userId: userResult._id }),
      // ]);
      // userResult = JSON.parse(JSON.stringify(userResult));
      // if (walletAddressRes) {
      //   // userResult.walletFieroAddress = walletAddressRes.walletFieroAddress;
      //   userResult.walletUsdAddress = walletAddressRes.walletUsdAddress;
      // }
      // if (docusealRes) {
      //   userResult.isDocuseal = true;
      // }
      delete userResult.password;
      delete userResult.otp;
      return res.json(new response(userResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/attach:
 *   post:
 *     tags:
 *       - USER
 *     description: attach
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: User Id
 *         in: query
 *         required: true
 *       - name: isAttached
 *         description: isAttached
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Login successfully.
 *       402:
 *         description: Incorrect login credential provided.
 *       404:
 *         description: User not found.
 */
  async attach(req, res, next) {
    try {
      let { _id, isAttached } = req.query
      let userResult = await findUserWithPopulate({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      await updateUser({ _id: _id }, { $set: { isAttached: isAttached } })
      let resMsg = "User attached successfully"
      if (isAttached == false) {
        resMsg = "User deattached successfully"
      }
      return res.json(new response({}, resMsg));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/rewards:
 *   get:
 *     tags:
 *       - USER MANAGEMENT
 *     description: rewards
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: User Id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
  async rewards(req, res, next) {
    try {
      let { _id } = req.query
      let userResult = await findUser({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await poolSubscriptionHistoryPlanList({ status: status.ACTIVE, userId: userResult._id });
      if (data.length == 0) {
        throw apiError.notFound("No active plan found");
      }
      return res.json(new response(data, "Plan found successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/deactivate:
 *   put:
 *     tags:
 *       - USER MANAGEMENT
 *     description: deactivate
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         description: User Id
 *         in: query
 *         required: true
 *       - name: planId
 *         description: planId
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */
  async deactivate(req, res, next) {
    try {
      let { _id, planId } = req.query
      let userResult = await findUser({
        _id: _id,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await findPoolSubscriptionHistoryPlan({ status: status.ACTIVE, userId: userResult._id, _id: planId });
      if (!data) {
        throw apiError.notFound("No active plan found");
      }
      await updatePoolSubscriptionHistoryPlan({ _id: planId }, { $set: { status: "INACTIVE" } })
      return res.json(new response({}, "Plan deactivated successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/userPlan:
 *   get:
 *     tags:
 *       - SUBSCRIPTION
 *     description: userPlan
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: userId
 *         in: query
 *         required: true
 *       - name: fromDate
 *         description: fromDate
 *         in: query
 *         required: false
 *       - name: toDate
 *         description: toDate
 *         in: query
 *         required: false
 *       - name: page
 *         description: page
 *         in: query
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: query
 *         required: false
 *       - name: planStatus
 *         description: planStatus
 *         in: query
 *         required: false
 *       - name: paymentStatus
 *         description: paymentStatus
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Login successfully.
 *       402:
 *         description: Incorrect login credential provided.
 *       404:
 *         description: User not found.
 */
  async userPlan(req, res, next) {
    const validationSchema = {
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      planStatus: Joi.string().optional(),
      paymentStatus: Joi.string().optional(),
      userId: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.query, validationSchema);
      let userResult = await findUser({
        _id: req.query.userId,
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let result = await buySubscriptionPlanList(validatedBody);
      if (result.docs.length == 0) {
        throw apiError.notFound(responseMessage.PLAN_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.PLAN_FOUND));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /user/userFuelWalletHistory:
 *   get:
 *     tags:
 *       - Fuel Wallet
 *     description: userFuelWalletHistory
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User userId
 *         in: query
 *         required: true
 *       - name: search
 *         description: search
 *         in: query
 *         required: false
 *       - name: fromDate
 *         description: fromDate
 *         in: query
 *         required: false
 *       - name: toDate
 *         description: toDate
 *         in: query
 *         required: false
 *       - name: page
 *         description: page
 *         in: query
 *         required: false
 *       - name: limit
 *         description: limit
 *         in: query
 *         required: false
 *     responses:
 *       200:
 *         description: Login successfully.
 *       402:
 *         description: Incorrect login credential provided.
 *       404:
 *         description: User not found.
 */
  async userFuelWalletHistory(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      userId: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.query.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let walletAddressRes = await paginateSearchFuelWalletHistory(
        validatedBody
      );
      if (walletAddressRes.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(walletAddressRes, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /user/userFuelWalletDeducteHistory:
   *   get:
   *     tags:
   *       - Fuel Wallet
   *     description: userFuelWalletDeducteHistory
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User userId
   *         in: query
   *         required: true
   *       - name: search
   *         description: search
   *         in: query
   *         required: false
   *       - name: fromDate
   *         description: fromDate
   *         in: query
   *         required: false
   *       - name: toDate
   *         description: toDate
   *         in: query
   *         required: false
   *       - name: page
   *         description: page
   *         in: query
   *         required: false
   *       - name: limit
   *         description: limit
   *         in: query
   *         required: false
   *     responses:
   *       200:
   *         description: Login successfully.
   *       402:
   *         description: Incorrect login credential provided.
   *       404:
   *         description: User not found.
   */
  async userFuelWalletDeducteHistory(req, res, next) {
    const validationSchema = {
      search: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      userId: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.query.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      validatedBody.userId = userResult._id;
      let walletAddressRes = await paginateSearchFuelWalletDeductionHistory(
        validatedBody
      );
      if (walletAddressRes.docs.length == 0) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(
        new response(walletAddressRes, responseMessage.DATA_FOUND)
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
* @swagger
* /user/userPoolPlans:
*   get:
*     tags:
*       - USER MANAGEMENT
*     description: userPoolPlans
*     produces:
*       - application/json
*     parameters:
*       - name: userId
*         description: userId
*         in: query
*         required: true
*     responses:
*       200:
*         description: Data found successfully.
*       404:
*         description: Data not found.
*       500:
*         description: Internal Server Error
*       501:
*         description: Something went wrong!
*/
  async userPoolPlans(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.query.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let data = await poolSubscriptionHistoryPlanList({ userId: userResult._id });
      if (data.length == 0) {
        throw apiError.notFound("No active plan found");
      }
      return res.json(new response(data, "Plan found successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
* @swagger
* /user/userPoolPlans:
*   post:
*     tags:
*       - USER MANAGEMENT
*     description: userPoolPlans
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token
*         in: header
*         required: true
*     responses:
*       200:
*         description: Data found successfully.
*       404:
*         description: Data not found.
*       500:
*         description: Internal Server Error
*       501:
*         description: Something went wrong!
*/
  async generateWalletAddress(req, res, next) {
    try {
      let userResult = await findUser({
        _id: req.userId,
        status: { $ne: status.DELETE },
      });
      if (!userResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let generateAddress = await aedGardoPaymentFunctions.createAddress(userResult.code, config.get("aedgardoApiKey"));
      if (generateAddress.status == false) {
        throw apiError.notFound(generateAddress.result.message);
      }
      if (generateAddress.result.status == 0) {
        throw apiError.notFound(generateAddress.result.message);
      }
      await updateUser({ _id: userResult._id }, { $set: { aedGardoAddress: generateAddress.result.address } });
      return res.json(new response({}, "Wallet address generated successfully"));
    } catch (error) {
      return next(error);
    }
  }

  /**
 * @swagger
 * /admin/transferAmount:
 *   put:
 *     tags:
 *       - ADMIN_TRANSACTION_LIST
 *     description: get updateWalletUser
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: token
 *         in: header
 *         required: true
 *       - name: amount
 *         description: amount
 *         in: formData
 *         required: false
 *       - name: userId
 *         description: userId
 *         in: formData
 *         required: false
 *       - name: walletType
 *         description: walletType
 *         in: formData
 *         required: false
 *     responses:
 *       200:
 *         description: Data found successfully.
 *       404:
 *         description: Data not found.
 *       500:
 *         description: Internal Server Error
 *       501:
 *         description: Something went wrong!
 */

  async transferAmount(req, res, next) {
    const validationSchema = {
      amount: Joi.number().required(),
      userId: Joi.string().required(),
      walletType: Joi.string().required()
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let adminResult = await findUser({
        _id: req.userId,
        status: status.ACTIVE
      });
      if (!adminResult) {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
      let findUserData = await findUser({ _id: validatedBody.userId });
      if (!findUserData) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      let getWalletBalance = await aedGardoPaymentFunctions.getWalletBalance(adminResult.code, config.get("aedgardoApiKey"));
      if (getWalletBalance.status == false) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (getWalletBalance.result.status == 0) {
        throw apiError.notFound(getWalletBalance.result.message);
      }
      if (Number(getWalletBalance.result.data.amount) < validatedBody.amount) {
        throw apiError.unauthorized("Low Balance");
      }

      let deduction = await aedGardoPaymentFunctions.deduction(adminResult.code, validatedBody.amount, config.get("aedgardoApiKey"), "fund", "debit");
      if (deduction.status == false) {
        throw apiError.notFound(deduction.result.message);
      }
      if (deduction.result.status == 0) {
        throw apiError.notFound(deduction.result.message);
      }
      let addition = await aedGardoPaymentFunctions.deduction(findUserData.code, validatedBody.amount, config.get("aedgardoApiKey"), "fund", "credit");
      if (addition.status == false) {
        throw apiError.notFound(addition.result.message);
      }
      if (addition.result.status == 0) {
        throw apiError.notFound(addition.result.message);
      }
      let order_id = commonFunction.generateOrder();
      await createTransaction({
        userId: adminResult._id,
        amount: validatedBody.amount,
        transactionType: "DEDUCTION",
        transactionSubType :"TRANSFERED",
        order_id: order_id,
        status: status.COMPLETED,
        walletType: req.body.walletType,
        transferTo:findUserData._id
      });
      return res.json(
        new response({}, "Operation completed successfully")
      );
    } catch (error) {
      return next(error);
    }
  }


  async getPoolTrxHistory(query) {
    try {
      let data = await aggregateSearchtransaction(query);
      return { responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: data }
        ;
    } catch (error) {
      console.log("fsdfm,dsm,", error);
    }
  }
}

export default new userController()
