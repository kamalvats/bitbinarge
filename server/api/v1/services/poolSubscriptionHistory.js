import poolSubscriptionHistoryPlanModel from "../../../models/poolSubscriptionHistory";
import status from "../../../enums/status";
import mongoose from "mongoose";


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

  aggregateSearchtransactionPool: async (body) => {
          const { search, page, limit, fromDate, toDate, status,subscriptionPlanId,walletType,userId } = body;
          if (search) {
              var filter = search.trim();
          }
          let data = filter || ""
          let searchData = [
              {
                  $lookup: {
                      from: "users",
                      localField: 'userId',
                      foreignField: '_id',
                      as: "userDetails",
                  }
              },
              {
                  $lookup: {
                      from: "poolingsubscriptionplans",
                      localField: 'subscriptionPlanId',
                      foreignField: '_id',
                      as: "subscriptionPlanId",
                  }
              },
              {
                  $unwind: {
                      path: "$userDetails",
                      preserveNullAndEmptyArrays: true
                  }
              },
              {
                  $unwind: {
                      path: "$subscriptionPlanId",
                      preserveNullAndEmptyArrays: true
                  }
              },
  
              { $sort: { createdAt: -1 } }
          ]
          if(walletType){
              searchData.push({
                  $match: { "walletType": walletType }
              })
          }
          if(userId){
              searchData.push({
                  $match: { "userDetails._id": mongoose.Types.ObjectId(userId) } 
              })
          }
          if(subscriptionPlanId){
              searchData.push({
                  $match: { "subscriptionPlanId._id": mongoose.Types.ObjectId(subscriptionPlanId) } 
              })
          }

          if (status) {
              searchData.push({
                  $match: {
                      $or: [
                          { "status": status },
                         
                      ]
                  }
              })
          }
  
          if (fromDate && !toDate) {
              searchData.push({
                  "$match": {
                      "$expr": { "$gte": ["$createdAt", new Date(fromDate)] }
                  }
              })
          }
          if (!fromDate && toDate) {
              searchData.push({
                  "$match": {
                      "$expr": { "$lte": ["$createdAt", new Date(toDate)] }
                  }
              })
          }
          if (fromDate && toDate) {
              searchData.push({
                  "$match": {
                      "$expr": { "$and": [{ "$lte": ["$createdAt", new Date(toDate)] }, { "$gte": ["$createdAt", new Date(fromDate)] }] }
                  }
              })
          }
          let aggregate = poolSubscriptionHistoryPlanModel.aggregate(searchData)
          let options = {
              page: parseInt(page, 10) || 1,
              limit: parseInt(limit, 10) || 10,
              sort: { createdAt: -1 },
          };
          return await poolSubscriptionHistoryPlanModel.aggregatePaginate(aggregate, options)
      },
}

module.exports = { poolSubscriptionHistoryPlanServices };