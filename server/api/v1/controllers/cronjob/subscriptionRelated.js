const CronJob = require('cron').CronJob;
import axios from 'axios';
import { buySubsciptionPlanHistoryServices } from '../../services/buySubscriptionPlanHistory'
const { buySubscriptionhPlanList, buySubsciptionPlanUpdate, lastedBuyPlan, buySubsciptionPlanData, buySubsciptionPlanCreate, buySubsciptionPlanCount } = buySubsciptionPlanHistoryServices
import config from "config";
import status from '../../../../enums/status';
import { subscriptionPlanServices } from '../../services/subscriptionPlan'
const { subscriptionPlanList, updateSubscriptionPlan, findSubscriptionPlan } = subscriptionPlanServices
import { userServices } from '../../services/user'
const { updateUserById, findUser, updateUser, findAllUser } = userServices
import commonFunction from '../../../../helper/util';
import paymentType from '../../../../enums/paymentType';
import userType from '../../../../enums/userType';
import { keysServices } from "../../services/keys"
const { createKeys, findKeys, updateKeys, keysList } = keysServices

var checkPaymentStatus = new CronJob('*/1 * * * * *', async function () {
    try {
        let pendingRes = await buySubscriptionhPlanList({ payment_status: { $nin: ['finished', 'failed', 'refunded', 'expired'] }, })
        if (pendingRes.length == 0) {
            checkPaymentStatus.start();
        } else {
            checkPaymentStatus.stop();
        }
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.get('nowPaymentApiKey')
        };
        if (pendingRes.length != 0) {
            for (let i = 0; i < pendingRes.length; i++) {
                let result = await axios.get(config.get('nowPaymentUrl') + 'v1/payment/' + pendingRes[i].payment_id, { headers })
                if (result.status == 200) {
                    let subscription = await buySubsciptionPlanData({ _id: pendingRes[i]._id })
                    if (subscription) {
                        if (result.data.payment_status == "finished") {
                            let userFindRes = await findUser({ _id: subscription.userId })
                            let getPlan = await findSubscriptionPlan({ _id: subscription.subScriptionPlanId })
                            if (userFindRes) {
                                if (userFindRes.subscriptionPlaneId) {
                                    let priviousRes = await lastedBuyPlan({ userId: subscription.userId, _id: userFindRes.subscriptionPlaneId, order_id: { $ne: result.data.order_id } })
                                    if (priviousRes) {
                                        let [inActiveAll, updateRes] = await Promise.all([
                                            buySubsciptionPlanUpdate({ _id: priviousRes._id }, { planStatus: "INACTIVE" }),
                                            updateUser({ _id: subscription.userId }, {
                                                previousPlaneId: priviousRes._id, previousPlanName: priviousRes.subScriptionPlanId.type, previousPlanStatus: "INACTIVE",
                                            })
                                        ])
                                    }
                                }
                            }
                            var endTime = new Date();
                            endTime.setTime(endTime.getTime() + (Number(getPlan.planDuration) * 24 * 60 * 60 * 1000));
                            let startTime = new Date()
                            let [userUpdateRes, updateSubscriptionPlanRes] = await Promise.all([
                                updateUser({ _id: subscription.userId }, {
                                    subscriptionPlaneId: subscription._id,
                                    currentPlanName: getPlan.title,
                                    currentPlanStatus: "ACTIVE",
                                    subscriptionPlaneStatus: true,
                                    planCapitalAmount: getPlan.capital,
                                    planProfit: getPlan.profits
                                }),
                                buySubsciptionPlanUpdate({ _id: subscription._id }, {
                                    planStatus: "ACTIVE",
                                    startTime: startTime,
                                    endTime: endTime,
                                    payment_status: result.data.payment_status
                                })
                            ])
                        } else {
                            let activePlan = await buySubsciptionPlanUpdate({ _id: subscription._id }, {
                                payment_status: result.data.payment_status
                            })
                        }
                    }

                }
                if (i === pendingRes.length - 1) {
                    checkPaymentStatus.start();
                }
            }
        }
        checkPaymentStatus.start()
    } catch (error) {
        checkPaymentStatus.start()
        console.log('checkPaymentStatus error', error)
    }

})

