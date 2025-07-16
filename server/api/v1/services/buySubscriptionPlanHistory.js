
import buySubsciptionPlanModel from '../../../models/buySubscriptionPlanHistory';
import status from '../../../enums/status';

const buySubsciptionPlanHistoryServices = {
  buySubsciptionPlanCreate: async (insertObj) => {
    return await buySubsciptionPlanModel(insertObj).save();
  },
  buySubscriptionhPlanList: async (query) => {
    return await buySubsciptionPlanModel.find(query)
      .populate([
        { path: 'userId' },
        { path: 'subScriptionPlanId' }
      ]);
  },
  buySubscriptionhPlanListLimit: async (query) => {
    return await buySubsciptionPlanModel.find(query)
      .populate([
        { path: 'userId' },
        { path: 'subScriptionPlanId' }
      ]).sort({ createdAt: -1 }).limit(1);
  },

  buySubsciptionPlanData: async (query) => {
    return await buySubsciptionPlanModel.findOne(query).sort({ createdAt: -1 });
  },
  buySubsciptionPlanUpdate: async (query, updateObj) => {
    return await buySubsciptionPlanModel.findByIdAndUpdate(query, updateObj, { new: true });
  },
  buySubsciptionPlanCount: async (query) => {
    return await buySubsciptionPlanModel.countDocuments(query);
  },
  lastedBuyPlan: async (query) => {
    return await buySubsciptionPlanModel.findOne(query).sort({ createdAt: -1 }).populate('subScriptionPlanId');
  },
  buySubscriptionPlanList: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userId: validatedBody.userId };
    const { fromDate, toDate, page, limit, planStatus, paymentStatus } = validatedBody;
    if (planStatus) {
      query.planStatus = planStatus
    }
    if (paymentStatus) {
      query.payment_status = paymentStatus
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
      sort: { createdAt: -1 },
      populate: 'subScriptionPlanId'
    };
    return await buySubsciptionPlanModel.paginate(query, options);
  },

  buySubscriptionPlanListWithAggregate: async (body) => {
    const { search, page, limit, fromDate, toDate, planStatus, paymentStatus } = body;
    if (search) {
      var filter = search;
    }
    let data = filter || ""
    let searchData = [
      {
        $lookup: {
          from: "users",
          localField: 'userId',
          foreignField: '_id',
          as: "userId",
        }
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "subsciptionplans",
          localField: 'subScriptionPlanId',
          foreignField: '_id',
          as: "subScriptionPlanId",
        }
      },
      {
        $unwind: {
          path: "$subScriptionPlanId",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: { "status": status.ACTIVE },
      },
      {
        $match: { $or: [{ "userId.email": { $regex: data, $options: "i" } }, { "userId.firstName": { $regex: data, $options: "i" } }, { "userId.lastName": { $regex: data, $options: "i" } },{ "order_id": { $regex: data, $options: "i" } },{ "subScriptionPlanId.title": { $regex: data, $options: "i" } },{ "payment_id": { $regex: data, $options: "i" } },{ "userId.ibiId": { $regex: data, $options: "i" } }] },
      },
      { $sort: { createdAt: -1 } },
    ]
    if (planStatus) {
      searchData.push({
        $match: { "planStatus": planStatus }
      })
    }
    if (paymentStatus) {
      searchData.push({
        $match: { "payment_status": paymentStatus }
      })
    }
    if (fromDate && !toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z')] }

        }
      })
    }
    if (!fromDate && toDate) {
      searchData.push({
        "$match": {
          "$expr": { "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z')] }

        }
      })
    }
    if (fromDate && toDate) {
      searchData.push({
        "$match": {
          "$expr":
          {
            "$and": [{ "$lte": ["$createdAt", new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z')] },
            { "$gte": ["$createdAt", new Date(new Date(fromDate).toISOString().slice(0, 10))] }]
          }
        }
      })
    }

    let aggregate = buySubsciptionPlanModel.aggregate(searchData)
    let options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };
    return await buySubsciptionPlanModel.aggregatePaginate(aggregate, options)
  },
  updateManySubscription: async (query, updateObj) => {
    return await buySubsciptionPlanModel.updateMany(query, updateObj, { new: true });
  },

  updateOneSubscription: async (query, updateObj) => {
    return await buySubsciptionPlanModel.findOneAndUpdate(query, updateObj, { new: true });
  },

}
module.exports = { buySubsciptionPlanHistoryServices };