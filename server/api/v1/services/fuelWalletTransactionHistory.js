
import fuelWalletTransactionHistoryModel from "../../../models/fuelWalletTransactionHistory";
import status from "../../../enums/status";


const fuelWalletTransactionHistoryServices = {

    createFuelWalletTransactionHistory: async (query) => {
        return await fuelWalletTransactionHistoryModel.create(query);
    },

    findFuelWalletTransactionHistory: async (query) => {
        return await fuelWalletTransactionHistoryModel.findOne(query);
    },

    updateFuelWalletTransactionHistory: async (query, updateObj) => {
        return await fuelWalletTransactionHistoryModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    fuelWalletTransactionHistoryList: async () => {
        return await fuelWalletTransactionHistoryModel.find({});
    },
    paginateSearchFuelWalletHistory: async (validatedBody) => {
        let query = { userId: validatedBody.userId };
        const { search, fromDate, toDate, page, limit } = validatedBody;
        if (search) {
            query.$or = [
                { coinName: { $regex: search, $options: 'i' } },
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
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 15,
            sort: { createdAt: -1 }
        };
        return await fuelWalletTransactionHistoryModel.paginate(query, options);
    },
}

module.exports = { fuelWalletTransactionHistoryServices };