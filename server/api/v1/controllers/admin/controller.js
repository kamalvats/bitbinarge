import Joi from "joi";
import Mongoose from "mongoose";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import userModel from '../../../../models/user';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode'
import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status, { ACTIVE } from '../../../../enums/status';
import userType from "../../../../enums/userType";
import { userServices } from '../../services/user';
import { capitalAmountServices } from '../../services/capitalAmount'
const { findCapitalAmount, updateCapitalAmount } = capitalAmountServices
const { userCheck, createUser, checkUserExists, emailMobileExist, paginateSearch, findUser, updateUser, updateUserById, findUserWithOtp, editEmailMobileExist, aggregateSearchList, findAllUserWithSelectedField } = userServices
import { subscriptionPlanServices } from '../../services/subscriptionPlan'
const { subscriptionPlanList, findSubscriptionPlan, createSubscriptionPlan, updateSubscriptionPlan, paginateSearchSubscription, paginateSearchSubscriptionv1 } = subscriptionPlanServices
import { buySubsciptionPlanHistoryServices, } from '../../services/buySubscriptionPlanHistory'
const { buySubsciptionPlanData, buySubscriptionPlanList, buySubscriptionPlanListWithAggregate, buySubscriptionhPlanList, buySubsciptionPlanUpdate, updateManySubscription, lastedBuyPlan, buySubsciptionPlanCreate } = buySubsciptionPlanHistoryServices
import axios from "axios";
import { ipAddressCheckServices } from "../../services/ipAddressCheck"
const { findIpAddressCheck, updateIpAddressCheck } = ipAddressCheckServices
import { ipAddressServices } from "../../services/ipAddress"
const { findIpAddress } = ipAddressServices
import { docusealServices } from "../../services/docuseal"
const { findDocuseal, updateDocuseal } = docusealServices
import paymentType from "../../../../enums/paymentType";
import subscriptionPlanType from "../../../../enums/subscriptionPlanType";
// import crypto from "crypto"
import { credentialServices } from "../../services/credentials"
const { updateCredentials, listCredentials, findCredentials } = credentialServices
import { keysServices } from "../../services/keys"
const { createKeys, findKeys, updateKeys, keysList } = keysServices
import { transactionServices } from '../../services/transaction'
const { createTransaction,findTransaction,updateTransaction,transactionPaginateSearch,transactionList,aggregateSearchtransaction } = transactionServices
import { poolingSubscriptionPlanServices } from '../../services/poolingSubscriptionPlan'
const {createPoolingSubscriptionPlan,findPoolingSubscriptionPlan,updatePoolingSubscriptionPlan,paginateSearchPoolingSubscriptionPlan ,poolingSubscriptionPlanList} = poolingSubscriptionPlanServices
import { poolSubscriptionHistoryPlanServices } from '../../services/poolSubscriptionHistory'
const {createPoolSubscriptionHistoryPlan,findPoolSubscriptionHistoryPlan,updatePoolSubscriptionHistoryPlan} = poolSubscriptionHistoryPlanServices
import { profitPathServices } from "../../services/profitpath";
import arbitrage from "../../../../enums/arbitrage";
const {
  profitpathCreate,
  profitpatheList,
  profitpathData,
  profitpathUpdate,
  createUpdateProfitPath,
  profitpatheListLimit,
  
} = profitPathServices;
import aedGardoPaymentFunctions from '../../../../helper/aedGardoPaymentFunctions';
export class adminController {

    /**
     * @swagger
     * /admin/login:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Admin login with email and Password
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: login
     *         description: login  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/login'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async login(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required(),
            ip: Joi.string().optional(),
            termsAndConditions: Joi.string().optional(),
        }
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var results
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const {
                email,
                password
            } = validatedBody;
            console.log("fsdfkjlsdjflksdjfkds",validatedBody)
            let query = {
                $and: [{
                    userType: {
                        $in: [userType.ADMIN, userType.SUBADMIN]
                    },
                    status: {
                        $ne: status.DELETE
                    }
                }, {
                    $or: [{
                        email: email
                    }, {
                        mobileNumber: email
                    }]
                }]
            }
            var userResult = await findUser(query);
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            if (!bcrypt.compareSync(password, userResult.password)) {
                throw apiError.conflict(responseMessage.INCORRECT_LOGIN)
            } else {
                if (userResult.userType == userType.SUBADMIN) {
                    let ipAddressCheckRes = await findIpAddressCheck({
                        isTrue: true,
                        status: {
                            $ne: status.DELETE
                        }
                    });
                    if (ipAddressCheckRes) {
                        if (!validatedBody.ip) {
                            throw apiError.badRequest(responseMessage.ENTER_IP_ADDRESS)
                        }
                        let checkIpCorrect = await findIpAddress({
                            ip: validatedBody.ip,
                            status: status.ACTIVE
                        })
                        if (!checkIpCorrect) {
                            throw apiError.badRequest(responseMessage.NOT_ALLOW)
                        }
                    }
                }
                var otp = commonFunction.getOTP();
                var otpExpireTime = new Date().getTime() + 180000;
                await commonFunction.signloignOtp(email, userResult.firstName, otp);
                if (!validatedBody.termsAndConditions || !userResult.termsAndConditions) {
                    validatedBody.termsAndConditions = userResult.termsAndConditions || "DECLINE"
                }
                results = await updateUser({
                    _id: userResult._id
                }, {
                    otp: otp,
                    otpExpireTime: otpExpireTime,
                    termsAndConditions: validatedBody.termsAndConditions
                });
                results = JSON.parse(JSON.stringify(results));
                const keysToRemove = ['planProfit', 'fuelFIEROBalance', 'fuelUSDBalance', 'speakeasyQRcode', 'sniperBotPlaceTime', 'connectedExchange', '_id', 'permissions', 'password', 'otp', 'autoTrade', 'autoTradePlaceCount', 'sniperBot', 'notifications', 'rebalancingTrade'];
                keysToRemove.forEach(key => delete results[key]);
                // var token = await commonFunction.getToken({ _id: userResult._id, email: userResult.email, mobileNumber: userResult.mobileNumber, userType: userResult.userType });
                // results = {
                //     _id: userResult._id,
                //     email: email,
                //     speakeasy: userResult.speakeasy,
                //     userType: userResult.userType,
                //     status: userResult.status,
                //     token: token,
                // }
            }
            return res.json(new response(results, responseMessage.OTP_SEND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getProfile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: Admin login with email and Password
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
    async getProfile(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            adminResult = JSON.parse(JSON.stringify(adminResult));
            let docusealRes = await findDocuseal({ userId: adminResult._id })
            if (docusealRes) {
                adminResult.isDocuseal = true
            }
            return res.json(new response(adminResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/resendOTP:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: after OTP expire or not get any OTP with that frameOfTime ADMIN resendOTP for new OTP
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
        var validationSchema = {
            email: Joi.string().required(),
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const {
                email
            } = validatedBody;
            var userResult = await findUser({
                // isSocial: false,
                $and: [{
                    $or: [{
                        email: email
                    }, {
                        mobileNumber: email
                    }]
                }, {
                    status: {
                        $ne: status.DELETE
                    }
                }]
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var otp = commonFunction.getOTP();
            var otpExpireTime = new Date().getTime() + 180000;
            await commonFunction.signResendOtp(email, userResult.firstName, otp);
            var updateResult = await updateUser({
                _id: userResult._id
            }, {
                otp: otp,
                otpExpireTime: otpExpireTime
            });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            const keysToRemove = ['planProfit', 'fuelFIEROBalance', 'fuelUSDBalance', 'speakeasyQRcode', 'sniperBotPlaceTime', 'connectedExchange', '_id', 'permissions', 'password', 'otp', 'autoTrade', 'autoTradePlaceCount', 'sniperBot', 'notifications', 'rebalancingTrade'];
            keysToRemove.forEach(key => delete updateResult[key]);
            return res.json(new response(updateResult, responseMessage.OTP_SEND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/forgotPassword:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: after OTP expire or not get any OTP with that frameOfTime ADMIN forgotPassword for new OTP
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
        var validationSchema = {
            email: Joi.string().required(),
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const {
                email
            } = validatedBody;
            var userResult = await findUser({
                // isSocial: false,
                $and: [{
                    $or: [{
                        email: email
                    }, {
                        mobileNumber: email
                    }]
                }, {
                    status: {
                        $ne: status.DELETE
                    }
                }]
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var otp = commonFunction.getOTP();
            var otpExpireTime = new Date().getTime() + 180000;
            await commonFunction.signForgotOtp(email, userResult.firstName, otp);
            var updateResult = await updateUser({
                _id: userResult._id
            }, {
                otp: otp,
                otpExpireTime: otpExpireTime
            });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            const keysToRemove = ['planProfit', 'fuelFIEROBalance', 'fuelUSDBalance', 'speakeasyQRcode', 'sniperBotPlaceTime', 'connectedExchange', '_id', 'permissions', 'password', 'otp', 'autoTrade', 'autoTradePlaceCount', 'sniperBot', 'notifications', 'rebalancingTrade'];
            keysToRemove.forEach(key => delete updateResult[key]);
            return res.json(new response(updateResult, responseMessage.OTP_SEND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/verifyOTP:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: verifyOTP by DMIN on plateform when he want to reset Password
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
        var validationSchema = {
            email: Joi.string().required(),
            otp: Joi.number().required()
        };
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const {
                email,
                otp
            } = validatedBody;
            var userResult = await findUserWithOtp({
                // isSocial: false,
                $and: [{
                    $or: [{
                        email: email
                    }, {
                        mobileNumber: email
                    }]
                }, {
                    status: {
                        $ne: status.DELETE
                    }
                }]
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (new Date().getTime() > userResult.otpExpireTime) {
                throw apiError.badRequest(responseMessage.OTP_EXPIRED);
            }
            if (userResult.otp != otp) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }
            var updateResult = await updateUser({
                _id: userResult._id
            }, {
                otpVerification: true
            })
            if (userResult.status == status.PENDING) {
                await updateUser({
                    _id: userResult._id
                }, {
                    status: status.ACTIVE
                })
            }
            var token = await commonFunction.getToken({
                _id: updateResult._id,
                email: updateResult.email,
                mobileNumber: updateResult.mobileNumber,
                userType: updateResult.userType
            });
            var obj = {
                _id: userResult._id,
                email: userResult.email,
                googleAuthenction: userResult.speakeasy,
                status: userResult.status,
                userType: userResult.userType
            }
            if (userResult.speakeasy == false) {
                obj.token = token
            } else {
                obj.token = ''
            }
            return res.json(new response(obj, responseMessage.OTP_VERIFY));
        } catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /admin/resetPassword:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Change password or reset password When ADMIN need to chnage
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
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
     *         description: Your password has been successfully changed.
     *       404:
     *         description: This user does not exist.
     *       422:
     *         description: Password not matched.
     *       500:
     *         description: Internal Server Error
     *       501:
     *         description: Something went wrong!
     */
    async resetPassword(req, res, next) {
        const validationSchema = {
            password: Joi.string().required(),
            confirmPassword: Joi.string().required()
        };
        try {
            const {
                password,
                confirmPassword
            } = await Joi.validate(req.body, validationSchema);
            var userResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                if (password == confirmPassword) {
                    let update = await updateUser({
                        _id: userResult._id
                    }, {
                        password: bcrypt.hashSync(password)
                    });
                    return res.json(new response(update, responseMessage.PWD_CHANGED));
                } else {
                    throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
                }
            }
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }



