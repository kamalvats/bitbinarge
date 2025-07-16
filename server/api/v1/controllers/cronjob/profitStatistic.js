
var CronJob = require('cron').CronJob;
import { triangularServices } from '../../services/triangular'
const { triangularHighestProfit, triangularAllList, triangularArbitrageCount } = triangularServices

import { directServices } from '../../services/directarbitrage'
const { directHighestCount, directArbitrageList } = directServices

import { intraAbitrageSingleExchangeServices } from "../../services/intraArbitrageSingleExchange"
const { intraArbitrageSingleExchangeHighestCount, intraArbitrageSingleExchangeAllList, intraArbitrageSingleExchangeCount } = intraAbitrageSingleExchangeServices

import { profitStatisticServices } from "../../services/profitStatistic"
const { createprofitStatisticContent, findprofitStatisticContent, updateprofitStatisticContent } = profitStatisticServices
import arbitrageStatus from '../../../../enums/arbitrageStatus'
let profitStatisticCron = new CronJob("*/32 * * * * *", async function () {
    try {
        console.log("-------------------------------------------------profitStatisticCron")
        profitStatisticCron.stop()
        let data = await findprofitStatisticContent({})
        if (!data) {
            data = await createprofitStatisticContent({
                today: [],
                weekly: [],
                monthly: [],
                yearly: []
            })
        } else {
            let typeArr = ['day', 'month', 'week', 'year']
            for (let type of typeArr) {
                var currentDay = new Date();
                let weekDataRes = []
                var daysOfWeek = [];
                let yearDataRes = []
                let profitTotalQuery = { arbitrageStatus: arbitrageStatus.COMPLETED, profit: { $gte: 0 } }
                if (type == 'day') {
                    let totalDirectProfit = 0, totalTriangularProfit = 0, totalIntraArbitrageSingleExchangeProfit = 0
                    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
                    let dateQuery = { $and: [{ updatedAt: { $gte: new Date(yesterday) } }, { updatedAt: { $lte: new Date(currentDay) } }] }
                    profitTotalQuery = { ...profitTotalQuery, ...dateQuery }
                    let [triangularTotalProfit, directTotalProfit, intraSingleExchangeTotalProfit] = await Promise.all([
                        triangularAllList(profitTotalQuery),
                        directArbitrageList(profitTotalQuery),
                        intraArbitrageSingleExchangeAllList(profitTotalQuery)
                    ])

                    if (directTotalProfit.length != 0) {
                        totalDirectProfit = directTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                    }
                    if (triangularTotalProfit.length != 0) {
                        totalTriangularProfit = triangularTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                    }
                    if (intraSingleExchangeTotalProfit.length != 0) {
                        totalIntraArbitrageSingleExchangeProfit = intraSingleExchangeTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                    }
                    let obj = [{ totalProfit: Number(totalTriangularProfit) + Number(totalIntraArbitrageSingleExchangeProfit) + Number(totalDirectProfit) }]
                    await updateprofitStatisticContent({ _id: data._id }, { today: obj })
                } else if (type == 'month' || type == 'week') {
                    let days = 0
                    if (type == 'month') {
                        days = 30
                    } else {
                        days = 6
                    }
                    var weekDate = new Date(new Date().getTime() - ((24 * Number(days)) * 60 * 60 * 1000));
                    for (var d = new Date(weekDate); d <= currentDay; d.setDate(d.getDate() + 1)) {
                        daysOfWeek.push(new Date(d));
                    }

                    for (let i = 0; i < daysOfWeek.length; i++) {
                        let totalDirectProfit = 0, totalTriangularProfit = 0, totalIntraArbitrageSingleExchangeProfit = 0
                        let startTime = new Date(new Date(daysOfWeek[i]).toISOString().slice(0, 10))
                        let lastTime = new Date(new Date(daysOfWeek[i]).toISOString().slice(0, 10) + 'T23:59:59.999Z');
                        let dateQuery = { $and: [{ updatedAt: { $gte: new Date(startTime) } }, { updatedAt: { $lte: new Date(lastTime) } }] }
                        profitTotalQuery = { ...profitTotalQuery, ...dateQuery }
                        let [triangularTotalProfit, directTotalProfit, intraSingleExchangeTotalProfit] = await Promise.all([
                            triangularAllList(profitTotalQuery),
                            directArbitrageList(profitTotalQuery),
                            intraArbitrageSingleExchangeAllList(profitTotalQuery)
                        ])

                        if (directTotalProfit.length != 0) {
                            totalDirectProfit = directTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        if (triangularTotalProfit.length != 0) {
                            totalTriangularProfit = triangularTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        if (intraSingleExchangeTotalProfit.length != 0) {
                            totalIntraArbitrageSingleExchangeProfit = intraSingleExchangeTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        let objDb = {
                            totalProfit: Number(totalTriangularProfit) + Number(totalIntraArbitrageSingleExchangeProfit) + Number(totalDirectProfit),
                            date: daysOfWeek[i],
                        }
                        weekDataRes.push(objDb);
                    }
                    if (type == 'month') {
                        await updateprofitStatisticContent({ _id: data._id }, { monthly: weekDataRes })
                    } else {
                        await updateprofitStatisticContent({ _id: data._id }, { weekly: weekDataRes })
                    }
                } else {
                    for (let i = 0; i < 12; i++) {
                        let totalDirectProfit = 0, totalTriangularProfit = 0, totalIntraArbitrageSingleExchangeProfit = 0
                        let dataRes = new Date().setMonth((new Date().getMonth() - i));
                        var startTime = new Date(new Date(dataRes).getFullYear(), new Date(dataRes).getMonth(), 1);
                        var lastTime = new Date(new Date(dataRes).getFullYear(), new Date(dataRes).getMonth() + 1, 0);
                        let dateQuery = { $and: [{ updatedAt: { $gte: new Date(startTime) } }, { updatedAt: { $lte: new Date(lastTime) } }] }
                        profitTotalQuery = { ...profitTotalQuery, ...dateQuery }
                        let [triangularTotalProfit, directTotalProfit, intraSingleExchangeTotalProfit] = await Promise.all([
                            triangularAllList(profitTotalQuery),
                            directArbitrageList(profitTotalQuery),
                            intraArbitrageSingleExchangeAllList(profitTotalQuery)
                        ])

                        if (directTotalProfit.length != 0) {
                            totalDirectProfit = directTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        if (triangularTotalProfit.length != 0) {
                            totalTriangularProfit = triangularTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        if (intraSingleExchangeTotalProfit.length != 0) {
                            totalIntraArbitrageSingleExchangeProfit = intraSingleExchangeTotalProfit.reduce((n, { profit }) => n + Number(profit), 0)
                        }
                        let objDb = {
                            totalProfit: Number(totalTriangularProfit) + Number(totalIntraArbitrageSingleExchangeProfit) + Number(totalDirectProfit),
                            month: new Date(dataRes).getMonth() + 1,
                            year: new Date(dataRes).getFullYear()
                        }
                        yearDataRes.push(objDb)
                    }
                    yearDataRes.sort((a, b) => a.year - b.year || a.month - b.month);
                    await updateprofitStatisticContent({ _id: data._id }, { yearly: yearDataRes })
                }
            }
        }

        profitStatisticCron.start()
    } catch (error) {
        profitStatisticCron.start()
        console.log('31 ==>', error)
    }
});

profitStatisticCron.start()