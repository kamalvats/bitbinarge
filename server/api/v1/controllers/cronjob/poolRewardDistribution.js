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
import arbitrage from "../../../../enums/arbitrage";
const {
  createTransaction,
  findTransaction,
  updateTransaction,
  transactionPaginateSearch,
  transactionList,
  countTransactionData,
} = transactionServices;
let poolRewardDistribution = new CronJob("*/8 * * * *", async function () {
  try {
    poolRewardDistribution.stop();
    console.log("poolRewardDistribution ==>", new Date());
    let minTrades = 2;
    let maxTrade = 5;
    let todayTrades = await getRandomInteger(minTrades, maxTrade);
   
    const intervalMs = (6 * 60 * 1000) / todayTrades;
    for (let i = 0; i < todayTrades; i++) {
      setTimeout(async () => {
        console.log("fdjfkdsjfkldsfkdsjf",intervalMs,new Date())
        let allSubPlans = await poolingSubscriptionPlanList({
          status: "ACTIVE",
        });
        for (let j = 0; j < allSubPlans.length; j++) {
           let profitPaths = await profitpatheListLimit({
      path: { $exists: true, $not: { $size: 0 } },
      arbitrageName:{$in:allSubPlans[j].arbitrage},
      exchange:{$in:allSubPlans[j].exchanges},
    });
    if(profitPaths.length>0){
          let tradeAmountArray = [50,70,100, 120, 150];
          let allUsers = await findAllUser({ status: "ACTIVE",userType:"USER" });
          if (allUsers.length > 0) {
            for (let k = 0; k < allUsers.length; k++) {
              let randomNumber = getRandomInteger(0, 4);
              let planInvestment = await poolSubscriptionHistoryPlanList({
                subscriptionPlanId: allSubPlans[j]._id,
                userId:allUsers[k]._id
              });
              let totalPlanInvestment = planInvestment.reduce(
                (acc, curr) => acc + curr.investedAmount,
                0
              );
              if( planInvestment.length >0 &&totalPlanInvestment * allSubPlans[j].profitPotential >planInvestment[0].totalProfit){
 let tradeAmount = tradeAmountArray[randomNumber] >totalPlanInvestment?totalPlanInvestment: tradeAmountArray[randomNumber]
              
              if (totalPlanInvestment > 0) {
                let profitPathForTrade = await getRandomObjectsFromArray(
                  profitPaths
                );
                let newPath = await getRandomObjectsFromArray(
                  profitPathForTrade.path
                );
                profitPathForTrade.path = [newPath];
                let tradeProfitPerc = await getRandomFloat(
                  allSubPlans[j].minProfits / 30,
                  allSubPlans[j].maxProfits / 30
                );
                let tradeprofit =
                  (tradeAmount * tradeProfitPerc) / 100;
                tradeprofit =
                  todayTrades > 3 && j == 1 ? -tradeprofit : tradeprofit;
                let obj = {
                  profitPath: profitPathForTrade,
                  subscriptionPlanId: allSubPlans[j]._id,
                  totalPlanInvestment: totalPlanInvestment,
                  profit: tradeprofit,
                  profitPercentage: tradeprofit>0?tradeProfitPerc:-tradeProfitPerc,
                  transactionType: "TRADE",
                  tradeAmount: tradeAmount,
                  status: "COMPLETED",
                  userId: allUsers[k]._id
                };
                console.log("ffffffffffffffff", obj);
                await createTransaction(obj);
                setTimeout(() => {}, getRandomInteger(1, 5) * 10000);
              } else {
                console.log("no plan investment");
              }
              }else{
                await updatePoolSubscriptionHistoryPlan({
                  subscriptionPlanId: allSubPlans[j]._id,
                  userId:allUsers[k]._id
                }, { $set: { status: "INACTIVE" } })
              }
             
            }
          }}
        }
      }, intervalMs * (i + (i == 0 ? 0 : 1)));
    }

    poolRewardDistribution.start();
  } catch (error) {
    console.log("poolRewardDistribution ==>", error);
    poolRewardDistribution.start();
  }
});
poolRewardDistribution.start();
function getRandomInteger(min, max) {
 for (let i = 0; i < 3; i++) Math.random();

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomObjectsFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
