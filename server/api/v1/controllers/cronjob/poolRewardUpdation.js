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
import config from "config";
import status from "../../../../enums/status";
import { WalletType } from "binance-api-node";
const {
  createTransaction,
  findTransaction,
  updateTransaction,
  transactionPaginateSearch,
  transactionList,
  countTransactionData,
} = transactionServices;
import aedGardoPaymentFunctions from '../../../../helper/aedGardoPaymentFunctions';
let poolRewardUpdation = new CronJob("30 1 * * *", async function () {
  try {
    poolRewardUpdation.stop()
    let planInvestment = await poolSubscriptionHistoryPlanList({
      // subscriptionPlanId: allSubPlans[j]._id,
      status: "ACTIVE"
    });
    for (let i = 0; i < planInvestment.length; i++) {
      if (planInvestment[i].investedAmount > 0) {
        let userData = await findUser({ _id: planInvestment[i].userId })
        if (userData) {
          let planData = await findPoolingSubscriptionPlan({ _id: planInvestment[i].subscriptionPlanId })
          if (planData) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() -1 );

            console.log(yesterday);

            let trandactionData = await transactionList({
              userId: planInvestment[i].userId, transactionType: "TRADE",
              createdAt: { $gte: new Date(new Date(yesterday).toISOString().slice(0, 10)) },
              subscriptionPlanId :planData._id,
                createdAt: { $lte: new Date(new Date(yesterday).toISOString().slice(0, 10) + 'T23:59:59.999Z') }
            })
            let totalTradeProfit = await trandactionData.reduce((a, c) => a + c.profit, 0)
            let profitPercentage = await trandactionData.reduce((a, c) => a + c.profitPercentage, 0)
            if (totalTradeProfit > 0) {
              // totalTradeProfit = totalTradeProfit / trandactionData.length
              let todayProfit = totalTradeProfit

              let deduction = await aedGardoPaymentFunctions.incomeDistribution(userData._id, config.get("aedgardoApiKey"), todayProfit,"REWARD_INCOME");
               if (deduction.status != false) {
                        await createTransaction({
                userId: planInvestment[i].userId,
                transactionType: "DEPOSIT",
                subscriptionPlanId: planData._id,
                profit: todayProfit,
                profitPercentage: profitPercentage,
                amount: planInvestment[i].investedAmount,
                walletType: "REWARD",
                status:"COMPLETED"
              })
              await updatePoolSubscriptionHistoryPlan({ _id: planInvestment[i]._id }, { $inc: { profit: todayProfit, totalProfit: todayProfit } })
              await updateUser({ _id: planInvestment[i].userId }, { $inc: { totalReward: todayProfit } })
            
                    }
           }


          }
        }

      }
    }
    poolRewardUpdation.start()
  } catch (error) {
    console.log("", error)
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