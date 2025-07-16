import couponModel from "../../../models/coupon";
import status from '../../../enums/status';

const couponServices = {

    createCoupon: async (insertObj) => {
        return await couponModel.create(insertObj);
    },

    findCoupon: async (query) => {
        return await couponModel.findOne(query);
    },

    updateCoupon: async (query, updateObj) => {
        return await couponModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listCoupon: async (query) => {
        return await couponModel.find(query);
    },
    couponListPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { page, limit, search, fromDate, toDate, couponType } = validatedBody;
        if (search && search != '') {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
            ]
        }
        if (couponType) {
            query.couponType = couponType;
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: fromDate };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: toDate };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: fromDate } },
                { createdAt: { $lte: toDate } },
            ]
        }
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 },
            populate: [{ path: "inviteUser", select: "email firstName lastName userName mobileNumber", model: 'user' }, { path: "planId", select: "value recursiveValue type title description", model: 'subsciptionPlan' }],
        };
        return await couponModel.paginate(query, options);
    },
    couponManyUser: async (obj) => {
        return await couponModel.insertMany(obj);
    },
    multiCouponUpdate: async (query, updateObj) => {
        return await couponModel.updateMany(query, updateObj, { multi: true });
    },

}

module.exports = { couponServices };