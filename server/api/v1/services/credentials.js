import credentialModel from "../../../models/credentials";
import status from '../../../enums/status';

const credentialServices = {

    createCredentials: async (insertObj) => {
        return await credentialModel.create(insertObj);
    },

    findCredentials: async (query) => {
        return await credentialModel.findOne(query);
    },

    updateCredentials: async (query, updateObj) => {
        return await credentialModel.findOneAndUpdate(query, updateObj, { new: true, upsert: true });
    },

    listCredentials: async (query) => {
        return await credentialModel.find(query);
    },
    credentialsListPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const {page, limit, search } = validatedBody;
        if (search&&search!='') {
            query.title = { $regex: search, $options: 'i' } 
        }
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        };
        return await credentialModel.paginate(query, options);
    },

}

module.exports = { credentialServices };