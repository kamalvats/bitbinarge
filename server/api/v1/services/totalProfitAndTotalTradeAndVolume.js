import totalProfitAndTotalTradeAndVolumeModel from "../../../models/totalProfitAndTotalTradeAndVolume";
const totalProfitAndTotalTradeAndVolumeServices = {

    createTotalProfitAndTotalTradeAndVolumeContent: async (insertObj) => {
        return await totalProfitAndTotalTradeAndVolumeModel.create(insertObj);
    },

    findTotalProfitAndTotalTradeAndVolumeContent: async (query) => {
        return await totalProfitAndTotalTradeAndVolumeModel.findOne(query);
    },

    updateTotalProfitAndTotalTradeAndVolumeContent: async (query, updateObj) => {
        return await totalProfitAndTotalTradeAndVolumeModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    totalProfitAndTotalTradeAndVolumeContentList: async () => {
        return await totalProfitAndTotalTradeAndVolumeModel.find({});
    },

}

module.exports = { totalProfitAndTotalTradeAndVolumeServices };
