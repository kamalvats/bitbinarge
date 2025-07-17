var CronJob = require('cron').CronJob;
import config from "config";
import status from "../../../../enums/status";
import { generateFieroWalletAddress, generateUsdWalletAddress } from "../../../../helper/blockChainFunction/eth"
import { userServices } from '../../services/user';
const { findUser, updateUser, findAllUser, findCount } = userServices
import { userWalletServices } from "../../services/userWallet"
const { userWalletCount, createUpdateUserWallet, findUserWallet } = userWalletServices

let userWalletGenerate = new CronJob(config.get("cronTime.userWallet"), async function () {
    try {
        userWalletGenerate.stop()
        let allPendingUser = await findAllUser({ status: { $ne: status.DELETE }, isWalletGenerated: false })
        console.log("=============================", allPendingUser.length)
        if (allPendingUser.length != 0) {
            for (let i = 0; i < allPendingUser.length; i++) {
                let [count, walletUser] = await Promise.all([
                    userWalletCount({}),
                    findUserWallet({ status: { $ne: status.DELETE }, userId: allPendingUser[i]._id })
                ])
                if (!walletUser) {
                    count = count + 1
                    // let [fieroWalletRes, usdWalletRes] = await Promise.all([generateFieroWalletAddress(count), generateUsdWalletAddress(count)])
                    let usdWalletRes = await generateUsdWalletAddress(count)
                    if ( usdWalletRes.status == true) {
                        let obj = {
                            // walletFieroAddress: fieroWalletRes.address,
                            walletUsdAddress: usdWalletRes.address,
                            userId: allPendingUser[i]._id,
                        }
                        let [generateWalletRes, updateUserRes] = await Promise.all([
                            createUpdateUserWallet({ userId: allPendingUser[i]._id }, obj),
                            updateUser({ _id: allPendingUser[i]._id }, { isWalletGenerated: true, walletIndex: count })])
                        console.log("=========================>>>>>>", generateWalletRes)

                    }

                }
            }
        }
        userWalletGenerate.start()
    } catch (error) {
        console.log("walletGenerated error", error)
        userWalletGenerate.start()
    }

})




userWalletGenerate.start()
// userWalletGenerate.stop()