var inActivePlanStatus = new CronJob('*/1 * * * * *', async function () {
    try {
        inActivePlanStatus.stop();
        let inactivePlan = await buySubscriptionhPlanList({ endTime: { $lte: new Date() }, planStatus: 'ACTIVE', status: status.ACTIVE })
        if (inactivePlan.length == 0) {
            inActivePlanStatus.start();
        } else {
            inActivePlanStatus.stop();
        }
        for (let i = 0; i < inactivePlan.length; i++) {
            let resul = await buySubsciptionPlanUpdate({ _id: inactivePlan[i]._id }, { planStatus: 'INACTIVE' })
            await updateUserById({ _id: inactivePlan[i].userId._id }, { subscriptionPlaneStatus: false, planCapitalAmount: 0, planProfit: 0, currentPlanStatus: "INACTIVE" })
            if (i === inactivePlan.length - 1) {
                inActivePlanStatus.start();
            }
            console.log("inActivePlanStatus", resul)
        }
        inActivePlanStatus.start();
    } catch (error) {
        inActivePlanStatus.start();
        console.log('inActivePlanStatus error', error)
    }
})

var inActiveSubscriptionPlanStatus = new CronJob('*/1 * * * * *', async function () {
    try {
        let inactivePlan = await subscriptionPlanList({ endTime: { $lte: new Date() }, planStatus: 'ACTIVE', status: status.ACTIVE })
        if (inactivePlan.length == 0) {
            inActiveSubscriptionPlanStatus.start();
        } else {
            inActiveSubscriptionPlanStatus.stop();
        }
        for (let i = 0; i < inactivePlan.length; i++) {
            let result = await updateSubscriptionPlan({ _id: inactivePlan[i]._id }, { planStatus: 'INACTIVE' })
            if (i === inactivePlan.length - 1) {
                inActiveSubscriptionPlanStatus.start();
            }
        }
        inActiveSubscriptionPlanStatus.start();
    } catch (error) {
        inActiveSubscriptionPlanStatus.start();
        console.log('inActiveSubscriptionPlanStatus error', error)
    }
})

