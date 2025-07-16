import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";


export default Express.Router()


    .get('/getCoupon', controller.getCoupon)
    .get('/getCouponHistory', controller.getCouponHistory)
    .use(auth.verifyToken)
    .post('/addCoupon', controller.addCoupon)
    .put('/updateCoupon', controller.updateCoupon)
    .get('/getCouponList', controller.getCouponList)
    .put('/enableDisableCoupon', controller.enableDisableCoupon)
    .get('/getCouponHistoryList', controller.getCouponHistoryList)
    .put('/enableDisableCouponHistory', controller.enableDisableCouponHistory)
    // .get('/getCouponListForUser', controller.getCouponListForUser)
