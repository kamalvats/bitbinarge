import poolSubscriptionHistoryPlanModel from "../../../models/poolSubscriptionHistory";
import status from "../../../enums/status";


const poolSubscriptionHistoryPlanServices = {

  createPoolSubscriptionHistoryPlan: async (insertObj) => {
    return await poolSubscriptionHistoryPlanModel.create(insertObj);
  },

  findPoolSubscriptionHistoryPlan: async (query) => {
    return await poolSubscriptionHistoryPlanModel.findOne(query).populate("subscriptionPlanId")
  },

  updatePoolSubscriptionHistoryPlan: async (query, updateObj) => {
    return await poolSubscriptionHistoryPlanModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  poolSubscriptionHistoryPlanList: async (query) => {
    return await poolSubscriptionHistoryPlanModel.find(query).populate("subscriptionPlanId")
  },

  paginateSearchPoolSubscriptionHistoryPlan: async (validatedBody) => {
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
    return await poolSubscriptionHistoryPlanModel.paginate(query, options);
  },

  paginateSearchPoolSubscriptionHistoryPlan: async (validatedBody) => {
    let query = { status:status.ACTIVE,planStatus: "ACTIVE", show: true, subscriptionType: poolSubscriptionHistoryPlanType.PAID};
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
    return await poolSubscriptionHistoryPlanModel.paginate(query, options);
  },
  updateManyPoolSubscriptionHistoryPlan: async (query, updateObj) => {
    return await poolSubscriptionHistoryPlanModel.updateMany(query, updateObj, { new: true });
  },

}

module.exports = { poolSubscriptionHistoryPlanServices };