import docusealModel from "../../../models/docuseal";
import status from '../../../enums/status';

const docusealServices = {

    createDocuseal: async (insertObj) => {
        return await docusealModel.create(insertObj);
    },

    findDocuseal: async (query) => {
        return await docusealModel.findOne(query).sort({createdAt:-1});
    },

    updateDocuseal: async (query, updateObj) => {
        return await docusealModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listDocuseal: async (query) => {
        return await docusealModel.find(query);
    },
    createUpdatDocuseal: async (query, updateObj) => {
        return await docusealModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },

}

module.exports = { docusealServices };