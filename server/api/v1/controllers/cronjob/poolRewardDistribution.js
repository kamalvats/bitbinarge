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
let poolRewardDistribution = new CronJob("*/10 * * * *", async function () {
  try {
    poolRewardDistribution.stop();
    console.log("poolRewardDistribution ==>", new Date());
    let minTrades = 1;
    let maxTrade = 4;
    let todayTrades = await getRandomInteger(minTrades, maxTrade);
   
    const intervalMs = (1 * 60 * 1000) / await getRandomFloat(2.5, 5);
    for (let i = 0; i < todayTrades; i++) {
      setTimeout(async () => {
        console.log("fdjfkdsjfkldsfkdsjf",intervalMs,new Date(),todayTrades)
        let allSubPlans = await poolingSubscriptionPlanList({
          status: "ACTIVE",
        });
        for (let j = 0; j < allSubPlans.length; j++) {
           let profitPaths = await profitpatheListLimit({
      path: { $exists: true, $not: { $size: 0 } },
      arbitrageName:{$in:allSubPlans[j].arbitrage},
      // exchange:{$in:allSubPlans[j].exchanges},
    });
    // let nPathArr =[]
    // for(let i=0;i<profitPaths.length;i++){
    //   if(profitPaths[i].arbitrageName == "Direct Arbitrage"){
    //     nPathArr.push(profitPaths[i])
    //   }else {
    //     if(profitPaths[i].exchange.includes(allSubPlans[j].exchanges)){
    //       nPathArr.push(profitPaths[i])
    //     }
    //   }
    // }
     profitPaths =  await profitPaths.filter(p =>
  p.arbitrageName === "Direct Arbitrage" ||
  allSubPlans[j].exchanges.includes(p.exchange)
);

console.log("0000000000000000000000000000000000000000000000",allSubPlans[j].arbitrage,profitPaths.length)
    if(profitPaths.length>0){
          let tradeAmountArray = [50,175,80,10,25,70,100, 120, 150,350,500];
          let allUsers = await findAllUser({ status: "ACTIVE",userType:"USER" });
          if (allUsers.length > 0) {
            for (let k = 0; k < allUsers.length; k++) {
              let randomNumber = getRandomInteger(0, tradeAmountArray.length - 1);
              let planInvestment = await poolSubscriptionHistoryPlanList({
                subscriptionPlanId: allSubPlans[j]._id,
                userId:allUsers[k]._id
              });
              let totalPlanInvestment = planInvestment.reduce(
                (acc, curr) => acc + curr.investedAmount,
                0
              );
              let todatTrx = await transactionList({ userId: allUsers[k]._id,subscriptionPlanId: allSubPlans[j]._id,  transactionType: "TRADE", createdAt: { $gte: new Date(new Date().toISOString().slice(0, 10)) } },
        { createdAt: { $lte: new Date(new Date().toISOString().slice(0, 10) + 'T23:59:59.999Z') } })
        let todayTotalTradeProfit = await todatTrx.reduce((a, c) => a + c.profit, 0)     
        todayTotalTradeProfit = (todayTotalTradeProfit /totalPlanInvestment)*100
       
              if( planInvestment.length >0 &&totalPlanInvestment * allSubPlans[j].profitPotential >planInvestment[0].totalProfit){
 let tradeAmount = tradeAmountArray[randomNumber]
              if(totalPlanInvestment<=tradeAmount){
                tradeAmount=totalPlanInvestment/3.5
              }
              if (totalPlanInvestment > 0) {
                let profitPathForTrade = await getProfitPathRec(profitPaths);
                let newPath = await getRandomObjectsFromArray(
                  profitPathForTrade.path
                );
                profitPathForTrade.path = [newPath];
                let tradeProfitPerc = await getRandomFloat(
                  allSubPlans[j].minProfits / 30,
                  (allSubPlans[j].maxProfits-0.89) / 30
                );
                 if(todayTotalTradeProfit<tradeProfitPerc){
                  let tradeP = await getRandomFloat(
                    0.085,(tradeProfitPerc/4.35)
                  )
let tradeprofit =
                  (tradeAmount * tradeP) / 100;
                tradeprofit =
                  todayTrades == 2 && j == 1 ? -tradeprofit : tradeprofit;
                let obj = {
                  profitPath: profitPathForTrade,
                  subscriptionPlanId: allSubPlans[j]._id,
                  totalPlanInvestment: totalPlanInvestment,
                  profit: tradeprofit,
                  profitPercentage: tradeprofit>0?tradeP:-tradeP,
                  transactionType: "TRADE",
                  tradeAmount: tradeAmount,
                  status: "COMPLETED",
                  userId: allUsers[k]._id
                };
                console.log("ffffffffffffffff", obj);
                await createTransaction(obj);
                setTimeout(() => {}, getRandomInteger(1, 5) * 10000);
                   }else{
                     console.log("no profit")
                   }
                
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
 for (let i = 0; i < 3; i++) Math.floor(Math.random() * (max - min + 1)) + min

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomObjectsFromArray(arr) {
  for (let i = 0; i < 3; i++) arr[Math.floor(Math.random() * arr.length)];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min, max) {
  for (let i = 0; i < 3; i++) Math.random() * (max - min) + min;
  return Math.random() * (max - min) + min;
}
function getProfitPathRec  (paths){
  let path = getRandomObjectsFromArray(
                  paths
                );
                if(path.path.length>0){
                  return path
                }
                else{
                  return getProfitPathRec(path.path)
                }
}