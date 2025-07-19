import poolingSubscriptionPlanModel from "../../../models/poolingSubscriptionPlan";
import status from "../../../enums/status";


const poolingSubscriptionPlanServices = {

  createPoolingSubscriptionPlan: async (insertObj) => {
    return await poolingSubscriptionPlanModel.create(insertObj);
  },

  findPoolingSubscriptionPlan: async (query) => {
    return await poolingSubscriptionPlanModel.findOne(query);
  },

  updatePoolingSubscriptionPlan: async (query, updateObj) => {
    return await poolingSubscriptionPlanModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  poolingSubscriptionPlanList: async (query) => {
    return await poolingSubscriptionPlanModel.find(query);
  },

  paginateSearchPoolingSubscriptionPlan: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE } };
    const { search, fromDate, toDate, page, limit,subscriptionType } = validatedBody;
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { validity: { $regex: search, $options: 'i' } }
      ]
    }
    if(subscriptionType){
      query.subscriptionType=subscriptionType
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
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await poolingSubscriptionPlanModel.paginate(query, options);
  },

  paginateSearchPoolingSubscriptionPlan: async (validatedBody) => {
    let query = { };
    const { search, fromDate, toDate, page, limit,show, subscriptionType} = validatedBody;
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { validity: { $regex: search, $options: 'i' } }
      ]
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

    if (show) {
      query.show = show;
    }
    if (subscriptionType) {
      query.subscriptionType = subscriptionType
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await poolingSubscriptionPlanModel.paginate(query, options);
  },
  updateManyPoolingSubscriptionPlan: async (query, updateObj) => {
    return await poolingSubscriptionPlanModel.updateMany(query, updateObj, { new: true });
  },

}

module.exports = { poolingSubscriptionPlanServices };