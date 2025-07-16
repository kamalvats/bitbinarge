const CronJob = require('cron').CronJob;
import { walletServices } from '../../services/wallet';
import arbitragefunction from '../../../../helper/arbitrage';
import { profitPathServices } from '../../services/profitpath';
import { triangularProfitPaths } from '../../../../helper/triangularProfitPaths';
import { singleExchangeTwoPairProfitPath } from '../../../../helper/singleExchangeTwoPairprofitPath'
import config from "config";
import arbitrage from "../../../../enums/arbitrage";
import { capitalAmountServices } from '../../services/capitalAmount'

const { findCapitalAmount } = capitalAmountServices
const { exchangeList, exchangeData, connectedExchangeData, connectedExchangeUpdate, connectedExchangeCreate } = walletServices;
const { profitpathCreate, profitpatheList, profitpathData, profitpathUpdate, createUpdateProfitPath } = profitPathServices;
import { profitPathHistoryServices } from '../../services/profitPathHistory'
const { insertManyProfitPathHistory } = profitPathHistoryServices
import { pairsServices } from '../../services/pairs'
import status from '../../../../enums/status';
const { findPairs } = pairsServices
let minutes = 2
let triangularTime = Date.now() + minutes * 60 * 1000
let intraTime = Date.now() + minutes * 60 * 1000
let directTime = Date.now() + minutes * 60 * 1000



var getDirectPooling = async function () {
  try {
    const exchangePairs = [
      'Binance-Kraken', 'Binance-Mexc', 'Binance-Bitmart',
      'Kraken-Binance', 'Kraken-Mexc', 'Kraken-Bitmart',
      'Mexc-Binance', 'Mexc-Kraken', 'Mexc-Bitmart',
      'Bitmart-Binance', 'Bitmart-Kraken', 'Bitmart-Mexc',
    ];

    const capitalAmountRes = await findCapitalAmount({});
    const amountRes = capitalAmountRes.direct || 1000;
    const capital = Number(amountRes);

    const startTokens = ['USDT', 'BTC', 'ETH', 'USDC'];
    let totalpath = [];

    const delisted = await findPairs({ status: status.ACTIVE });
    let deletePairs = delisted.pairs || [];

    for (let pair of exchangePairs) {
      const [raw1, raw2] = pair.split('-');

      const [exchange1, exchange2] = await Promise.all([
        exchangeData({ exchangeName: raw1, status: "ACTIVE" }),
        exchangeData({ exchangeName: raw2, status: "ACTIVE" })
      ]);

      if (!exchange1 || !exchange2) continue;

      const t1 = exchange1.exchangeName;
      const t2 = exchange2.exchangeName;

      const all_tickers = [{ [t1]: exchange1.tickers, [t2]: exchange2.tickers }];
      const all_tradefee = [{ [t1]: exchange1.tradeFee, [t2]: exchange2.tradeFee }];
      const all_withdrawfee = [{ [t1]: exchange1.withdrawFee, [t2]: exchange2.withdrawFee }];

      const [token1, token2] = await Promise.all([
        arbitragefunction.get_available_tokens_update(t1, startTokens, all_tickers),
        arbitragefunction.get_available_tokens_update(t2, startTokens, all_tickers)
      ]);

      const mergedTokens = Object.assign({}, token1, token2);
      const filteredTokens = await arbitragefunction.filter_tokens(mergedTokens, startTokens);

      const [top1, top2] = await Promise.all([
        arbitragefunction.after_filter(t1, filteredTokens, exchange1.tickers),
        arbitragefunction.after_filter(t2, filteredTokens, exchange2.tickers)
      ]);

      const mergedFiltered = Object.assign({}, top1, top2);

      const result = await arbitragefunction.cal_arbitrage_paths_directPooling(
        mergedFiltered, startTokens, capital, all_withdrawfee, all_tickers, all_tradefee
      );

      if (Array.isArray(result)) {
        totalpath.push(...result);
      }
    }

    // Remove unwanted coins
    const coinremove = [...new Set([
      'BNB', 'XRP', 'LUNA', 'TFUEL', 'XLM', 'IOST', 'KAVA', 'XEM', 'HBAR', 'MDX',
      ...deletePairs
    ])];

    totalpath = totalpath.filter(item => !coinremove.includes(item.base));

    // Remove KSM and FIL if Binance is involved
    totalpath = totalpath.filter(item => {
      if (item.base === 'KSM' || item.base === 'FIL') {
        return !(item.buy === 'Binance' || item.sell === 'Binance');
      }
      return true;
    });

    // Sort by highest profit
    totalpath.sort((a, b) => b.profit - a.profit);

    const obj = {
      arbitrageName: arbitrage.DirectArbitrage,
      path: totalpath
    };

    console.log(arbitrage.DirectArbitrage, '========>>>Update', totalpath.length);
    return { responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: obj };

  } catch (e) {
    console.log("146 ==>", e);
    return { arbitrageName: arbitrage.DirectArbitrage, path: [] };
  }
};


