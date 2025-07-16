import subscriptionPlanModel from "../../../models/subscriptionPlan";
import status from "../../../enums/status";
import subscriptionPlanType from "../../../enums/subscriptionPlanType"


const subscriptionPlanServices = {

  createSubscriptionPlan: async (insertObj) => {
    return await subscriptionPlanModel.create(insertObj);
  },

  findSubscriptionPlan: async (query) => {
    return await subscriptionPlanModel.findOne(query);
  },

  updateSubscriptionPlan: async (query, updateObj) => {
    return await subscriptionPlanModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  subscriptionPlanList: async (query) => {
    return await subscriptionPlanModel.find(query);
  },

  paginateSearchSubscription: async (validatedBody) => {
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
    return await subscriptionPlanModel.paginate(query, options);
  },

  paginateSearchSubscriptionv1: async (validatedBody) => {
    let query = { status:status.ACTIVE,planStatus: "ACTIVE", show: true, subscriptionType: subscriptionPlanType.PAID};
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
    return await subscriptionPlanModel.paginate(query, options);
  },
  updateManySubscriptionPlan: async (query, updateObj) => {
    return await subscriptionPlanModel.updateMany(query, updateObj, { new: true });
  },

}

module.exports = { subscriptionPlanServices };