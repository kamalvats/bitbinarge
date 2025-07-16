import videoModel from "../../../models/video";
import status from '../../../enums/status';

const videoServices = {

    createVideo: async (insertObj) => {
        return await videoModel.create(insertObj);
    },

    findVideo: async (query) => {
        return await videoModel.findOne(query);
    },

    updateVideo: async (query, updateObj) => {
        return await videoModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    listVideo: async (query) => {
        return await videoModel.find(query);
    },
    videoListPagination: async (validatedBody) => {
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
        return await videoModel.paginate(query, options);
    },

}

module.exports = { videoServices };