import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

const options = {
    collection: "video",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        link: {
            type: String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        isaddVideo: {
            type: Boolean,
            default: false
        },
        bannerImage: {
            type: String,
        },
        videoUrl: {
            type: String,
        },
        status: {
            type: String, default: status.ACTIVE
        }
    },
    options
);
schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("video", schemaDefination);