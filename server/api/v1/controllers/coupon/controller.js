import Joi from "joi";
import Mongoose from "mongoose";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import status from '../../../../enums/status';
import userType from "../../../../enums/userType";
import { userServices } from "../../services/user"
const { findUser, updateUser, updateUserById, createUser, paginateSearch, findAllUser } = userServices
import { couponServices } from "../../services/coupon"
const { createCoupon, findCoupon, updateCoupon, listCoupon, couponListPagination, couponManyUser, multiCouponUpdate } = couponServices
import { subscriptionPlanServices } from "../../services/subscriptionPlan"
const { subscriptionPlanList } = subscriptionPlanServices
import { couponHistoryServices } from "../../services/couponHistory"
const { listCouponHistory, findCouponHistory, couponHistoryManyUser, multiCouponHistoryUpdate, updateCouponHistory, couponHistoryListPagination } = couponHistoryServices
import commonFunction from '../../../../helper/util';
import couponType from "../../../../enums/couponType";
import { notificationServices } from '../../services/notification';
const { notificationCreate, notificationData, notificationUpdate } = notificationServices;

export class couponController {

    /**
     * @swagger
     * /coupon/addCoupon:
     *   post:
     *     tags:
     *       - Coupon Management
     *     description: Add Coupon
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: addCoupon
     *         description: addCoupon (find the coupontype (UNIQUE_COUPON,BULK_COUPONS,EXCLUSIVE_COUPONS) )  
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addCoupon'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async addCoupon(req, res, next) {
        const validationSchema = {
            description: Joi.string().required(),
            title: Joi.string().required(),
            price: Joi.number().required(),
            background_color: Joi.string().required(),
            couponType: Joi.string().required(),
            inviteUser: Joi.array().optional(),
            planId: Joi.array().required(),
            quantity: Joi.number().optional(),
            couponQuantity: Joi.number().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let checkTitle = await findCoupon({ title: validatedBody.title, status: { $ne: status.DELETE } })
            if (checkTitle) {
                throw apiError.conflict(responseMessage.COUPON_ALREADY_EXITS);
            }
            let userEmail = [], planName = []
            if (validatedBody.couponType == couponType.EXCLUSIVE_COUPONS) {
                if (validatedBody.inviteUser.length == 0) {
                    throw apiError.badRequest(responseMessage.AT_LEAST_ONE_USER);
                }
                const users = await findAllUser({ _id: { $in: validatedBody.inviteUser }, status: { $ne: status.DELETE } });
                const foundUserIds = users.map(user => (user._id).toString());
                userEmail = users.map(user => (user.email));
                const missingUserIds = validatedBody.inviteUser.filter(id => !foundUserIds.includes(id));
                if (missingUserIds.length != 0) {
                    throw apiError.badRequest(responseMessage.ALL_INVALID(missingUserIds + " userId"));
                }
                validatedBody = JSON.parse(JSON.stringify(validatedBody))
                validatedBody.quantity = validatedBody.inviteUser.length
            }
            if (validatedBody.couponType == couponType.BULK_COUPONS) {
                if (!validatedBody.quantity || validatedBody.quantity <= 0) {
                    throw apiError.badRequest(responseMessage.ENTER_QUANTITY);
                }
            }
            if (validatedBody.couponType == couponType.UNIQUE_COUPON) {
                if (!validatedBody.couponQuantity || validatedBody.couponQuantity <= 0) {
                    throw apiError.badRequest(responseMessage.ENTER_COUPO_QUANTITY);
                }
                validatedBody = JSON.parse(JSON.stringify(validatedBody))
                validatedBody.quantity = validatedBody.couponQuantity
            }
            if (validatedBody.planId.length == 0) {
                throw apiError.badRequest(responseMessage.AT_LEAST_ONE_PLAN);
            }
            const subscriptionRes = await subscriptionPlanList({ _id: { $in: validatedBody.planId }, status: { $ne: status.DELETE } });
            const foundSubscriptionIds = subscriptionRes.map(sub => (sub._id).toString());
            planName = subscriptionRes.map(sub => (sub.title));
            const missingSubscriptionIds = validatedBody.planId.filter(id => !foundSubscriptionIds.includes(id));
            if (missingSubscriptionIds.length != 0) {
                throw apiError.badRequest(responseMessage.ALL_INVALID(missingSubscriptionIds + " planId"));
            }

            validatedBody.userId = adminResult._id
            let result = await createCoupon(validatedBody)
            if (result) {
                let createCouponarray = []
                let obj = {
                    title: validatedBody.title,
                    description: validatedBody.description,
                    background_color: validatedBody.background_color,
                    price: validatedBody.price,
                    couponId: result._id,
                    couponType: validatedBody.couponType,
                    couponCode: ''
                }
                if (validatedBody.couponType == couponType.BULK_COUPONS) {
                    let couponCodeGenerate = await commonFunction.generateCode()
                    obj.couponCode = couponCodeGenerate
                    for (let i = 0; i < validatedBody.quantity; i++) {
                        createCouponarray.push(obj)
                    }
                } else if (validatedBody.couponType == couponType.UNIQUE_COUPON) {
                    for (let i = 0; i < validatedBody.couponQuantity; i++) {
                        let couponCodeGenerate = await commonFunction.generateCode()
                        obj = JSON.parse(JSON.stringify(obj))
                        obj.couponCode = couponCodeGenerate
                        createCouponarray.push(obj)
                    }
                } else if (validatedBody.couponType == couponType.EXCLUSIVE_COUPONS) {
                    let couponCodeGenerate = await commonFunction.generateCode()
                    obj.couponCode = couponCodeGenerate
                    for (let i = 0; i < validatedBody.inviteUser.length; i++) {
                        createCouponarray.push(obj)
                        await commonFunction.exclusiveUsersendemail(userEmail[i], planName, couponCodeGenerate, validatedBody.price)
                        let notificationObj = {
                            userId: validatedBody.inviteUser[i],
                            title: `Coupon Alert: Special Offer for these plans: "${planName.join(", ")}"`,
                            body: `Great News! You've received a coupon to purchase the following plans: " ${planName.join(", ")}" at a discounted price of $${validatedBody.price}. Use your coupon code to enjoy savings on these plans!`
                        }
                        let notification = await notificationCreate(notificationObj);
                        console.log("423478278238572387482", notification)
                    }
                } else {
                    throw apiError.badRequest(responseMessage.INVALID_COUPON);
                }
                let createCouopnHistory = await couponHistoryManyUser(createCouponarray)
            }
            return res.json(new response([], responseMessage.ADD_COUPON));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/updateCoupon:
     *   put:
     *     tags:
     *       - Coupon Management
     *     description: Add Coupon
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: updateCoupon
     *         description: updateCoupon
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/updateCoupon'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async updateCoupon(req, res, next) {
        const validationSchema = {
            couponId: Joi.string().required(),
            description: Joi.string().optional(),
            title: Joi.string().optional(),
            price: Joi.number().optional(),
            background_color: Joi.string().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let checkCoupon = await findCoupon({ _id: validatedBody.couponId, status: { $ne: status.DELETE } })
            if (!checkCoupon) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            let checkTitle = await findCoupon({ title: validatedBody.title, _id: { $ne: checkCoupon._id }, status: { $ne: status.DELETE } })
            if (checkTitle) {
                throw apiError.conflict(responseMessage.COUPON_ALREADY_EXITS);
            }
            let updateCouponRes = await updateCoupon({ _id: checkCoupon._id }, validatedBody)
            let resultres = await multiCouponHistoryUpdate({ couponId: checkCoupon._id }, validatedBody)

            return res.json(new response([], responseMessage.COUPON_UPDATED));
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /coupon/getCouponList:
     *   get:
     *     tags:
     *       - Coupon Management
     *     description: for admin
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
     *       - name: couponType
     *         description: couponType
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
    async getCouponList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            couponType: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let couponData = await couponListPagination(validatedBody)
            if (couponData.docs.length == 0) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            for (let i = 0; i < couponData.docs.length; i++) {
                couponData.docs[i]._doc.isAllUse = false
                let [checkHistory, checkHistoryAll] = await Promise.all([
                    listCouponHistory({ couponId: couponData.docs[i]._id, userId: { "$exists": true }, isUse: true, status: { $ne: status.DELETE } }),
                    listCouponHistory({ couponId: couponData.docs[i]._id, status: { $ne: status.DELETE } })
                ])
                let remainingQuantity = Number(checkHistoryAll.length) - Number(checkHistory.length)
                couponData.docs[i]._doc.remainingQuantity = remainingQuantity
                couponData.docs[i]._doc.totalQuantity = checkHistoryAll.length
                if (remainingQuantity <= 0) {
                    couponData.docs[i]._doc.isAllUse = true
                }

            }
            return res.json(new response(couponData, responseMessage.COUPON_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/getCoupon:
     *   get:
     *     tags:
     *       - Coupon Management
     *     description: without token (use all user and admin)
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: couponId
     *         description: couponId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getCoupon(req, res, next) {
        const validationSchema = {
            couponId: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let couponData = await findCoupon({ _id: validatedBody.couponId, status: { $ne: status.DELETE } })
            if (!couponData) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            return res.json(new response(couponData, responseMessage.COUPON_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/enableDisableCoupon:
     *   put:
     *     tags:
     *       - Coupon Management
     *     description: without token (use all user and admin)
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: couponId
     *         description: couponId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async enableDisableCoupon(req, res, next) {
        const validationSchema = {
            couponId: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let couponData = await findCoupon({ _id: validatedBody.couponId, status: { $ne: status.DELETE } })
            if (!couponData) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            if (couponData.status == status.ACTIVE) {
                let result = await updateCoupon({ _id: couponData._id }, { status: status.BLOCK })
                let resultres = await multiCouponHistoryUpdate({ couponId: couponData._id, isUse: false, userId: { "$exists": false } }, { status: status.BLOCK })
                return res.json(new response(result, responseMessage.COUPON_INACTIVE));
            } else {
                let result = await updateCoupon({ _id: couponData._id }, { status: status.ACTIVE })
                let resultres = await multiCouponHistoryUpdate({ couponId: couponData._id, isUse: false, userId: { "$exists": false } }, { status: status.ACTIVE })
                return res.json(new response(result, responseMessage.COUPON_ACTIVE));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/getCouponHistory:
     *   get:
     *     tags:
     *       - Coupon Management
     *     description: without token (use all user and admin)
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: couponHistoryId
     *         description: couponHistoryId
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async getCouponHistory(req, res, next) {
        const validationSchema = {
            couponHistoryId: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let couponData = await findCouponHistory({ _id: validatedBody.couponHistoryId, status: { $ne: status.DELETE } })
            if (!couponData) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            return res.json(new response(couponData, responseMessage.COUPON_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/getCouponHistoryList:
     *   get:
     *     tags:
     *       - Coupon Management
     *     description: for admin
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: couponId
     *         description: couponId
     *         in: query
     *         required: true
     *       - name: search
     *         description: search
     *         in: query
     *         required: false
     *       - name: couponType
     *         description: couponType
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
    async getCouponHistoryList(req, res, next) {
        const validationSchema = {
            couponId: Joi.string().required(),
            search: Joi.string().optional(),
            couponType: Joi.string().optional(),
            fromDate: Joi.string().optional(),
            toDate: Joi.string().optional(),
            page: Joi.number().optional(),
            limit: Joi.string().optional()
        };
        try {
            let validatedBody = await Joi.validate(req.query, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN, userType.USER] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let couponData = await couponHistoryListPagination(validatedBody)
            if (couponData.docs.length == 0) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            return res.json(new response(couponData, responseMessage.COUPON_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /coupon/enableDisableCouponHistory:
     *   put:
     *     tags:
     *       - Coupon Management
     *     description: without token (use all user and admin)
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: couponHistoryId
     *         description: couponHistoryId
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async enableDisableCouponHistory(req, res, next) {
        const validationSchema = {
            couponHistoryId: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            let adminResult = await findUser({ _id: req.userId, status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!adminResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            let couponData = await findCouponHistory({ _id: validatedBody.couponHistoryId, userId: { "$exists": true }, isUse: true, status: { $ne: status.DELETE } })
            if (!couponData) {
                throw apiError.notFound(responseMessage.COUPON_NOT_FOUND);
            }
            if (couponData.status == status.ACTIVE) {
                let resultres = await updateCouponHistory({ _id: couponData._id }, { status: status.BLOCK })
                return res.json(new response(result, responseMessage.COUPON_INACTIVE));
            } else {
                let resultres = await updateCouponHistory({ _id: couponData._id }, { status: status.ACTIVE })
                return res.json(new response(result, responseMessage.COUPON_ACTIVE));
            }
        } catch (error) {
            return next(error);
        }
    }

}
export default new couponController()