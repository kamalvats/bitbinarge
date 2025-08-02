import transactionModel from "../../../models/transaction";
import status from "../../../enums/status";
import mongoose from "mongoose";


const transactionServices = {

    createTransaction: async (insertObj) => {
        return await transactionModel.create(insertObj);
    },

    findTransaction: async (query) => {
        return await transactionModel.findOne(query);
    },

    updateTransaction: async (query, updateObj) => {
        return await transactionModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    transactionList: async (query) => {
        return await transactionModel.find(query);
    },

    transactionPaginateSearch: async (validatedBody) => {
        const { fromDate, toDate, page, limit, transactionType, userId } = validatedBody;
        let query = { status: { $ne: status.DELETE }, userId: userId };
        if (transactionType) {
            query.transactionType = transactionType
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) };

        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') };

        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: new Date(new Date(fromDate).toISOString().slice(0, 10)) } },
                { createdAt: { $lte: new Date(new Date(toDate).toISOString().slice(0, 10) + 'T23:59:59.999Z') } },
            ]
        }
        let options = {
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 },
            populate: ('userId')
        };
        return await transactionModel.paginate(query, options);
    },

    aggregateSearchtransaction: async (body) => {
        const { search, page, limit, fromDate, toDate, transactionStatus,transactionType,userId,arbitrageName,planId,walletType,transactionSubType,from,to } = body;
        console.log("*********************************************",arbitrageName)
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
        if (transactionType) {
            searchData.push({
                $match: { "transactionType": transactionType }
            })
        }
        if(transactionSubType){
            searchData.push({
                $match: { "transactionSubType": transactionSubType }
            })
        }
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
        if(planId){
            searchData.push({
                $match: { "subscriptionPlanId._id": mongoose.Types.ObjectId(planId) } 
            })
        }
        if(arbitrageName){
             searchData.push({
                $match: { "profitPath.arbitrageName":arbitrageName} 
            })
        }
        if (transactionStatus) {
            searchData.push({
                $match: {
                    $or: [
                        { "transactionStatus": transactionStatus },
                       {"transactionName":transactionStatus} 
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
        if (from && to) {
            searchData.push({
                "$match": {
                    "$expr": { "$and": [{ "$lte": ["$date", new Date(to)] }, { "$gte": ["$date", new Date(from)] }] }
                }
            })
        }
        let aggregate = transactionModel.aggregate(searchData)
        let options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
            sort: { createdAt: -1 },
        };
        return await transactionModel.aggregatePaginate(aggregate, options)
    },
    countTransactionData: async (query) => {
        return await transactionModel.countDocuments(query);
    }

}

module.exports = { transactionServices };