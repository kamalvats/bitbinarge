import profitStatisticModel from "../../../models/profitStatistic";
const profitStatisticServices = {

    createprofitStatisticContent: async (insertObj) => {
        return await profitStatisticModel.create(insertObj);
    },

    findprofitStatisticContent: async (query) => {
        return await profitStatisticModel.findOne(query);
    },

    updateprofitStatisticContent: async (query, updateObj) => {
        return await profitStatisticModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    profitStatisticContentList: async () => {
        return await profitStatisticModel.find({});
    },

}
module.exports = { profitStatisticServices };