var remainderPayment = new CronJob('30 23 * * *', async function () {
    try {
        remainderPayment.stop();
        var endTime = new Date();
        var toDate = new Date();
        console.log("=sdfhsjfhjsdhfjsdhfshfshfjshjhsfjhsdjfhsdjfhsdjfhdjshf")
        toDate.setTime(toDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        let activePlan = await buySubscriptionhPlanList({ $and: [{ endTime: { $gte: endTime } }, { endTime: { $lte: toDate } }], planStatus: 'ACTIVE', status: status.ACTIVE })
        for (let i = 0; i < activePlan.length; i++) {
            let userFindRes = await findUser({ _id: activePlan[i].userId._id, paymentType: paymentType.CRYPTO ,recursivePayment:{$ne:false}})
            if (userFindRes) {
                console.log("=sdfhsdjfhdsjfhjsdhfjdshfjsdhfjsdf", activePlan[i]._id)
                let priviousRes = await lastedBuyPlan({ userId: activePlan[i].userId._id, _id: userFindRes.subscriptionPlaneId })
                let planRes = await findSubscriptionPlan({ _id: priviousRes.subScriptionPlanId._id, status: status.ACTIVE })
                if (planRes) {
                    let pendingRes = await buySubsciptionPlanData({ userId: activePlan[i].userId._id, payment_status: { $in: ["waiting", "confirming", "confirmed", "sending", "partially_paid"] } })
                    if (pendingRes) {
                        let priviousTime = new Date(priviousRes.endTime).toISOString().replace('-', '/').split('T')[0].replace('-', '/')
                        await commonFunction.remainderNotificationMail(activePlan[i].userId.email, "Hi", planRes.type, pendingRes.pay_amount, priviousTime, pendingRes.pay_address, pendingRes.pay_currency, priviousTime, planRes.planDuration)
                    } else {
                        if (planRes) {
                            let order_id = commonFunction.generateOrder()
                            const paymentData = {
                                price_amount: planRes.recursiveValue, // The payment amount
                                price_currency: 'USD', // The currency you are paying with
                                pay_currency: userFindRes.cryptoCurrency, // The cryptocurrency you want to receive
                                order_id: order_id, // Your order ID or identifier
                                ipn_callback_url: 'https://node.astroqunt.app/api/v1/admin/nowPaymentCallBack', // URL to receive IPN (Instant Payment Notification) callbacks
                                // ipn_callback_url: "https://arbitragebot-bitbinarge.mobiloitte.io/api/v1/admin/nowPaymentCallBack"
                            }
                            const headers = {
                                'Content-Type': 'application/json',
                                'x-api-key': config.get('nowPaymentApiKey')
                            };
                            let result = await axios.post(config.get('nowPaymentUrl') + 'v1/payment', paymentData, { headers })
                            if (result.status == 201) {
                                if (result.data.payment_status == 'waiting') {
                                    let obj = {
                                        userId: activePlan[i].userId._id,
                                        subScriptionPlanId: planRes._id,
                                        tradeFee: planRes.tradeFee,
                                        price_amount: result.data.price_amount,
                                        payment_id: result.data.payment_id,
                                        pay_address: result.data.pay_address,
                                        payment_status: result.data.payment_status,
                                        pay_currency: result.data.pay_currency,
                                        pay_amount: result.data.pay_amount,
                                        price_currency: result.data.price_currency,
                                        order_id: result.data.order_id,
                                        // planStatus: planRes.planStatus,
                                        exchangeUID: planRes.exchangeUID,
                                        arbitrageName: planRes.arbitrageName,
                                        pairs: planRes.pairs,
                                        capital: planRes.capital,
                                        profits: planRes.profits,
                                        coinType: planRes.coinType,
                                        isFuelDeduction: planRes.isFuelDeduction,
                                        paymentType: paymentType.CRYPTO,
                                    }
                                    let createObj = await buySubsciptionPlanCreate(obj)
                                    let priviousTime = new Date(priviousRes.endTime).toISOString().replace('-', '/').split('T')[0].replace('-', '/')
                                    await commonFunction.remainderNotificationMail(activePlan[i].userId.email, "Hi", planRes.type, result.data.pay_amount, priviousTime, result.data.pay_address, result.data.pay_currency, priviousTime, planRes.planDuration)
                                }
                            }
                        }
                    }
                }
            }

        }
        remainderPayment.start();
    } catch (error) {
        remainderPayment.start();
        console.log('remainderPayment error', error)
    }
})

var remainderPaymentTrustPayment = new CronJob('30 23 * * *', async function () {
    try {
        remainderPaymentTrustPayment.stop();
        var endTime = new Date();
        var toDate = new Date();
        toDate.setTime(toDate.getTime() - (9 * 24 * 60 * 60 * 1000));
        let activePlan = await buySubscriptionhPlanList({ $and: [{ endTime: { $gte: toDate } }, { endTime: { $lte: endTime } }], planStatus: "INACTIVE", status: status.ACTIVE })
        for (let i = 0; i < activePlan.length; i++) {
            let userFindRes = await findUser({ _id: activePlan[i].userId._id, paymentType: paymentType.CARD, currentPlanStatus: "INACTIVE" ,recursivePayment:{$ne:false}})
            if (userFindRes) {
                let [priviousRes, planCounts] = await Promise.all([
                    lastedBuyPlan({ userId: activePlan[i].userId._id, _id: userFindRes.subscriptionPlaneId }),
                    buySubsciptionPlanCount({ userId: activePlan[i].userId._id, paymentType: paymentType.CARD })
                ])
                if (priviousRes.planStatus == "INACTIVE") {
                    let planRes = await findSubscriptionPlan({ _id: priviousRes.subScriptionPlanId._id, status: status.ACTIVE })
                    let order_id = commonFunction.generateOrder()
                    let keys = await findKeys()
                    if (!keys) {
                        throw apiError.notFound(responseMessage.KEYS_NOT_FOUND);
                    }
                    let [trustPaymentAlias, trustPaymentSiteReference, trustPaymentUrl,userName,password] = await Promise.all([
                        commonFunction.decrypt(keys.trustPaymentAlias),
                        commonFunction.decrypt(keys.trustPaymentSiteReference),
                        commonFunction.decrypt(keys.trustPaymentUrl),
                        commonFunction.decrypt(keys.trustPaymentUserName),
                        commonFunction.decrypt(keys.trustPaymentPassword),
                    ])
                    if (planRes) {
                        const paymentData = JSON.stringify({
                            "alias": trustPaymentAlias,
                            "version": "1.00",
                            "request": [{
                                "sitereference": trustPaymentSiteReference,
                                "requesttypedescriptions": ["AUTH"],
                                "accounttypedescription": "RECUR",
                                "parenttransactionreference": userFindRes.transactionReference,
                                "mainamount": planRes.recursiveValue.toString(),
                                "subscriptiontype": "RECURRING",
                                "subscriptionnumber": "1",
                                "credentialsonfile": "2",
                                "orderreference": order_id
                            }]
                        });
                        let authToken = await commonFunction.generateTrustPaymentAuthToken(userName, password)
                        const headers = {
                            'Content-type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': "Basic " + authToken
                        }
                        let result = await axios.post(trustPaymentUrl, paymentData, { headers })
                        console.log("fdsfl;sdfldsfklds", result.data)
                        if (result.data.response[0].errorcode == "0") {
                            var endTime = new Date();
                            endTime.setTime(endTime.getTime() + (Number(planRes.planDuration) * 24 * 60 * 60 * 1000));
                            let startTime = new Date()
                            let obj = {
                                userId: activePlan[i].userId._id,
                                subScriptionPlanId: planRes._id,
                                tradeFee: planRes.tradeFee,
                                price_amount: (result.data.response[0].baseamount) / 100,
                                payment_id: result.data.response[0].tid,
                                pay_address: result.data.response[0].maskedpan,
                                payment_status: "finished",
                                pay_currency: result.data.response[0].currencyiso3a,
                                pay_amount: (result.data.response[0].baseamount) / 100,
                                price_currency: result.data.response[0].currencyiso3a,
                                transactionReference: result.data.response[0].transactionreference,
                                settlestatus: result.data.response[0].settlestatus,
                                order_id: result.data.response[0].orderreference,
                                exchangeUID: planRes.exchangeUID,
                                arbitrageName: planRes.arbitrageName,
                                pairs: planRes.pairs,
                                capital: planRes.capital,
                                profits: planRes.profits,
                                coinType: planRes.coinType,
                                isFuelDeduction: planRes.isFuelDeduction,
                                paymentType: paymentType.CARD,
                                startTime: startTime,
                                endTime: endTime,
                                planStatus: "ACTIVE",
                            }
                            let createObj = await buySubsciptionPlanCreate(obj)
                            if (createObj) {
                                let [inActiveAll, updateRes] = await Promise.all([
                                    buySubsciptionPlanUpdate({ _id: activePlan[i]._id }, { planStatus: "INACTIVE" }),
                                    updateUser({ _id: createObj.userId }, {
                                        previousPlaneId: activePlan[i]._id,
                                        previousPlanName: planRes.type,
                                        previousPlanStatus: "INACTIVE",
                                        subscriptionPlaneId: createObj._id,
                                        currentPlanName: planRes.title,
                                        currentPlanStatus: "ACTIVE",
                                        subscriptionPlaneStatus: true,
                                        planCapitalAmount: planRes.capital,
                                        planProfit: planRes.profits,
                                        paymentType: paymentType.CARD,
                                        // transactionReference: createObj.transactionReference
                                    })
                                ])

                            }
                        } else {
                            await commonFunction.mailForExpCardPayment(activePlan[i].userId.email, 'Hi', planRes.type, activePlan[i].endTime, planRes.planDuration)
                            console.log("Plan marked as INACTIVE due to non-payment after 10 days.", `${result.data.response[0].errormessage} - ${result.data.response[0].errordata[0]}`);
                        }
                    }
                }
            }
        }
        remainderPaymentTrustPayment.start();
    } catch (error) {
        remainderPaymentTrustPayment.start();
        console.log('remainderPayment error', error)
    }
})


var cashSubscriptionMail = new CronJob('30 23 * * *', async function () {
    try {
        cashSubscriptionMail.stop();
        var endTime = new Date();
        var toDate = new Date();
        toDate.setTime(toDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        let inActivePlan = await buySubscriptionhPlanList({ $and: [{ endTime: { $gte: endTime } }, { endTime: { $lte: toDate } }], planStatus: 'ACTIVE', status: status.ACTIVE, paymentType: { $in: [paymentType.CASH, paymentType.FREE] } })
        for (let i = 0; i < inActivePlan.length; i++) {
            let user = await findUser({ _id: inActivePlan[i].userId, status: status.ACTIVE })
            if (user) {
                await commonFunction.mailForExpCashPayment(user.email)
                console.log("send Mail........................")
            }
        }
        cashSubscriptionMail.start();
    } catch (error) {
        cashSubscriptionMail.start();
        console.log('cashSubscriptionMail error', error)
    }
})


inActivePlanStatus.start()
// inActivePlanStatus.stop()


remainderPayment.start()
// remainderPayment.stop()

remainderPaymentTrustPayment.start()

cashSubscriptionMail.start()



//////////////////////////////////////////////not use//////////////////////////////////
// inActiveSubscriptionPlanStatus.start()
// inActiveSubscriptionPlanStatus.stop()

// checkPaymentStatus.start()
// checkPaymentStatus.stop()