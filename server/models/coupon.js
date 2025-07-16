import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status'
import couponType from '../enums/couponType';
const coupon = new schema({

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
    userId: {
        type: schema.Types.ObjectId,
        ref: 'user',
    },
    planId: { type: Array },
    couponType: { type: String, enum: [couponType.UNIQUE_COUPON, couponType.BULK_COUPONS, couponType.EXCLUSIVE_COUPONS] },
    quantity: { type: Number },
    inviteUser: { type: Array },
    status: {
        type: String,
        enum: [status.ACTIVE, status.BLOCK, status.DELETE],
        default: status.ACTIVE
    }
}, { timestamps: true })

coupon.plugin(mongoosePaginate);
coupon.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("coupon", coupon);