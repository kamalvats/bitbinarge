var CronJob = require("cron").CronJob;
import { userServices } from "../../services/user";
const { findAllUser, updateUser } = userServices;
import aedGardoPaymentFunctions from '../../../../helper/aedGardoPaymentFunctions';
import config from "config";
let updateLivePrice = new CronJob("*/1 * * * * *", async function () {
    try {
        updateLivePrice.stop();
        let allUsers = await findAllUser({ status: "ACTIVE", userType: "USER", aedGardoAddress: { $exists: true } });
        for (let user of allUsers) {
            let getWalletBalanceMain = await aedGardoPaymentFunctions.getWalletBalance(user._id, config.get("aedgardoApiKey"));
            if (getWalletBalanceMain.status ==true && getWalletBalanceMain.result.status != 0) {
                await updateUser({ _id: user._id }, {
                    $set: {
                        mainWalletBalance: Number(getWalletBalanceMain.result.data.amount),
                    }
                })
            }
            let getWalletBalanceReward = await aedGardoPaymentFunctions.getRewardWalletBalance(user._id, config.get("aedgardoApiKey"));
            if (getWalletBalanceReward.status ==true &&getWalletBalanceReward.result.status != 0) {
                await updateUser({ _id: user._id }, {
                    $set: {
                        rewardWalletBalance: Number(getWalletBalanceReward.result.data.amount),
                    }
                })
            }
        }
        updateLivePrice.start();
    } catch (error) {
        console.log("updateLivePrice ==>", error);
        updateLivePrice.start();
    }
});
updateLivePrice.start();
