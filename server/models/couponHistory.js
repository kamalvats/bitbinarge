import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status'
import couponType from '../enums/couponType';
const couponHistory = new schema({

    title: {
        type: String
    },
    description: {
        type: String
    },
    background_color: {
        type: String
    },
    price: { type: Number, },
    couponCode: {
        type: String
    },
    couponId: {
        type: schema.Types.ObjectId,
        ref: 'coupon',
    },
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user',
    },
    isUse: { type: Boolean, default: false },
    couponType: { type: String, enum: [couponType.UNIQUE_COUPON, couponType.BULK_COUPONS, couponType.EXCLUSIVE_COUPONS] },
    planId: {
        type: schema.Types.ObjectId,
        ref: 'subsciptionPlan',
    },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    }
}, { timestamps: true })

couponHistory.plugin(mongoosePaginate);
couponHistory.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("couponHistory", couponHistory);