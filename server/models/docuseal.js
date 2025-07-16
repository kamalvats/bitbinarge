import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
const options = {
    collection: "docuseal",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        id: { type: String },
        archived_at: { type: String },
        source: { type: String },
        submitters_order: { type: String },
        slug: { type: String },
        expire_at: { type: String },
        audit_log_url: { type: String },
        combined_document_url: { type: String },
        submitters: { type: Schema.Types.Mixed },
        template: { type: Schema.Types.Mixed },
        created_by_user: { type: String },
        submission_events: { type: Schema.Types.Mixed },
        documents: { type: Schema.Types.Mixed },
        docuseal_status: { type: String },
        completed_at: { type: String },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        status: { type: String, default: status.ACTIVE, enum: [status.ACTIVE, status.DELETE, status.BLOCK,status.REJECTED] }
    },
    options
);
schemaDefination.plugin(mongoosePaginate);
schemaDefination.plugin(mongooseAggregatePaginate);
module.exports = Mongoose.model("docuseal", schemaDefination);