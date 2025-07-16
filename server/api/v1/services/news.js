import newsModel from "../../../models/news";
import status from '../../../enums/status';

const newsServices = {

    createNews: async (insertObj) => {
        return await newsModel.create(insertObj);
    },

    findNews: async (query) => {
        return await newsModel.findOne(query);
    },

    updateNews: async (query, updateObj) => {
        return await newsModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listNews: async (query) => {
        return await newsModel.find(query);
    },
    newsListPagination: async (validatedBody) => {
        let query = { status: { $ne: status.DELETE } };
        const { page, limit, search } = validatedBody;
        if (search && search != '') {
            query.title = { $regex: search, $options: 'i' }
        }
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 }
        };
        return await newsModel.paginate(query, options);
    },

}

module.exports = { newsServices };