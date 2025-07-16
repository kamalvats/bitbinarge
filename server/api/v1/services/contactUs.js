import contactUsModel from "../../../models/contactUs";
import status from '../../../enums/status';

const contactUsServices = {

    createContactUs: async (insertObj) => {
        return await contactUsModel.create(insertObj);
    },

    findContactUs: async (query) => {
        return await contactUsModel.findOne(query);
    },

    updateContactUs: async (query, updateObj) => {
        return await contactUsModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listContactUs: async (query) => {
        return await contactUsModel.find(query);
    },
    contactUsListPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const {page, limit, search } = validatedBody;
        if (search&&search!='') {
            query.question = { $regex: search, $options: 'i' } 
        }
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        };
        return await contactUsModel.paginate(query, options);
    },

}

module.exports = { contactUsServices };