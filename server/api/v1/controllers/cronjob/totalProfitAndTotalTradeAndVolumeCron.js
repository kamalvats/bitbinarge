var CronJob = require('cron').CronJob;
import { triangularServices } from '../../services/triangular'
const { triangularHighestProfit, triangularAllList, triangularArbitrageCount } = triangularServices

import { directServices } from '../../services/directarbitrage'
const { directHighestCount, directArbitrageList } = directServices

import { intraAbitrageSingleExchangeServices } from "../../services/intraArbitrageSingleExchange"
const { intraArbitrageSingleExchangeHighestCount, intraArbitrageSingleExchangeAllList, intraArbitrageSingleExchangeCount } = intraAbitrageSingleExchangeServices

import { totalProfitAndTotalTradeAndVolumeServices } from "../../services/totalProfitAndTotalTradeAndVolume"
const { createTotalProfitAndTotalTradeAndVolumeContent,findTotalProfitAndTotalTradeAndVolumeContent,updateTotalProfitAndTotalTradeAndVolumeContent} = totalProfitAndTotalTradeAndVolumeServices
import arbitrageStatus from '../../../../enums/arbitrageStatus'
let totalProfitAndTotalTradeAndVolumeCron = new CronJob("*/30 * * * * *", async function () {
    try {
        totalProfitAndTotalTradeAndVolumeCron.stop()
            let profitTotalQuery = { arbitrageStatus: arbitrageStatus.COMPLETED, profit: { $gte: 0 } }
            let [triangularTotalProfit, directTotalProfit, intraSingleExchangeTotalProfit,findTotalProfitAndTotalTradeAndVolumeObj] = await Promise.all([
                triangularAllList(profitTotalQuery),
                directArbitrageList(profitTotalQuery),
                intraArbitrageSingleExchangeAllList(profitTotalQuery),
                findTotalProfitAndTotalTradeAndVolumeContent({})
            ])
            let totalDirectProfit = 0, totalTriangularProfit = 0, totalIntraArbitrageSingleExchangeProfit = 0, totalDirectCapital = 0, totalTriangularCapital = 0, totalIntraSingleExchnageCapital = 0
            if (directTotalProfit.length != 0) {
                totalDirectProfit = directTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                totalDirectCapital = directTotalProfit.reduce((n, { capitalInUSDT }) => n + Number(capitalInUSDT), 0)
            }
            if (triangularTotalProfit.length != 0) {
                totalTriangularProfit = triangularTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                totalTriangularCapital = triangularTotalProfit.reduce((n, { capitalInUSDT }) => n + Number(capitalInUSDT), 0)
            }
            if (intraSingleExchangeTotalProfit.length != 0) {
                totalIntraArbitrageSingleExchangeProfit = intraSingleExchangeTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                totalIntraSingleExchnageCapital = intraSingleExchangeTotalProfit.reduce((n, { capitalInUSDT }) => n + Number(capitalInUSDT), 0)
            }
            let obj = {
                totalProfit: Number(totalTriangularProfit) + Number(totalIntraArbitrageSingleExchangeProfit) + Number(totalDirectProfit),
                totalTrades: directTotalProfit.length + triangularTotalProfit.length + intraSingleExchangeTotalProfit.length,
                // totalTradingVolume: Number(totalDirectCapital) + Number(totalTriangularCapital) + Number(totalIntraSingleExchnageCapital)
            }
            if(findTotalProfitAndTotalTradeAndVolumeObj){
                await updateTotalProfitAndTotalTradeAndVolumeContent({_id:findTotalProfitAndTotalTradeAndVolumeObj._id},obj)
            }else{
                await createTotalProfitAndTotalTradeAndVolumeContent(obj)
            }
        totalProfitAndTotalTradeAndVolumeCron.start()
    } catch (error) {
        totalProfitAndTotalTradeAndVolumeCron.start()
        console.log('31 ==>', error)
    }
});

totalProfitAndTotalTradeAndVolumeCron.start()