    /**
     * @swagger
     * /admin/changePassword:
     *   patch:
     *     tags:
     *       - ADMIN
     *     description: changePassword By ADMIN when ADMIN want to change his password on Plateform
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
     *       - name: newPassword
     *         description: newPassword
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async changePassword(req, res, next) {
        const validationSchema = {
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (!bcrypt.compareSync(validatedBody.oldPassword, userResult.password)) {
                throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
            }
            let updated = await updateUserById(userResult._id, {
                password: bcrypt.hashSync(validatedBody.newPassword)
            });
            return res.json(new response(updated, responseMessage.PWD_CHANGED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/editProfile:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: editProfile
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
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async editProfile(req, res, next) {
        const validationSchema = {
            email: Joi.string().optional(),
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            dateOfBirth: Joi.string().optional(),
            gender: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            profilePic: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let find = await editEmailMobileExist(validatedBody.email, validatedBody.mobileNumber, userResult._id)
            if (find) {
                if (find.email == validatedBody.email) {
                    throw apiError.alreadyExist(responseMessage.EMAIL_EXIST);
                }
                if (find.mobileNumber == validatedBody.mobileNumber) {
                    throw apiError.alreadyExist(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files) {
                if (req.files.length != 0) {
                    validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
                }
            }
            let updateResult = await updateUser({
                _id: userResult._id
            }, {
                $set: validatedBody
            });
            return res.json(new response(updateResult, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/subscriptionPlanList:
     *   get:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: Subscription plan list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async subscriptionPlanList(req, res, next) {
        var validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let query = { planStatus: "ACTIVE", status: status.ACTIVE, show: true, subscriptionType: subscriptionPlanType.PAID }
            if (validatedBody.search) {
                query.$or = [
                    { title: { $regex: validatedBody.search, $options: 'i' } },
                ]
            }
            let result = await subscriptionPlanList(query)
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
            }
            return res.json(new response(result, responseMessage.SUBSCRIPTION_PLAN));
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/blockUnblockInvitedUser:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: blockUnblockInvitedUser When ADMIN want to block or unblock invited user on Plateform
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: inviteUserId
     *         description: inviteUserId
     *         in: formData
     *         required: true
     *       - name: reason
     *         description: reason
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async blockUnblockInvitedUser(req, res, next) {
        const validationSchema = {
            inviteUserId: Joi.string().required(),
            reason: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var userInfo = await findUser({
                _id: validatedBody.inviteUserId,
                userType: {
                    $ne: userType.ADMIN
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userInfo) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (userInfo.status == status.ACTIVE) {
                let blockRes = await updateUser({
                    _id: userInfo._id
                }, {
                    status: status.BLOCK
                });
                await commonFunction.sendUserblockEmail(userInfo, userResult, validatedBody.reason)
                return res.json(new response(blockRes, responseMessage.USER_BLOCKED));
            } else {
                let activeRes = await updateUser({
                    _id: userInfo._id
                }, {
                    status: status.ACTIVE
                });
                await commonFunction.sendUserActiveEmail(userInfo, userResult)
                return res.json(new response(activeRes, responseMessage.USER_UNBLOCKED));
            }
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/blockUnblockSubscriptionPlan:
     *   put:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: blockUnblockSubscriptionPlan
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: subscriptionId
     *         description: subscriptionId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async blockUnblockSubscriptionPlan(req, res, next) {
        const validationSchema = {
            subscriptionId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var planInfo = await findSubscriptionPlan({
                _id: validatedBody.subscriptionId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!planInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (planInfo.status == status.ACTIVE) {
                let blockRes = await updateSubscriptionPlan({
                    _id: planInfo._id
                }, {
                    status: status.BLOCK
                });
                return res.json(new response(blockRes, responseMessage.PLAN_BLOCKED));
            } else {
                let activeRes = await updateSubscriptionPlan({
                    _id: planInfo._id
                }, {
                    status: status.ACTIVE
                });
                return res.json(new response(activeRes, responseMessage.PLAN_ACTIVATED));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/viewSubscription:
     *   get:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: viewSubscription
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: subscriptionId
     *         description: subscriptionId  
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async viewSubscription(req, res, next) {
        const validationSchema = {
            subscriptionId: Joi.string().required(),
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let planRes = await findSubscriptionPlan({
                _id: validatedBody.subscriptionId,
                status: {
                    $ne: status.DELETE
                }
            })
            if (!planRes) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(planRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/subscriptionPlanListWithFilter:
     *   get:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: Subscription plan list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search as planName(type)  
     *         in: query
     *         required: false
     *       - name: subscriptionType
     *         description: subscriptionType ("PAID","CUSTOM","FREE")  
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
     *         description: Returns success message
     */
    async subscriptionPlanListWithFilter(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            subscriptionType: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
        };
        try {
            let validateBody = await Joi.validate(req.query, validationSchema)
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let result = await paginateSearchSubscription(validateBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
            }
            return res.json(new response(result, responseMessage.SUBSCRIPTION_PLAN));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/updateCapitalAmount:
     *   post:
     *     tags:
     *       - ADMIN
     *     description: Update capital amoutn for get profit path this amount
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: type
     *         description: type 
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
    async updateCapitalAmount(req, res, next) {
        var validationSchema = {
            type: Joi.string().required(),
            amount: Joi.string().required(),
        }
        try {
            if (req.body.email) {
                req.body.email = (req.body.email).toLowerCase();
            }
            var results
            var validatedBody = await Joi.validate(req.body, validationSchema);
            const {
                type,
                amount
            } = validatedBody;
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.USER, userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let capitalAmountRes = await findCapitalAmount()
            if (!capitalAmountRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (type == 'TRIANGULAR') {
                results = await updateCapitalAmount({
                    _id: capitalAmountRes._id
                }, {
                    $set: {
                        triangular: amount
                    }
                });
            } else if (type == 'LOOP') {
                results = await updateCapitalAmount({
                    _id: capitalAmountRes._id
                }, {
                    $set: {
                        loop: amount
                    }
                });
            } else if (type == 'DIRECT') {
                results = await updateCapitalAmount({
                    _id: capitalAmountRes._id
                }, {
                    $set: {
                        direct: amount
                    }
                });
            } else if (type == 'INTRA') {
                results = await updateCapitalAmount({
                    _id: capitalAmountRes._id
                }, {
                    $set: {
                        intra: amount
                    }
                });
            } else if (type == 'INTRASINGLEEXCHANGE') {
                results = await updateCapitalAmount({
                    _id: capitalAmountRes._id
                }, {
                    $set: {
                        intraSingleExchange: amount
                    }
                });
            } else {
                throw apiError.badRequest(responseMessage.WRONG_arbitrage_TYPE);
            }
            return res.json(new response(results, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getCapitalAmount:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: get capital amount.
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
    async getCapitalAmount(req, res, next) {
        try {
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.USER, userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let capitalAmountRes = await findCapitalAmount()
            if (!capitalAmountRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(capitalAmountRes, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/deleteSubscriptionPlan:
     *   delete:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: deleteSubscriptionPlan
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: subscriptionId
     *         description: subscriptionId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async deleteSubscriptionPlan(req, res, next) {
        const validationSchema = {
            subscriptionId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var planInfo = await findSubscriptionPlan({
                _id: validatedBody.subscriptionId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!planInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let updateRes = await updateSubscriptionPlan({
                _id: planInfo._id
            }, {
                status: status.DELETE
            });
            return res.json(new response(updateRes, responseMessage.PLAN_DELETED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getUserList:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: get user list.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: type
     *         description: type 
     *         enum: ["REGISTER","SUBSRCIPTION","SUBSRCIPTION_PREVIOUS"]
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
     *       - name: planStatus
     *         description: planStatus
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
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
     *       - name: status1
     *         description: status1
     *         in: query
     *         required: false
     *       - name: sort
     *         description: sort (ASC,DESC)
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getUserList(req, res, next) {
        var validationSchema = {
            type: Joi.string().optional(),
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            planStatus: Joi.string().optional(),
            status1: Joi.string().optional(),
            sort: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let result = await aggregateSearchList(validatedBody);
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            for (let i = 0; i < result.docs.length; i++) {
                result.docs[i].isDocuseal = false
                let docusealRes = await findDocuseal({ userId: result.docs[i]._id })
                if (docusealRes) {
                    result.docs[i].isDocuseal = true
                }
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }


    /**
     * @swagger
     * /admin/viewSubscriptionHistory:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: View Subscription History
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: PlanId
     *         description: PlanId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async viewSubscriptionHistory(req, res, next) {
        try {
            let PlanData = await buySubsciptionPlanData({
                _id: req.query.PlanId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!PlanData) {
                throw apiError.notFound(responseMessage.SUB_PLAN_HISTORY_NOT_FOUND);
            }
            return res.json(new response(PlanData, responseMessage.SUB_PLAN_HISTORY_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    // /**
    //  * @swagger
    //  * /admin/enableDisableGoogleAuthenction:
    //  *   get:
    //  *     tags:
    //  *       - AUTHENCATION
    //  *     description: enableDisableGoogleAuthenction
    //  *     produces:
    //  *       - application/json
    //  *     parameters:
    //  *       - name: token
    //  *         description: User token
    //  *         in: header
    //  *         required: true
    //  *     responses:
    //  *       200:
    //  *         description: Login successfully.
    //  *       402:
    //  *         description: Incorrect login credential provided.
    //  *       404:
    //  *         description: User not found.
    //  */
    // async enableDisableGoogleAuthenction(req, res, next) {
    //     try {
    //         let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
    //         if (!userResult) {
    //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    //         }
    //         if (userResult.speakeasy == false) {
    //             var secret = speakeasy.generateSecret({ length: 20, name: userResult.email, });
    //             let data_url = await qrcode.toDataURL(secret.otpauth_url);
    //             // let dataUrl = await commonFunction.getSecureUrl(data_url);
    //             await updateUser({ _id: userResult._id }, { speakeasy: true, base32: secret.base32, speakeasyQRcode: data_url })
    //             let obj = {
    //                 email: userResult.email,
    //                 url: data_url,
    //             }
    //             return res.json(new response(obj, responseMessage.TWO_FA_GENERATED));
    //         }
    //         await updateUser({ _id: userResult._id }, { speakeasy: false, base32: '', speakeasyQRcode: '' })
    //         let obj = {
    //             email: userResult.email,
    //             url: '',
    //         }
    //         return res.json(new response(obj, responseMessage.GOOGEL_AUTH));
    //     } catch (error) {
    //         return next(error);
    //     }
    // }

    /**
     * @swagger
     * /admin/enableDisableGoogleAuthenction:
     *   get:
     *     tags:
     *       - AUTHENCATION
     *     description: enableDisableGoogleAuthenction
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
    async enableDisableGoogleAuthenction(req, res, next) {
        try {
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            // if (userResult.speakeasy == false) {
            var secret = speakeasy.generateSecret({
                length: 20,
                name: "AstroQunt:- " + userResult.email,
            });
            let data_url = await qrcode.toDataURL(secret.otpauth_url);
            // let dataUrl = await commonFunction.getSecureUrl(data_url);
            await updateUser({
                _id: userResult._id
            }, {
                base32: secret.base32,
                speakeasyQRcode: data_url
            })
            let obj = {
                email: userResult.email,
                url: data_url,
                secret: secret.base32
            }
            return res.json(new response(obj, responseMessage.TWO_FA_GENERATED));
            // }
            // await updateUser({ _id: userResult._id }, { speakeasy: false, base32: '', speakeasyQRcode: '' })
            // let obj = {
            //     email: userResult.email,
            //     url: '',
            // }
            // return res.json(new response(obj, responseMessage.GOOGEL_AUTH));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/verifyGoogleAuthenctionCodeForEnableDisable:
     *   get:
     *     tags:
     *       - AUTHENCATION
     *     description: verifyGoogleAuthenctionCodeForEnableDisable
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email
     *         in: query
     *         required: true
     *       - name: code
     *         description: code
     *         in: query
     *         required: true
     *       - name: type
     *         description: type (enable/disable)
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async verifyGoogleAuthenctionCodeForEnableDisable(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            code: Joi.string().required(),
            type: Joi.string().required()
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({
                email: validatedBody.email,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var verified = speakeasy.totp.verify({
                secret: userResult.base32,
                encoding: 'base32',
                token: validatedBody.code
            });
            if (!verified) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }
            if (validatedBody.type == "enable") {
                let updateRes = await updateUser({
                    _id: userResult._id
                }, {
                    speakeasy: true
                })
                return res.json(new response(updateRes, responseMessage.GOOGEL_AUTH_enable));
            } else {
                let updateRes = await updateUser({
                    _id: userResult._id
                }, {
                    speakeasy: false,
                    base32: '',
                    speakeasyQRcode: ''
                })
                return res.json(new response(updateRes, responseMessage.GOOGEL_AUTH));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/verifyGoogleAuthenctionCode:
     *   get:
     *     tags:
     *       - AUTHENCATION
     *     description: verifyGoogleAuthenctionCode
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email
     *         in: query
     *         required: true
     *       - name: code
     *         description: code
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async verifyGoogleAuthenctionCode(req, res, next) {
        var validationSchema = {
            email: Joi.string().required(),
            code: Joi.string().required()
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({
                email: validatedBody.email,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            var verified = speakeasy.totp.verify({
                secret: userResult.base32,
                encoding: 'base32',
                token: validatedBody.code
            });
            if (!verified) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }
            var token = await commonFunction.getToken({
                _id: userResult._id,
                email: userResult.email,
                userType: userResult.userType
            });
            var obj = {
                _id: userResult._id,
                email: userResult.email,
                googleAuthenction: userResult.speakeasy,
            }
            if (userResult.speakeasy == true) {
                obj.token = token
            } else {
                obj.token = ''
            }

            return res.json(new response(obj, responseMessage.OTP_VERIFY));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listForUserBuySubcription:
     *   get:
     *     tags:
     *       - SUBSCRIPTION
     *     description: listForUserBuySubcription
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Admin token
     *         in: header
     *         required: true
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
     *     responses:
     *       200:
     *         description: Login successfully.
     *       402:
     *         description: Incorrect login credential provided.
     *       404:
     *         description: User not found.
     */
    async listForUserBuySubcription(req, res, next) {
        const validationSchema = {
            userId: Joi.string().required(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            planStatus: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let result = await buySubscriptionPlanList(validatedBody)
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
     * /admin/enableDisableSubscriptionPlan:
     *   put:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: enableDisableSubscriptionPlan
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: subscriptionId
     *         description: subscriptionId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async enableDisableSubscriptionPlan(req, res, next) {
        const validationSchema = {
            subscriptionId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var planInfo = await findSubscriptionPlan({
                _id: validatedBody.subscriptionId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!planInfo) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (planInfo.planStatus == "ACTIVE") {
                let blockRes = await updateSubscriptionPlan({
                    _id: planInfo._id
                }, {
                    planStatus: "INACTIVE"
                });
                return res.json(new response(blockRes, responseMessage.PLAN_BLOCKED));
            } else {
                let activeRes = await updateSubscriptionPlan({
                    _id: planInfo._id
                }, {
                    planStatus: "ACTIVE"
                });
                return res.json(new response(activeRes, responseMessage.PLAN_ACTIVATED));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/allListForUserBuySubcription:
     *   get:
     *     tags:
     *       - SUBSCRIPTION
     *     description: allListForUserBuySubcription
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Admin token
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
    async allListForUserBuySubcription(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
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
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let result = await buySubscriptionPlanListWithAggregate(validatedBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    // /**
    //  * @swagger
    //  * /admin/addSubscription:
    //  *   post:
    //  *     tags:
    //  *       - ADMIN
    //  *     description: Admin login with email and Password
    //  *     produces:
    //  *       - application/json
    //  *     parameters:
    //  *       - name: token
    //  *         description: token
    //  *         in: header
    //  *         required: false
    //  *       - name: title
    //  *         description: title
    //  *         in: formData
    //  *         required: true
    //  *       - name: intervalDays
    //  *         description: intervalDays
    //  *         in: formData
    //  *         required: true
    //  *       - name: amount
    //  *         description: amount
    //  *         in: formData
    //  *         required: true
    //  *       - name: currency
    //  *         description: currency
    //  *         in: formData
    //  *         required: true
    //  *       - name: description
    //  *         description: description
    //  *         in: formData
    //  *         required: true
    //  *       - name: tradeFee
    //  *         description: tradeFee
    //  *         in: formData
    //  *         required: true
    //  *     responses:
    //  *       200:
    //  *         description: Returns success message
    //  */
    // async addSubscription(req, res, next) {
    //     try {
    //         let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELET } });
    //         if (!adminResult) {
    //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    //         }
    //         let planObject = {
    //             title: req.body.title,
    //             interval_day: req.body.intervalDays,
    //             amount: req.body.amount,
    //             currency: req.body.currency,
    //             // ipn_callback_url: "https://node.astroqunt.app/api/v1/admin/nowPaymentCallBack"
    //             ipn_callback_url: "https://2c98-182-71-75-106.ngrok-free.app/api/v1/admin/nowPaymentCallBack"
    //         }
    //         let adminToken
    //         try {
    //             adminToken = await axios.get(`https://np.astroqunt.app/auth/token`,
    //                 {
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'x-api-key': config.get('nowPaymentTokenApiKey')
    //                     }
    //                 });
    //         } catch (error) {
    //             throw apiError.internal(error.response.data.message);
    //         }
    //         if (adminToken.status == 200) {
    //             let response2
    //             try {
    //                 response2 = await axios.post(`https://api.nowpayments.io/v1/subscriptions/plans`, planObject, {
    //                     headers: {
    //                         'Authorization': `Bearer ${adminToken.data.token}`,
    //                         'Content-Type': 'application/json'
    //                     }
    //                 });
    //             } catch (error) {
    //                 throw apiError.internal(error.response.data.message);
    //             }
    //             if (response2.status == 200) {
    //                 let plan = await createSubscriptionPlan({
    //                     planId: response2.data.result.id,
    //                     title: response2.data.result.title,
    //                     value: response2.data.result.amount,
    //                     tradeFee: req.body.tradeFee,
    //                     description: req.body.description,
    //                     intervalDays: req.body.intervalDays,
    //                     currency: req.body.currency
    //                 })
    //                 return res.json(new response(plan, responseMessage.USER_DETAILS));
    //             } else {
    //                 throw apiError.notFound("retry");
    //             }
    //         }

    //     } catch (error) {
    //         return next(error);
    //     }
    // }


    // /**
    //   * @swagger
    //   * /admin/editSubscription:
    //   *   put:
    //   *     tags:
    //   *       - ADMIN
    //   *     description: editSubscription
    //   *     produces:
    //   *       - application/json
    //   *     parameters:
    //   *       - name: token
    //   *         description: token
    //   *         in: header
    //   *         required: false
    //   *       - name: _id
    //   *         description: _id
    //   *         in: formData
    //   *         required: false
    //   *       - name: email
    //   *         description: email
    //   *         in: formData
    //   *         required: false
    //   *       - name: password
    //   *         description: password
    //   *         in: formData
    //   *         required: false
    //   *       - name: title
    //   *         description: title
    //   *         in: formData
    //   *         required: false
    //   *       - name: intervalDays
    //   *         description: intervalDays
    //   *         in: formData
    //   *         required: false
    //   *       - name: amount
    //   *         description: amount
    //   *         in: formData
    //   *         required: false
    //   *       - name: currency
    //   *         description: currency
    //   *         in: formData
    //   *         required: false
    //   *       - name: description
    //   *         description: description
    //   *         in: formData
    //   *         required: false
    //   *       - name: tradeFee
    //   *         description: tradeFee
    //   *         in: formData
    //   *         required: false
    //   *     responses:
    //   *       200:
    //   *         description: Returns success message
    //   */
    // async editSubscription(req, res, next) {
    //     try {
    //         let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
    //         if (!adminResult) {
    //             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    //         }
    //         let getPlan = await findSubscriptionPlan({ _id: req.body._id })
    //         if (!adminResult) {
    //             throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
    //         }
    //         let planObject = {
    //             title: req.body.title,
    //             interval_day: req.body.intervalDays,
    //             amount: req.body.amount,
    //             currency: req.body.currency,
    //             ipn_callback_url: "https://node-arbitragebotbitbinarge.mobiloitte.io/api/v1/admin/nowPaymentCallBack"
    //         }
    //         let adminToken
    //         try {
    //             adminToken = await axios.get(`https://np.astroqunt.app/auth/token`,
    //                 {
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'x-api-key': config.get('nowPaymentTokenApiKey')
    //                     }
    //                 });
    //         } catch (error) {
    //             throw apiError.internal(error.response.data.message);
    //         }
    //         if (adminToken.status == 200) {
    //             let response2
    //             try {
    //                 response2 = await axios.post(`https://api.nowpayments.io/v1/subscriptions/plans/${getPlan.planId}`, planObject, {

    //                     headers: {
    //                         'Authorization': `Bearer ${adminToken.data.token}`,
    //                         'Content-Type': 'application/json'
    //                     }
    //                 });
    //             } catch (error) {
    //                 throw apiError.internal(error.response.data.message);
    //             }
    //             if (response2.status == 200) {
    //                 let plan = await updateSubscriptionPlan({ _id: getPlan._id }, {
    //                     planId: response2.data.result.id,
    //                     title: response2.data.result.title,
    //                     value: response2.data.result.amount,
    //                     tradeFee: req.body.tradeFee,
    //                     description: req.body.description,
    //                     intervalDays: req.body.intervalDays
    //                 })
    //                 return res.json(new response(plan, responseMessage.USER_DETAILS));
    //             } else {
    //                 throw apiError.notFound("retry");
    //             }
    //         }

    //     } catch (error) {
    //         return next(error);
    //     }
    // }

    /**
     * @swagger
     * /admin/addSubscription:
     *   post:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: addSubscription
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: addSubscription
     *         description: addSubscription  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addSubscription'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addSubscription(req, res, next) {
        const validationSchema = {
            type: Joi.string().optional(),
            value: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            // planStatus: Joi.string().required(),
            // planDuration: Joi.string().required(),
            tradeFee: Joi.string().required(),
            exchangeUID: Joi.array().required(),
            arbitrageName: Joi.array().required(),
            pairs: Joi.array().optional(),
            capital: Joi.string().optional(),
            profits: Joi.string().required(),
            // coinType: Joi.string().required(),
            isFuelDeduction: Joi.string().required(),
            // recursiveValue: Joi.string().required(),
            // show: Joi.boolean().required(),
            // subscriptionType: Joi.string().required(),
            fuelWallet: Joi.string().required(),
            yearlyValue: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            
            // let planRes = await findSubscriptionPlan({ type: validatedBody.type, status: { $ne: status.DELETE } })
            // if (planRes) {
            //     throw apiError.conflict(responseMessage.PLAN_EXIST);
            // }
            // var endTime = new Date();
            // endTime.setTime(endTime.getTime() + (Number(validatedBody.planDuration) * 24 * 60 * 60 * 1000));
            // validatedBody.startTime = new Date()
            // validatedBody.endTime = endTime
            validatedBody.userId = adminResult._id
            let result = await createSubscriptionPlan(validatedBody)
            return res.json(new response(result, responseMessage.PLAN_ADDED));
        } catch (error) {
            console.log("error=======>849", error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/editSubscription:
     *   put:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: editSubscription
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: editSubscription
     *         description: editSubscription  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editSubscription'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editSubscription(req, res, next) {
        const validationSchema = {
            subscriptionId: Joi.string().required(),
            type: Joi.string().optional(),
            value: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            // planStatus: Joi.string().optional(),
            // planDuration: Joi.string().optional(),
            tradeFee: Joi.string().optional(),
            exchangeUID: Joi.array().optional(),
            arbitrageName: Joi.array().optional(),
            pairs: Joi.array().optional(),
            capital: Joi.string().optional(),
            profits: Joi.string().optional(),
            // coinType: Joi.string().optional(),
            isFuelDeduction: Joi.string().optional(),
            // recursiveValue: Joi.string().optional(),
            // show: Joi.boolean().optional(),
            fuelWallet: Joi.string().optional(),
            yearlyValue: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let planRes = await findSubscriptionPlan({
                _id: validatedBody.subscriptionId,
                status: {
                    $ne: status.DELETE
                }
            })
            if (!planRes) {
                throw apiError.conflict(responseMessage.DATA_NOT_FOUND);
            }

            validatedBody.userId = adminResult._id
            // if (validatedBody.planDuration) {
            //     var endTime = new Date();
            //     endTime.setTime(endTime.getTime() + (Number(validatedBody.planDuration) * 24 * 60 * 60 * 1000));
            //     validatedBody.startTime = new Date()
            //     validatedBody.endTime = endTime
            // }
            let result = await updateSubscriptionPlan({
                _id: planRes._id
            }, validatedBody)
            let p = await updateManySubscription({ subScriptionPlanId: result._id }, {
                exchangeUID: result.exchangeUID,
                arbitrageName: result.arbitrageName,
                pairs: result.pairs,
                capital: result.capital,
                profits: result.profits,
                coinType: result.coinType,
                isFuelDeduction: result.isFuelDeduction,
                tradeFee: result.tradeFee,
            })
            return res.json(new response(result, responseMessage.PLAN_UPDATED));
        } catch (error) {
            console.log("error=======>849", error)
            return next(error);
        }
    }

    async nowPaymentCallBack(req, res, next) {
        let subscription = await buySubsciptionPlanData({
            order_id: req.body.order_id
        })
        if (subscription) {
            if (req.body.payment_status == "finished") {
                let userFindRes = await findUser({
                    _id: subscription.userId
                })
                let getPlan = await findSubscriptionPlan({
                    _id: subscription.subScriptionPlanId
                })
                var endTime = new Date();
                endTime.setTime(endTime.getTime() + (Number(getPlan.planDuration) * 24 * 60 * 60 * 1000));
                let startTime = new Date()
                if (userFindRes) {
                    if (userFindRes.subscriptionPlaneId) {
                        let priviousRes = await lastedBuyPlan({
                            userId: subscription.userId,
                            _id: userFindRes.subscriptionPlaneId,
                            order_id: {
                                $ne: req.body.order_id
                            }
                        })
                        if (priviousRes) {
                            if (priviousRes.status == status.ACTIVE) {
                                const date1 = new Date(priviousRes.endTime);
                                const date2 = new Date();
                                const differenceInTime = date2.getTime() - date1.getTime();
                                const differenceInDays = differenceInTime / (1000 * 3600 * 24);
                                if (Math.round(differenceInDays) >= -3 && Math.round(differenceInDays) <= 0) {
                                    endTime = new Date(priviousRes.endTime);
                                    endTime.setTime(endTime.getTime() + (Number(getPlan.planDuration) * 24 * 60 * 60 * 1000));
                                    startTime = priviousRes.endTime
                                }
                            }
                            let [inActiveAll, updateRes] = await Promise.all([
                                buySubsciptionPlanUpdate({
                                    _id: priviousRes._id
                                }, {
                                    planStatus: "INACTIVE"
                                }),
                                updateUser({
                                    _id: subscription.userId
                                }, {
                                    previousPlaneId: priviousRes._id,
                                    previousPlanName: priviousRes.subScriptionPlanId.type,
                                    previousPlanStatus: "INACTIVE",
                                })
                            ])
                        }
                    }
                }

                let [userUpdateRes, updateSubscriptionPlanRes] = await Promise.all([
                    updateUser({
                        _id: subscription.userId
                    }, {
                        subscriptionPlaneId: subscription._id,
                        currentPlanName: getPlan.title,
                        currentPlanStatus: "ACTIVE",
                        subscriptionPlaneStatus: true,
                        planCapitalAmount: getPlan.capital,
                        // planProfit: getPlan.profits,
                        paymentType: paymentType.CRYPTO,
                        cryptoCurrency: subscription.pay_currency,
                        subscriptionType: getPlan.subscriptionType
                    }),
                    buySubsciptionPlanUpdate({
                        _id: subscription._id
                    }, {
                        planStatus: "ACTIVE",
                        startTime: startTime,
                        endTime: endTime,
                        payment_status: req.body.payment_status
                    })
                ])
            } else {
                let activePlan = await buySubsciptionPlanUpdate({
                    _id: subscription._id
                }, {
                    payment_status: req.body.payment_status
                })
            }
        }
    }

    /**
     * @swagger
     * /admin/subscriptionPlanListWithFilterV1:
     *   get:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: Subscription plan list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search as planName(type)  
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
     *         description: Returns success message
     */
    async subscriptionPlanListWithFilterV1(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            show: Joi.boolean().optional(),
            subscriptionType: Joi.string().optional(),
        };
        try {
            let userResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.USER]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let validateBody = await Joi.validate(req.query, validationSchema)
            let result = await paginateSearchSubscriptionv1(validateBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
            }
            let checkExist = await lastedBuyPlan({
                userId: userResult._id,
                planStatus: {
                    $ne: "PENDING"
                },
                status: status.ACTIVE
            })
            if (!checkExist) {
                for (let i = 0; i < result.docs.length; i++) {
                    result.docs[i]._doc.payableAmount = Number(result.docs[i].value) + Number(result.docs[i].recursiveValue)
                    result.docs[i]._doc.recursivePayAmount = Number(result.docs[i].recursiveValue)
                    result.docs[i]._doc.enteryFee = Number(result.docs[i].value)
                    result.docs[i]._doc.isBuy = true
                }
            } else {
                let dayBeforeExpire = 10
                let dayAfterExpireGrace = -3
                const date1 = new Date(checkExist.endTime);
                const date2 = new Date();
                const differenceInTime = date2.getTime() - date1.getTime();
                const differenceInDays = differenceInTime / (1000 * 3600 * 24);
                let priviousRes = await findSubscriptionPlan({
                    _id: checkExist.subScriptionPlanId._id
                })
                if (priviousRes.subscriptionType == subscriptionPlanType.PAID) {
                    for (let i = 0; i < result.docs.length; i++) {
                        if (Math.round(differenceInDays) <= dayBeforeExpire) {
                            if (Number(priviousRes.value) >= Number(result.docs[i].value)) {
                                if (Math.round(differenceInDays) <= dayBeforeExpire && Math.round(differenceInDays) >= dayAfterExpireGrace) {
                                    result.docs[i]._doc.payableAmount = Number(result.docs[i].recursiveValue)
                                    result.docs[i]._doc.recursivePayAmount = Number(result.docs[i].recursiveValue)
                                    result.docs[i]._doc.enteryFee = 0
                                    result.docs[i]._doc.isBuy = true
                                } else {
                                    result.docs[i]._doc.isBuy = false
                                }
                            } else {
                                result.docs[i]._doc.payableAmount = (Number(result.docs[i].value) - Number(priviousRes.value)) + Number(result.docs[i].recursiveValue)
                                result.docs[i]._doc.recursivePayAmount = Number(result.docs[i].recursiveValue)
                                result.docs[i]._doc.enteryFee = (Number(result.docs[i].value) - Number(priviousRes.value))
                                result.docs[i]._doc.isBuy = true
                            }
                        } else {
                            result.docs[i]._doc.payableAmount = Number(result.docs[i].value) + Number(result.docs[i].recursiveValue)
                            result.docs[i]._doc.recursivePayAmount = Number(result.docs[i].recursiveValue)
                            result.docs[i]._doc.enteryFee = Number(result.docs[i].value)
                            result.docs[i]._doc.isBuy = true
                        }
                        if ((checkExist.subScriptionPlanId._id).toString() == (result.docs[i]._id).toString()) {
                            result.docs[i]._doc.isSubscribe = true
                        } else {
                            result.docs[i]._doc.isSubscribe = false
                        }
                    }
                } else {
                    for (let i = 0; i < result.docs.length; i++) {
                        result.docs[i]._doc.payableAmount = Number(result.docs[i].value) + Number(result.docs[i].recursiveValue)
                        result.docs[i]._doc.recursivePayAmount = Number(result.docs[i].recursiveValue)
                        result.docs[i]._doc.enteryFee = Number(result.docs[i].value)
                        result.docs[i]._doc.isBuy = true
                    }
                }
            }
            for (let j = 0; j < result.docs.length; j++) {
                let checkPendingRes = await buySubsciptionPlanData({
                    userId: userResult._id,
                    subScriptionPlanId: result.docs[j]._id,
                    planStatus: 'PENDING',
                    payment_status: {
                        $nin: ['finished', 'failed', 'refunded', 'expired']
                    }
                })
                if (checkPendingRes) {
                    result.docs[j]._doc.isPlanPending = true
                    result.docs[j]._doc.isBuy = false
                }
            }
            return res.json(new response(result, responseMessage.SUBSCRIPTION_PLAN));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/disableUserGoogleAuthByAdmin:
     *   get:
     *     tags:
     *       - AUTHENCATION
     *     description: disableUserGoogleAuthByAdmin
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
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async disableUserGoogleAuthByAdmin(req, res, next) {
        var validationSchema = {
            userId: Joi.string().required(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let userResult = await findUser({
                _id: validatedBody.userId,
                status: {
                    $ne: status.DELETE
                }
            });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (userResult.speakeasy == false) {
                throw apiError.badRequest(responseMessage.GOOGEL_AUTH_ALREADY_DISABLE);
            }
            let updateRes = await updateUser({
                _id: userResult._id
            }, {
                speakeasy: false,
                base32: '',
                speakeasyQRcode: ''
            })
            return res.json(new response(updateRes, responseMessage.GOOGEL_AUTH));

        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getUserProfile:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: get user data
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
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getUserProfile(req, res, next) {
        try {
            let adminResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let [userResult, docusealRes] = await Promise.all([
                findUser({ _id: req.query.userId, status: { $ne: status.DELETE } }),
                findDocuseal({ userId: req.query.userId })
            ])
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            userResult = JSON.parse(JSON.stringify(userResult));
            if (docusealRes) {
                userResult.isDocuseal = true
            }
            const keysToRemove = ['password', 'otp', 'otpExpireTime'];
            keysToRemove.forEach(key => delete userResult[key]);
            return res.json(new response(userResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getIpAddressCheck:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: getIpAddressCheck
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getIpAddressCheck(req, res, next) {
        try {
            let ipAddressCheckRes = await findIpAddressCheck({
                status: {
                    $ne: status.DELETE
                }
            });
            if (!ipAddressCheckRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(ipAddressCheckRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/updateIpAddressCheck:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: updateIpAddressCheck
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: isTrue
     *         description: isTrue (true/false)
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async updateIpAddressCheck(req, res, next) {
        try {
            let adminResult = await findUser({
                _id: req.userId,
                status: {
                    $ne: status.DELETE
                },
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let ipAddressCheckRes = await findIpAddressCheck({
                status: {
                    $ne: status.DELETE
                }
            });
            if (!ipAddressCheckRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            let updateRes = await updateIpAddressCheck({
                _id: ipAddressCheckRes._id
            }, {
                isTrue: req.query.isTrue
            })
            return res.json(new response(updateRes, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getAllUser:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: Subscription plan list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getAllUser(req, res, next) {
        var validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let query = { status: status.ACTIVE, userType: userType.USER }
            if (validatedBody.search) {
                query.$or = [
                    { email: { $regex: validatedBody.search, $options: 'i' } },
                    { firstName: { $regex: validatedBody.search, $options: 'i' } },
                    { lastName: { $regex: validatedBody.search, $options: 'i' } },
                    { mobileNumber: { $regex: validatedBody.search, $options: 'i' } },
                    { ibiId: { $regex: validatedBody.search, $options: 'i' } },
                    { ibiName: { $regex: validatedBody.search, $options: 'i' } },
                ]
            }
            let result = await findAllUserWithSelectedField(query)
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            return res.json(new response(result, responseMessage.USER_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getUserDocusealData:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: getUserDocusealData for admin
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
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getUserDocusealData(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let docusealRes = await findDocuseal({ userId: req.query.userId })
            if (!docusealRes) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(docusealRes, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/assignSubscription:
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
     *       - name: userId
     *         description: userId
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
    async assignSubscription(req, res, next) {
        const validationSchema = {
            subscriptionPlanId: Joi.string().required(),
            userId: Joi.string().required(),
            planType: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.notFound(responseMessage.UNAUTHORIZED);
            }
            let userResult = await findUser({ _id: validatedBody.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            userResult = JSON.parse(JSON.stringify(userResult))
            let subscriptionRes = await findSubscriptionPlan({ _id: validatedBody.subscriptionPlanId, planStatus: 'ACTIVE', status: status.ACTIVE, })
            if (!subscriptionRes) {
                throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
            }
            let activePlan = await buySubsciptionPlanData({ userId: userResult._id, planStatus: 'ACTIVE', status: status.ACTIVE })
           
             let planAmount =validatedBody.planType == "MONTHLY" ? subscriptionRes.value : subscriptionRes.yearlyValue
            var endTime = new Date();
            endTime.setTime(endTime.getTime() + (Number(validatedBody.planType == "MONTHLY" ? 30 : 365) * 24 * 60 * 60 * 1000));
            let startTime = new Date()
           
            let obj = {
                userId: userResult._id,
                subScriptionPlanId: subscriptionRes._id,
                tradeFee: subscriptionRes.tradeFee,
                exchangeUID: subscriptionRes.exchangeUID,
                arbitrageName: subscriptionRes.arbitrageName,
                pairs: subscriptionRes.pairs,
                capital: subscriptionRes.capital,
                profits: subscriptionRes.profits,
                coinType: subscriptionRes.coinType,
                isFuelDeduction: subscriptionRes.isFuelDeduction,
                startTime: startTime,
                endTime: endTime,
                planStatus: "ACTIVE",
                price_amount :planAmount,
                planType:validatedBody.planType,
                paymentType:"FREE"
            }
            let createObj = await buySubsciptionPlanCreate(obj)
            if (createObj) {
                if (userResult.subscriptionPlaneId) {
                    let priviousRes = await lastedBuyPlan({
                        userId: userResult._id,
                        _id: userResult.subscriptionPlaneId,

                    })
                    if (priviousRes) {

                        let [inActiveAll, updateRes] = await Promise.all([
                            buySubsciptionPlanUpdate({
                                _id: priviousRes._id
                            }, {
                                planStatus: "INACTIVE"
                            }),
                            updateUser({
                                _id: userResult.userId
                            }, {
                                previousPlaneId: priviousRes._id,
                                previousPlanName: priviousRes.subScriptionPlanId.type,
                                previousPlanStatus: "INACTIVE",
                                paymentType: "FREE",
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
                    paymentType: "FREE",
                    subscriptionType: subscriptionRes.subscriptionType
                })
                return res.json(new response(createObj, responseMessage.BUY_PLAN));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/listCredentials:
     *   get:
     *     tags:
     *       - ADMIN
     *     description: listCredentials
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async listCredentials(req, res, next) {
        try {
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let credentials = await findCredentials({
                title: req.query.title
            });
            if (!credentials) {
                throw apiError.unauthorized(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(credentials, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/updateCredentials:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: listCredentials
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: updateCredentials
     *         description: updateCredentials  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/updateCredentials'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async updateCredentials(req, res, next) {
        const validationSchema = {
            credentialId: Joi.string().required(),
            nowPaymentApiKey: Joi.string().optional(),
            nowPaymentUrl: Joi.string().optional(),
            nowPaymentCallbackUrl: Joi.string().optional(),
            sendGridKey: Joi.string().optional(),
            trustPaymentUrl: Joi.string().optional(),
            trustPaymentUserName: Joi.string().optional(),
            trustPaymentPassword: Joi.string().optional(),
            trustPaymentSiteReference: Joi.string().optional(),
            trustPaymentAlias: Joi.string().optional(),
            cloud_name: Joi.string().optional(),
            api_key: Joi.string().optional(),
            api_secret: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);

            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }

            let credentials = await findCredentials({
                _id: validatedBody.credentialId
            });
            if (!credentials) {
                throw apiError.unauthorized(responseMessage.DATA_NOT_FOUND);
            }
            validatedBody.title = credentials.title
            let responses = await checkCredentials(validatedBody)
            if (!responses.status) {
                throw apiError.unauthorized(responseMessage.CREDENTIAL_ERROR(responses.msg));
            }
            let result = await updateCredentials({ _id: validatedBody.credentialId }, validatedBody)
            return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }
    /**
     * @swagger
     * /admin/specificSubscriptionPlanList:
     *   get:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: Subscription plan list
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: subType
     *         description: subType (FREE,CUSTOM)
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async specificSubscriptionPlanList(req, res, next) {
        var validationSchema = {
            search: Joi.string().optional(),
            subType: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let query = { planStatus: "ACTIVE", status: status.ACTIVE, show: false, subscriptionType: { $ne: subscriptionPlanType.PAID } }
            if (validatedBody.search) {
                query.$or = [
                    { title: { $regex: validatedBody.search, $options: 'i' } },
                ]
            }
            if (validatedBody.subType) {
                query.subscriptionType = validatedBody.subType
            }
            let result = await subscriptionPlanList(query)
            if (result.length == 0) {
                throw apiError.notFound(responseMessage.SUBSCRIPTION_PLAN_NOT);
            }
            return res.json(new response(result, responseMessage.SUBSCRIPTION_PLAN));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/updateTrustPaymentKeys:
     *   put:
     *     tags:
     *       - KEYS
     *     description: updateTrustPaymentKeys
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: trustPaymentUserName
     *         description: trustPaymentUserName
     *         in: query
     *         required: false
     *       - name: trustPaymentPassword
     *         description: trustPaymentPassword
     *         in: query
     *         required: false
     *       - name: trustPaymentSiteReference
     *         description: trustPaymentSiteReference
     *         in: query
     *         required: false
     *       - name: trustPaymentAlias
     *         description: trustPaymentAlias
     *         in: query
     *         required: false
     *       - name: trustPaymentIssuer
     *         description: trustPaymentIssuer
     *         in: query
     *         required: false
     *       - name: trustPaymentSecret
     *         description: trustPaymentSecret
     *         in: query
     *         required: false
     *       - name: trustPaymentUrl
     *         description: trustPaymentUrl
     *         in: query
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async updateTrustPaymentKeys(req, res, next) {
        var validationSchema = {
            trustPaymentUserName: Joi.string().optional(),
            trustPaymentPassword: Joi.string().optional(),
            trustPaymentSiteReference: Joi.string().optional(),
            trustPaymentAlias: Joi.string().optional(),
            trustPaymentIssuer: Joi.string().optional(),
            trustPaymentSecret: Joi.string().optional(),
            trustPaymentUrl: Joi.string().optional(),
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            const credentials = await findKeys();
            if (!credentials) {
                throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
            }

            if (Object.keys(validatedBody).length > 0) {
                const encryptedBody = await Promise.all(
                    Object.entries(validatedBody).map(async ([key, value]) => {
                        return { [key]: await commonFunction.encrypt(value) };
                    })
                );

                validatedBody = Object.assign({}, ...encryptedBody);
            }

            const result = await updateKeys({ _id: credentials._id }, validatedBody);
            return res.json(new response(result, responseMessage.KEYS_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getTrustPaymentKeys:
     *   get:
     *     tags:
     *       - KEYS
     *     description: getTrustPaymentKeys
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
    async getTrustPaymentKeys(req, res, next) {
        try {
            // Check admin access
            const adminResult = await findUser({
                _id: req.userId,
                status: { $ne: status.DELETE },
                userType: { $in: [userType.ADMIN, userType.SUBADMIN] },
            });

            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }

            // Retrieve credentials
            let credentials = await findKeys();
            if (!credentials) {
                throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
            }

            // If credentials are a Mongoose document, convert to plain object
            if (credentials.toObject) {
                credentials = credentials.toObject();
            }

            // Initialize an empty object to store the decrypted data
            let data = {};

            // Loop through each key in credentials and decrypt the value
            for (let i = 0; i < Object.keys(credentials).length; i++) {
                const key = Object.keys(credentials)[i];  // Get the key at index i
                // console.log("Decrypting key:", key, "Value:", credentials[key]);

                // Decrypt the value for each key and store it in data object
                data[key] = await commonFunction.decrypt(credentials[key]);
            }

            // Return decrypted credentials
            return res.json(new response(data, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/getTrustPaymentKeysStatus:
     *   get:
     *     tags:
     *       - KEYS
     *     description: getTrustPaymentKeys
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getTrustPaymentKeysStatus(req, res, next) {
        try {

            // Retrieve credentials
            let status = true
            let credentials = await findKeys();
            if (!credentials) {
                status = false
                return res.json(new response({ status: status }, responseMessage.DATA_FOUND));
            }
            if (credentials.trustPaymentUserName == "" || credentials.trustPaymentPassword == "" || credentials.trustPaymentSiteReference == "" || credentials.trustPaymentAlias == "" || credentials.trustPaymentIssuer == "" || credentials.trustPaymentSecret == "" || credentials.trustPaymentUrl == "") {
                status = false
                return res.json(new response({ status: status }, responseMessage.DATA_FOUND));
            }

            return res.json(new response({ status: status }, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
 * @swagger
 * /admin/refundPayment:
 *   put:
 *     tags:
 *       - KEYS
 *     description: refundPayment
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
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
 */
    async refundPayment(req, res, next) {
        var validationSchema = {
            userId: Joi.string().optional()
        }
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            const adminResult = await findUser({
                _id: req.userId,
                status: { $ne: status.DELETE },
                userType: { $in: [userType.ADMIN, userType.SUBADMIN] },
            });

            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }

            let user = await findUser({ _id: validatedBody.userId });
            if (!user) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            let keys = await findKeys()
            if (!keys) {
                throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
            }
            let [trustPaymentAlias, trustPaymentSiteReference, trustPaymentUrl, userName, password] = await Promise.all([
                commonFunction.decrypt(keys.trustPaymentAlias),
                commonFunction.decrypt(keys.trustPaymentSiteReference),
                commonFunction.decrypt(keys.trustPaymentUrl),
                commonFunction.decrypt(keys.trustPaymentUserName),
                commonFunction.decrypt(keys.trustPaymentPassword),
            ])
            if (user.transactionReference && user.currentPlanStatus == "ACTIVE") {
                let lastSubscription = await buySubsciptionPlanData({ _id: user.subscriptionPlaneId })
                if (lastSubscription) {
                    let order_id = commonFunction.generateOrder()
                    const paymentData = JSON.stringify({
                        "alias": trustPaymentAlias,
                        "version": "1.00",
                        "request": [{
                            "sitereference": trustPaymentSiteReference,
                            "requesttypedescriptions": ["REFUND"],
                            "parenttransactionreference": user.transactionReference,
                            "mainamount": lastSubscription.pay_amount.toString(),
                            "orderreference": order_id
                        }]
                    });
                    let authToken = await commonFunction.generateTrustPaymentAuthToken(userName, password)
                    const headers = {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': "Basic " + authToken
                    }
                    let result = await axios.post(trustPaymentUrl, paymentData, { headers })
                    if (result.data.response[0].errorcode == "0") {
                        await Promise.all([
                            updateUser({ _id: user._id }, {
                                currentPlanStatus: "INACTIVE", subscriptionPlaneStatus: false
                            }),
                            buySubsciptionPlanUpdate({ _id: lastSubscription._id }, { payment_status: "refunded", planStatus: "INACTIVE" })
                        ])
                        return res.json(new response(data, responseMessage.REFUND_SUCCESS(lastSubscription.pay_amount)));
                    } else {
                        throw apiError.internal(result.data.response[0].errormessage || "Refund failed");
                    }
                }

            } else {
                throw apiError.internal("Refund failed");
            }

        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/rejectDocuSeal:
     *   put:
     *     tags:
     *       - ADMIN
     *     description: rejectDocuSeal
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: userId
     *         description: userId
     *         in: body
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async rejectDocuSeal(req, res, next) {
        const validationSchema = {
            userId: Joi.string().required(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const adminResult = await findUser({
                _id: req.userId,
                status: { $ne: status.DELETE },
                userType: { $in: [userType.ADMIN, userType.SUBADMIN] },
            });

            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }

            let user = await findUser({ _id: validatedBody.userId });
            if (!user) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let docuseal = await findDocuseal({ userId: user._id, status: status.ACTIVE })
            if (!docuseal) {
                throw apiError.unauthorized(responseMessage.DOCUSEAL_NOT_FOUND);
            }
            await Promise.all([updateDocuseal({ _id: docuseal._id }, { status: status.REJECTED }), updateUser({ _id: user._id }, { $set: { isRejected: true } })])

            return res.json(new response({ success: true }, responseMessage.DOCUSEAL_REJECTED));
        } catch (error) {
            return next(error);
        }
    }

        /**
     * @swagger
     * /admin/manageRecurring:
     *   put:
     *     tags:
     *       - USER
     *     description: manageRecurring
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
     *     responses:
     *       200:
     *         description: Returns success message
     */
        async manageRecurring(req, res, next) {
       
            try {
                let adminResult = await findUser({ _id: req.userId,userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: { $ne: status.DELETE } });
                if (!adminResult) {
                    throw apiError.notFound(responseMessage.UNAUTHORIZED);
                }
                let userResult =await findUser({ _id: req.body.userId,  status: { $ne: status.DELETE } });
                if (!adminResult) {
                    throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                }
                let recursiveStatus= true
                let responseMsg ="Recursive payment enabled"
                if(userResult.recursivePayment && userResult.recursivePayment == true){
                    recursiveStatus= false
                    responseMsg = "Recursive payment disabled"
                }
                let updateResult = await updateUser({ _id: userResult._id }, { $set: {recursivePayment:recursiveStatus} });
                return res.json(new response(updateResult, responseMsg));
            } catch (error) {
                return next(error);
            }
        }

        /**
     * @swagger
     * /admin/requestWithdrawAccount:
     *   get:
     *     tags:
     *       - USER MANAGEMENT
     *     description: Get all request withdraw account.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
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
     *       - name: status
     *         description: requestStatus
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
    async requestWithdrawAccount(req, res, next) {
        const validationSchema = {
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            status: Joi.string().optional()

        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let transactionHistory = await transactionPaginateSearch(validatedBody)
            if (transactionHistory.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(transactionHistory, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

        /**
     * @swagger
     * /admin/approveRejectRequest:
     *   put:
     *     tags:
     *       - USER MANAGEMENT
     *     description: Approve request 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *       - name: reason
     *         description: reason
     *         in: formData
     *         required: false
     *       - name: status
     *         description: requestStatus (APPROVED,REJECTED)
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: User found successfully.
     *       404:
     *         description: User not found.
     *       500:
     *         description: Internal Server Error
     *       501:
     *         description: Something went wrong!
     */
    async approveRejectRequest(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            status: Joi.string().required(),
            reason: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, userType: userType.ADMIN, status: { $ne: status.DELETE } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let trx =await findTransaction({_id:validatedBody._id})
            if(!trx){
              throw apiError.unauthorized("Request not found");  
            }
            if(validatedBody.status =="REJECTED"){
                await updateTransaction({_id:trx._id},{$set:{status:validatedBody.status,reason:validatedBody.reason}})
                 return res.json(new response({},"Withdrawal request rejected successfully."));
            }
             await updateTransaction({_id:trx._id},{$set:{status:validatedBody.status}})
             await updateUser({_id:trx.userId},{$inc:{totalReward:-trx.amount}})
            return res.json(new response(updateRes, "Withdrawal request approved successfully."));
        } catch (error) {
            return next(error);
        }
    }

    
    /**
     * @swagger
     * /admin/addSubscriptionPooling:
     *   post:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: addSubscriptionPooling
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *       - name: minProfits
     *         description: minProfits
     *         in: formData
     *         required: true
     *       - name: maxProfits
     *         description: maxProfits
     *         in: formData
     *         required: true
     *       - name: minTotalTrades
     *         description: minTotalTrades
     *         in: formData
     *         required: true
     *       - name: maxInvestment
     *         description: maxInvestment
     *         in: formData
     *         required: true
     *       - name: profitPotential
     *         description: profitPotential
     *         in: formData
     *         required: true
     *       - name: image
     *         description: image
     *         in: formData
     *         type: file
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async addSubscriptionPooling(req, res, next) {
        const validationSchema = {
            title: Joi.string().required(),
            description: Joi.string().required(),
            minProfits: Joi.string().required(),
            maxProfits: Joi.string().required(),
            minTotalTrades: Joi.string().required(),
            minInvestment: Joi.string().required(),
            maxInvestment: Joi.string().required(),
            profitPotential: Joi.string().required(),
            image: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let alreadyPresent =await findPoolingSubscriptionPlan({title:validatedBody.title})
            if(alreadyPresent){
                 throw apiError.unauthorized("Plan already present with same title.");
            }
            if (req.files) {
                if (req.files.length != 0) {
                    validatedBody.image = await commonFunction.getImageUrl(req.files);
                }
            }
            let result = await createPoolingSubscriptionPlan(validatedBody)
            return res.json(new response(result, responseMessage.PLAN_ADDED));
        } catch (error) {
            console.log("error=======>849", error)
            return next(error);
        }
    }

    
    /**
     * @swagger
     * /admin/editSubscriptionPooling:
     *   put:
     *     tags:
     *       - SUBSCRIPTION_PLAN
     *     description: editSubscriptionPooling
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: planId
     *         description: planId
     *         in: formData
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: false
     *       - name: description
     *         description: description
     *         in: formData
     *         required: false
     *       - name: minProfits
     *         description: minProfits
     *         in: formData
     *         required: false
     *       - name: maxProfits
     *         description: maxProfits
     *         in: formData
     *         required: false
     *       - name: minTotalTrades
     *       - name: minInvestment
     *         description: minInvestment
     *         in: formData
     *         required: false
     *       - name: maxInvestment
     *         description: maxInvestment
     *         in: formData
     *         required: false
     *       - name: image
     *         description: image
     *         in: formData
     *         required: false
     *       - name: profitPotential
     *         description: profitPotential
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async editSubscriptionPooling(req, res, next) {
        const validationSchema = {
            planId: Joi.string().required(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            minProfits: Joi.string().optional(),
            maxProfits: Joi.string().optional(),
            minTotalTrades: Joi.string().optional(),
            minInvestment: Joi.string().optional(),
            maxInvestment: Joi.string().optional(),
            profitPotential: Joi.string().optional(),
            image: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({
                _id: req.userId,
                userType: {
                    $in: [userType.ADMIN, userType.SUBADMIN]
                },
                status: {
                    $ne: status.DELETE
                }
            });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let alreadyPresent =await findPoolingSubscriptionPlan({title:validatedBody.title,_id:{$ne:validatedBody.planId}})
            if(alreadyPresent){
                 throw apiError.unauthorized("Plan already present with same title.");
            }
            if (req.files) {
                if (req.files.length != 0) {
                    validatedBody.image = await commonFunction.getImageUrl(req.files);
                }
            }
            let result = await updatePoolingSubscriptionPlan({_id:validatedBody.planId},validatedBody)
            return res.json(new response(result, responseMessage.PLAN_ADDED));
        } catch (error) {
            console.log("error=======>849", error)
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/planListPooling:
     *   get:
     *     tags:
     *       - USER MANAGEMENT
     *     description: planListPooling
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
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
     *       - name: status
     *         description: requestStatus
     *         in: query
     *         required: false
     *       - name: search
     *         description: search
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
    async planListPooling(req, res, next) {
        const validationSchema = {
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
            status: Joi.string().optional(),
            search: Joi.string().optional()

        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let adminResult = await findUser({
                userType:"ADMIN",
            })
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
             if(userResult){
                validatedBody.status ="ACTIVE"
             }
            let transactionHistory = await paginateSearchPoolingSubscriptionPlan(validatedBody)
            if (transactionHistory.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
           for (let i = 0; i < transactionHistory.docs.length; i++) {
    let doc = transactionHistory.docs[i].toObject(); // convert to plain object

    let activePlan = await findPoolSubscriptionHistoryPlan({
        subscriptionPlanId: transactionHistory.docs[i]._id,
        status: "ACTIVE",
        userId: userResult._id,
    });

    doc.isActive = !!activePlan; // true or false

    // replace original with modified version
    transactionHistory.docs[i] = doc;
    let allTrx =await transactionList({
        subscriptionPlanId: transactionHistory.docs[i]._id,
        userId: adminResult._id,})
        let profitPercentage = allTrx.reduce((acc, curr) => acc + curr.profitPercentage, 0);
        doc.profitPercentage = profitPercentage / allTrx.length;
}

            return res.json(new response(transactionHistory, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

        /**
     * @swagger
     * /admin/viewplanPooling:
     *   get:
     *     tags:
     *       - USER MANAGEMENT
     *     description: viewplanPooling
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
    async viewplanPooling(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let userResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
             if(userResult){
                validatedBody.status ="ACTIVE"
             }
            let transactionHistory = await findPoolingSubscriptionPlan({_id:validatedBody._id})
            if (!transactionHistory) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(transactionHistory, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /admin/transactionAdditionScript:
     *   post:
     *     tags:
     *       - USER MANAGEMENT
     *     description: transactionAdditionScript
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
    async transactionAdditionScript(req, res, next) {
       
        try {
            let userResult = await findUser({ _id: req.userId,userType:"ADMIN", status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let allTimes =await getRandomDateTimeStatus(60)
            let allPlans =await poolingSubscriptionPlanList()
            if(allPlans.length == 0){
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            let allProfitPaths =await profitpatheList({
                 path: { $exists: true, $not: { $size: 0 } },
                      arbitrageName:{$in:[arbitrage.TriangularArbitrage,arbitrage.IntraArbitrage,arbitrage.DirectArbitrage]},
                    
            })
            if(!allProfitPaths.length){
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            let allPaths = allProfitPaths.map((path) => {
                return {...path,_id:path._id.toString()}
            })
            let investMent = 1557;
            for (let i = 0; i < allTimes.length; i++) {
  let tradeAmount = await getRandomObjectsFromArray([50, 500, 420, 250, 320, 140, 555, 600, 20, 40, 100]);
  let path = await getRandomObjectsFromArray(allPaths);
  let originalProfitPath = allProfitPaths.find((p) => p._id == path._id);

  // Deep copy or just clone needed fields
  let profitPathForTrade = {
    ...path,
  };
      profitPathForTrade.path=[originalProfitPath]

  let subPlan = await getRandomObjectsFromArray(allPlans);
  let tradeProfitPerc = await getRandomFloat((subPlan.minProfits/30), (subPlan.maxProfits/30));

  let tradeProfit = (tradeAmount * tradeProfitPerc) / 100;
  tradeProfit = allTimes[i].status ? tradeProfit : -tradeProfit;

  let randomInc = await getRandomObjectsFromArray([50, 75, 99, 25, 73, 39, 61]);
  investMent = allTimes[i].status ? investMent : investMent + randomInc;

  let obj = {
    profitPath: profitPathForTrade,
    subscriptionPlanId: subPlan._id,
    totalPlanInvestment: investMent,
    profit: tradeProfit,
    profitPercentage: tradeProfit > 0 ? tradeProfitPerc : -tradeProfitPerc,
    transactionType: "TRADE",
    tradeAmount: tradeAmount,
    status: "COMPLETED",
    userId: userResult._id,
    date: allTimes[i].date,
  };

  await createTransaction(obj);
}

             
            return res.json(new response({}, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

      /**
       * @swagger
       * /admin/transactionHistoryPerPlan:
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
    
      async transactionHistoryPerPlan(req, res, next) {
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
          planId: Joi.string().optional()
        };
        try {
          let validatedBody = await Joi.validate(req.query, validationSchema);
          let userResult = await findUser({
            _id: req.userId,
            status:  status.ACTIVE
          });
          if (!userResult) {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }

           let adminResult = await findUser({
            userType: "ADMIN",
            status:  status.ACTIVE
          });
          if (!adminResult) {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }
         
            validatedBody.userId = adminResult._id
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
       * /admin/updateWalletUser:
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
       *         required: true
       *       - name: userId
       *         description: userId
       *         in: formData
       *         required: true
       *       - name: trxType
       *         description: trxType
       *         in: formData
       *         required: true
       *       - name: reason
       *         description: reason
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
    
      async updateWalletUser(req, res, next) {
        const validationSchema = {
          amount: Joi.string().required(),
          userId: Joi.string().required(),
          trxType: Joi.string().required(),
          reason: Joi.string().optional()
        };
        try {
          let validatedBody = await Joi.validate(req.body, validationSchema);
          let adminResult = await findUser({
            _id: req.userId,
            status:  status.ACTIVE
          });
          if (!adminResult) {
            throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
          }
          let findUserData =await findUser({ _id: validatedBody.userId });
          if (!findUserData) {
            throw apiError.notFound(responseMessage.USER_NOT_FOUND);
          }
          if(validatedBody.trxType == "DEDUCTION"){
            let getWalletBalance =await aedGardoPaymentFunctions.getWalletBalance(findUserData.code,config.get("aedgardoApiKey"));
                    if(getWalletBalance.status == false){
                      throw apiError.notFound(getWalletBalance.result.message);
                    }
                    if(getWalletBalance.result.status == 0){
                      throw apiError.notFound(getWalletBalance.result.message);
                    }
                    if(Number(getWalletBalance.result.data.amount)<validatedBody.amount){
                      throw apiError.unauthorized("Low Balance");
                    }
                    let deduction = await aedGardoPaymentFunctions.deduction(findUserData.code,validatedBody.amount,config.get("aedgardoApiKey"),"fund","debit");
                if(deduction.status == false){
                  throw apiError.notFound(deduction.result.message);
                 }
                 if(deduction.result.status == 0){
                    throw apiError.notFound(deduction.result.message);
                  }
                   let order_id = commonFunction.generateOrder();
                        await createTransaction({
                          userId: findUserData._id,
                          amount: validatedBody.amount,
                          transactionType: "DEDUCTION",
                          order_id: order_id,
                          status: status.COMPLETED,
                        //   trnasactionHash: isVerified.result.data.hash,
                          depositedBy:"ASTROQUNT",
                          reason:validatedBody.reason,
                          walletType:"MAIN"
                        });
          return res.json(
            new response({}, "Operation completed successfully")
          );
          }
           let deduction = await aedGardoPaymentFunctions.deduction(findUserData.code,validatedBody.amount,config.get("aedgardoApiKey"),"fund","credit");
                if(deduction.status == false){
                  throw apiError.notFound(deduction.result.message);
                 }
                 if(deduction.result.status == 0){
                    throw apiError.notFound(deduction.result.message);
                  }
                  let order_id = commonFunction.generateOrder();
                        await createTransaction({
                          userId: findUserData._id,
                          amount: validatedBody.amount,
                          transactionType: "DEPOSIT",
                          order_id: order_id,
                          status: status.COMPLETED,
                        //   trnasactionHash: isVerified.result.data.hash,
                          depositedBy:"ASTROQUNT",
                          walletType:"MAIN"
                        });
          return res.json(
            new response({}, "Operation completed successfully")
          );
        } catch (error) {
          return next(error);
        }
      }


    

}
export default new adminController()
function getRandomObjectsFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
const checkCredentials = async (validateBody) => {
    if (validateBody.title == "nowPayment") {
        if (!validateBody.nowPaymentApiKey || validateBody.nowPaymentApiKey == "") {
            return { status: false, msg: "nowPaymentApiKey" }
        }
        if (!validateBody.nowPaymentUrl || validateBody.nowPaymentUrl == "") {
            return { status: false, msg: "nowPaymentUrl" }
        }
        if (!validateBody.nowPaymentCallbackUrl || validateBody.nowPaymentCallbackUrl == "") {
            return { status: false, msg: "nowPaymentCallbackUrl" }
        }
        return { status: true, msg: "nowPayment" }
    }

    if (validateBody.title == "sendGrid") {
        if (!validateBody.sendGridKey || validateBody.sendGridKey == "") {
            return { status: false, msg: "sendGridKey" }
        }
        return { status: true, msg: "sendGrid" }
    }

    if (validateBody.title == "trustPayment") {
        if (!validateBody.trustPaymentUrl || validateBody.trustPaymentUrl == "") {
            return { status: false, msg: "trustPaymentUrl" }
        }
        if (!validateBody.trustPaymentUserName || validateBody.trustPaymentUserName == "") {
            return { status: false, msg: "trustPaymentUserName" }
        }
        if (!validateBody.trustPaymentPassword || validateBody.trustPaymentPassword == "") {
            return { status: false, msg: "trustPaymentPassword" }
        }
        if (!validateBody.trustPaymentSiteReference || validateBody.trustPaymentSiteReference == "") {
            return { status: false, msg: "trustPaymentSiteReference" }
        }
        if (!validateBody.trustPaymentAlias || validateBody.trustPaymentAlias == "") {
            return { status: false, msg: "trustPaymentAlias" }
        }
        return { status: true, msg: "trustPayment" }

    }
    if (validateBody.title == "cloudinary") {
        if (!validateBody.cloud_name || validateBody.cloud_name == "") {
            return { status: false, msg: "cloud_name" }
        }
        if (!validateBody.api_key || validateBody.api_key == "") {
            return { status: false, msg: "api_key" }
        }
        if (!validateBody.api_secret || validateBody.api_secret == "") {
            return { status: false, msg: "api_secret" }
        }
        return { status: true, msg: "cloudinary" }
    }
}


const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomTime = () => {
  const hour = getRandomInt(0, 23).toString().padStart(2, '0');
  const minute = getRandomInt(0, 59).toString().padStart(2, '0');
  const second = getRandomInt(0, 59).toString().padStart(2, '0');
  return `${hour}:${minute}:${second}`;
};

const getRandomDateTimeStatus = (days = 60) => {
  const result = [];

  for (let i = 0; i < days; i++) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);

    const yyyy = dateObj.getFullYear();
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const dd = dateObj.getDate().toString().padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const totalEntries = getRandomInt(15, 20);
    const falseIndices = new Set();
    const falseCount = getRandomInt(2, 5);

    while (falseIndices.size < falseCount) {
      falseIndices.add(getRandomInt(0, totalEntries - 1));
    }

    for (let j = 0; j < totalEntries; j++) {
      const time = getRandomTime();
      result.push({
        date: `${date} ${time}`,
        status: falseIndices.has(j) ? false : true,
      });
    }
  }

  return result.reverse();
};