var getIntraPooling = async function () {
  try {
    var array = [
      'Binance-Huobi',
      'Binance-Coinbase',
      'Huobi-Binance',
      'Huobi-Coinbase',
      'Coinbase-Binance',
      'Coinbase-Huobi',
    ];

    let capitalAmountRes = await findCapitalAmount({});
    let amountRes = capitalAmountRes.loop || 1000;

    const startToken = ['USDT', 'BTC', 'ETH'];
    const capital = Number(amountRes);
    let totalpath = [];

    for (let token of array) {
      const [t1Raw, t2Raw] = token.split('-');
      const exchange1 = await exchangeData({ exchangeName: t1Raw, status: "ACTIVE" });
      const exchange2 = await exchangeData({ exchangeName: t2Raw, status: "ACTIVE" });

      if (!exchange1 || !exchange2) continue;

      const t1 = exchange1.exchangeName;
      const t2 = exchange2.exchangeName;

      const tickers1 = exchange1.tickers || {};
      const tickers2 = exchange2.tickers || {};

      const tokens = { [t1]: tickers1, [t2]: tickers2 };
      const all_tickers = [tokens];

      const trade = { [t1]: exchange1.tradeFee, [t2]: exchange2.tradeFee };
      const all_tradefee = [trade];

      // Reset scoped variables per pair
      let token1 = {};
      let token2 = {};
      let top1 = {};
      let top2 = {};

      if (t1) token1 = await arbitragefunction.get_available_tokens_update(t1, startToken, all_tickers);
      if (t2) token2 = await arbitragefunction.get_available_tokens_update(t2, startToken, all_tickers);

      const mergedTokens = Object.assign({}, token1, token2);
      const filteredTokens = await arbitragefunction.filter_tokens(mergedTokens, startToken);

      if (t1) top1 = await arbitragefunction.after_filter(t1, filteredTokens, tickers1);
      if (t2) top2 = await arbitragefunction.after_filter(t2, filteredTokens, tickers2);

      const mergedFiltered = Object.assign({}, top1, top2);

      const result = await arbitragefunction.cal_arbitrage_paths_intraPooling(
        mergedFiltered,
        startToken,
        capital,
        all_tickers,
        all_tradefee
      );

      if (Array.isArray(result)) {
        totalpath.push(...result); // flatten during push
      }
    }

    totalpath.sort((a, b) => b.profit - a.profit);

    const obj = {
      arbitrageName: arbitrage.IntraArbitrage,
      path: totalpath
    };

    console.log('Intra Arbitrage========>>>Save');
    return { responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: obj };
  } catch (e) {
    console.log("146 ==>", e);
    return { arbitrageName: arbitrage.IntraArbitrage, path: [] }; // safe fallback
  }
};


let threeTriangularProfitPathsCronPooling = async () => {
  try {
    let capitalAmountRes = await findCapitalAmount({});
    let amountRes = capitalAmountRes.triangular || 1000;

    let exchanges = ['Binance', 'Mexc', 'Kraken', 'Bitmart', "Coinbase"];
    let resultArray = [];

    for (let exchange of exchanges) {
      let threePaths = await triangularProfitPaths(exchange, '', '', '', '', '3', Number(amountRes));

      let threeObj = {
        arbitrageName: arbitrage.TriangularArbitrage,
        exchange: exchange,
        depthOfArbitrage: 3,
        path: threePaths
      };

      console.log('Depth 3 Object updated.==>', exchange, threePaths.length);
      resultArray.push(threeObj);
    }

    return { responseCode: 200, responseMessage: "Data fetched successfully!", responseResult: resultArray };
  } catch (error) {
    console.log('348 ==>', error);
    return [];
  }
};


module.exports ={
    getDirectPooling,getIntraPooling,threeTriangularProfitPathsCronPooling
}