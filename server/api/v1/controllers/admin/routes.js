import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .use('/nowPaymentCallBack', controller.nowPaymentCallBack)
    .post('/login', controller.login)
    .put('/resendOTP', controller.resendOTP)
    .put('/forgotPassword', controller.forgotPassword)
    .post('/verifyOTP', controller.verifyOTP)
    .get('/subscriptionPlanList', controller.subscriptionPlanList)
    .get('/viewSubscription', controller.viewSubscription)
    .get('/viewSubscriptionHistory', controller.viewSubscriptionHistory)
    .get('/verifyGoogleAuthenctionCode', controller.verifyGoogleAuthenctionCode)
    .get('/verifyGoogleAuthenctionCodeForEnableDisable', controller.verifyGoogleAuthenctionCodeForEnableDisable)
    .get('/getIpAddressCheck', controller.getIpAddressCheck)
    .get('/getTrustPaymentKeysStatus', controller.getTrustPaymentKeysStatus)
    .use(auth.verifyToken)
    .post('/resetPassword', controller.resetPassword)
    .get('/getProfile', controller.getProfile)
    .patch('/changePassword', controller.changePassword)
    .put('/blockUnblockInvitedUser', controller.blockUnblockInvitedUser)
    .put('/blockUnblockSubscriptionPlan', controller.blockUnblockSubscriptionPlan)
    .post('/updateCapitalAmount', controller.updateCapitalAmount)
    .get('/getCapitalAmount', controller.getCapitalAmount)
    .put('/deleteSubscriptionPlan', controller.deleteSubscriptionPlan)
    .get('/enableDisableGoogleAuthenction', controller.enableDisableGoogleAuthenction)
    .get('/listForUserBuySubcription', controller.listForUserBuySubcription)
    .put('/enableDisableSubscriptionPlan', controller.enableDisableSubscriptionPlan)
    .get('/allListForUserBuySubcription', controller.allListForUserBuySubcription)
    .post('/addSubscription', controller.addSubscription)
    .put('/editSubscription', controller.editSubscription)
    .get('/subscriptionPlanListWithFilterV1', controller.subscriptionPlanListWithFilterV1)
    .get('/disableUserGoogleAuthByAdmin', controller.disableUserGoogleAuthByAdmin)
    .get('/getUserProfile', controller.getUserProfile)
    .get('/updateIpAddressCheck', controller.updateIpAddressCheck)
    .get('/getUserDocusealData', controller.getUserDocusealData)
    .post('/assignSubscription', controller.assignSubscription)
    .get('/listCredentials', controller.listCredentials)
    .put('/updateCredentials', controller.updateCredentials)
    .put('/updateTrustPaymentKeys', controller.updateTrustPaymentKeys)
    .get('/getTrustPaymentKeys', controller.getTrustPaymentKeys)
    .put('/refundPayment', controller.refundPayment)
    .put('/rejectDocuSeal', controller.rejectDocuSeal)
    .get('/specificSubscriptionPlanList', controller.specificSubscriptionPlanList)
    .get('/subscriptionPlanListWithFilter', controller.subscriptionPlanListWithFilter)
    .get('/getAllUser', controller.getAllUser)
    .get('/getUserList', controller.getUserList)
    .put("/manageRecurring",controller.manageRecurring)
    .get('/requestWithdrawAccount', controller.requestWithdrawAccount)
    .put('/approveRejectRequest', controller.approveRejectRequest)
    .get("/planListPooling",controller.planListPooling)
    .get("/viewplanPooling",controller.viewplanPooling)
    .post("/transactionAdditionScript",controller.transactionAdditionScript)
    .get("/transactionHistoryPerPlan",controller.transactionHistoryPerPlan)
    .use(upload.uploadFile)
    .post("/addSubscriptionPooling",controller.addSubscriptionPooling)
    .put("/editSubscriptionPooling",controller.editSubscriptionPooling)
    .put('/editProfile', controller.editProfile)








