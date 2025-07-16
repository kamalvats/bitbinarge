import couponHistoryModel from "../../../models/couponHistory";
import status from '../../../enums/status';

const couponHistoryServices = {

    createCouponHistory: async (insertObj) => {
        return await couponHistoryModel.create(insertObj);
    },

    findCouponHistory: async (query) => {
        return await couponHistoryModel.findOne(query);
    },

    updateCouponHistory: async (query, updateObj) => {
        return await couponHistoryModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listCouponHistory: async (query) => {
        return await couponHistoryModel.find(query);
    },
    couponHistoryManyUser: async (obj) => {
        return await couponHistoryModel.insertMany(obj);
    },
    multiCouponHistoryUpdate: async (query, updateObj) => {
        return await couponHistoryModel.updateMany(query, updateObj, { multi: true });
    },
    couponHistoryListPagination: async (validatedBody) => {
        const { page, limit, search, fromDate, toDate, couponType, couponId } = validatedBody;
        let query = { status: { $ne: status.DELETE }, couponId: couponId };
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
            populate: [{ path: "userId", select: "email firstName lastName userName mobileNumber" }, { path: "planId", select: "value recursiveValue type title description" }],
        };
        return await couponHistoryModel.paginate(query, options);
    },

}

module.exports = { couponHistoryServices };