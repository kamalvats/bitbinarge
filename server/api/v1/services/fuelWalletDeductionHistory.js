
import fuelWalletDeductionHistoryModel from "../../../models/fuelWalletDeductionHistory";


const fuelWalletDeductionHistoryServices = {

    createFuelWalletDeductionHistory: async (query) => {
        return await fuelWalletDeductionHistoryModel.create(query);
    },

    findFuelWalletDeductionHistory: async (query) => {
        return await fuelWalletDeductionHistoryModel.findOne(query);
    },

    updateFuelWalletDeductionHistory: async (query, updateObj) => {
        return await fuelWalletDeductionHistoryModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    fuelWalletDeductionHistoryList: async (query) => {
        return await fuelWalletDeductionHistoryModel.find(query);
    },
    paginateSearchFuelWalletDeductionHistory: async (validatedBody) => {
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
        return await fuelWalletDeductionHistoryModel.paginate(query, options);
    },
    fuelWalletDeductionHistoryUpdate: async (query, updateObj) => {
        return await fuelWalletDeductionHistoryModel.updateMany(query, updateObj, { multi: true });
    },
}

module.exports = { fuelWalletDeductionHistoryServices };