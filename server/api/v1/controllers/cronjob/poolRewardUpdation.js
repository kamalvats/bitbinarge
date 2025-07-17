var CronJob = require("cron").CronJob;
import { userServices } from "../../services/user";
const {
  userCheck,
  createUser,
  checkUserExists,
  emailMobileExist,
  paginateSearch,
  findUser,
  updateUser,
  updateUserById,
  findUserWithOtp,
  editEmailMobileExist,
  aggregateSearchList,
  findAllUserWithSelectedField,
  findAllUser,
} = userServices;
import { poolingSubscriptionPlanServices } from "../../services/poolingSubscriptionPlan";
const {
  createPoolingSubscriptionPlan,
  findPoolingSubscriptionPlan,
  updatePoolingSubscriptionPlan,
  paginateSearchPoolingSubscriptionPlan,
  poolingSubscriptionPlanList,
} = poolingSubscriptionPlanServices;
import { poolSubscriptionHistoryPlanServices } from "../../services/poolSubscriptionHistory";
const {
  createPoolSubscriptionHistoryPlan,
  findPoolSubscriptionHistoryPlan,
  updatePoolSubscriptionHistoryPlan,
  poolSubscriptionHistoryPlanList,
} = poolSubscriptionHistoryPlanServices;
import { profitPathServices } from "../../services/profitpath";
const {
  profitpathCreate,
  profitpatheList,
  profitpathData,
  profitpathUpdate,
  createUpdateProfitPath,
  profitpatheListLimit,
} = profitPathServices;
import { transactionServices } from "../../services/transaction";
const {
  createTransaction,
  findTransaction,
  updateTransaction,
  transactionPaginateSearch,
  transactionList,
  countTransactionData,
} = transactionServices;
let poolRewardUpdation = new CronJob("*/8 * * * *", async function () {
try {
    poolRewardUpdation.stop()
     let planInvestment = await poolSubscriptionHistoryPlanList({
                // subscriptionPlanId: allSubPlans[j]._id,
              });
              for(let i=0;i<planInvestment.length;i++){
                if(planInvestment[i].investedAmount >0){
                    let planData = await findPoolingSubscriptionPlan({_id:planInvestment[i]._id})
if(planData){
  const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

console.log(yesterday);

    let trandactionData =await transactionList({userId:planInvestment[i].userId,transactionType:"TRADE",
      createdAt: { $gte: new Date(new Date(yesterday).toISOString().slice(0, 10)) } },
        { createdAt: { $lte: new Date(new Date(yesterday).toISOString().slice(0, 10) + 'T23:59:59.999Z') }
    })
    let totalTradeProfit  = await trandactionData.reduce((a,c)=>a+c.profitPercentage,0)
    totalTradeProfit =totalTradeProfit / trandactionData.length
    let todayProfit = (planInvestment[i].investedAmount*totalTradeProfit)/100
    await createTransaction({
        userId:planInvestment.userId,
        transactionType:"REWARD",
        subscriptionPlanId:planData._id,
        profit:todayProfit,
        profitPercentage:totalTradeProfit,
        amount:planInvestment[i].investedAmount
    })
    await updatePoolSubscriptionHistoryPlan({_id:planInvestment[i]._id},{$inc:{profit:todayProfit,totalProfit:todayProfit}})
    // await updateUser({_id:planInvestment[i].userId},{$inc:{totalReward:todayProfit}})

}
                }
              }
    poolRewardUpdation.start()
} catch (error) {
    console.log("",error)
    poolRewardUpdation.start()
}
})
poolRewardUpdation.start()
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}