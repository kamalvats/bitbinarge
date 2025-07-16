
import keysModel from "../../../models/keys";


const keysServices = {

    createKeys: async (insertObj) => {
        return await keysModel.create(insertObj);
    },

    findKeys: async (query) => {
        return await keysModel.findOne(query);
    },

    updateKeys: async (query, updateObj) => {
        return await keysModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    keysList: async () => {
        return await keysModel.find({});
    },

}

module.exports = { keysServices };