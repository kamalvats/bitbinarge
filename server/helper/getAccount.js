import Binance from 'node-binance-us-api';
import util from 'util';
import request from 'request';
import crypto from 'crypto';
import CryptoJS from 'crypto-js'
// import Kucoin from 'kucoin-node-api';
import Huobi from '../helper/huobiGlobalAPI';
// import Okex from '../helper/okexAPI';
import { Kraken } from 'node-kraken-api';
const requestPromise = util.promisify(request);
// import Cexio from 'cexio-api-node';
import Coinbase from 'coinbase-pro';
import exchangeModel from '../models/exchange';
const notificationModel = require('../models/notification');
import myIPAddress from 'what-is-my-ip-address';
const axios = require('axios');
import coinbaseSignature from './coinbaseSignature';


module.exports = {
    getAccount: async (exchange, apiKey, secretKey, passphrase, clientId, userId, api_memo) => {
        // console.log('23 ==>', exchange, apiKey, secretKey, passphrase, clientId, userId)
        let tickers = await exchangeModel.findOne({ exchangeName: exchange }).select('tickers');
        tickers = tickers['_doc']['tickers'];
        try {
            switch (exchange) {
                case 'Binance':
                    try {
                        let time1 = await axios({
                            method: 'get',
                            url: 'https://api4.binance.com/api/v3/time'
                        })
                        const serverTime1 = time1.data.serverTime;
                        function generate_signature1(serverTime1) {
                            const message = `timestamp=` + serverTime1
                            return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                        }
                        let sec1 = generate_signature1(serverTime1)
                        let string1 = `timestamp=` + serverTime1;

                        var config1 = {
                            method: 'get',
                            url: "https://api4.binance.com/api/v3/account?" + string1 + "&signature=" + sec1,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'X-MBX-APIKEY': apiKey,
                            }
                        };
                        let result = await axios(config1)
                        let accountBalance = [];
                        let totalBalance = 0;
                        if (result.status == 200) {
                            for (let value of result.data.balances) {
                                if (parseFloat(value.free) > 0.00001) {
                                    if (value.asset != 'USD' && value.asset != 'NFT' && value.asset != 'USDT') {
                                        if (tickers[value.asset + "USDT"]) {
                                            let price = tickers[value.asset + "USDT"]['price'];
                                            let asset_total = parseFloat(price) * parseFloat(value.free)
                                            totalBalance += asset_total
                                            obj = { asset: value.asset, free: value.free, locked: value.locked, total: asset_total }
                                            accountBalance.push(obj)
                                        }
                                    } else {
                                        let asset_total = parseFloat(value.free)
                                        totalBalance += asset_total
                                        obj = { asset: value.asset, free: value.free, locked: value.locked, total: asset_total }
                                        accountBalance.push(obj)
                                    }
                                }
                            }
                            accountBalance.push({ 'totalBalance': totalBalance });
                            // console.log('359 Binance Balance==>', accountBalance)
                            return accountBalance;
                        }
                    } catch (error) {
                        // console.log('Binance getAccount catch error :', error);
                        // console.log();
                        console.log(error.message);
                        var obj = {
                            userId: userId
                        }
                        if (error.message == 'Invalid API-key, IP, or permissions for action.') {
                            obj['title'] = `Please check your API and Secret keys are correct of Binance exchange account,make sure our server's IP address: (${myIP}) is whitelisted in your exchange account as well as check your account permitted for the trading.`;
                        } else if (error.message == 'API-key format invalid.') {
                            obj['title'] = `Please check your API key is correct of Binance exchange account.`;
                        } else if (error.message == 'Signature for this request is not valid.') {
                            obj['title'] = `Please check your Secret key is correct of Binance exchange account.`;
                        }
                        if (obj['title']) { await notificationModel(obj).save(); }
                    }
                    break;
                case 'Huobi':
                    try {
                        let accountSpotId;
                        let accountBalance = [];
                        let totalBalance = 0;
                        let huobiAccount = await Huobi.get_account(apiKey, secretKey);
                        if (huobiAccount) {
                            huobiAccount.map((data) => {
                                if (data.type == 'spot') {
                                    accountSpotId = data.id;
                                }
                            })
                        }
                        // console.log('239 ==>', accountSpotId)
                        let huobiBalance = await Huobi.get_balance(accountSpotId, apiKey, secretKey);
                        if (huobiBalance) {
                            for (let asset of huobiBalance.list) {
                                if (asset.balance != '0') {
                                    if (asset.currency != 'usdt') {
                                        if (tickers[(asset.currency + 'usdt').toUpperCase()]) {
                                            let obj = {
                                                'asset': (asset.currency).toUpperCase(),
                                                'free': asset.balance,
                                                'total': parseFloat(asset.balance) * parseFloat(tickers[(asset.currency + 'usdt').toUpperCase()].price)
                                            }
                                            totalBalance = parseFloat(obj.total) + parseFloat(totalBalance)
                                            accountBalance.push(obj)
                                            continue;
                                        }
                                        else {
                                            let obj = {
                                                'asset': (asset.currency).toUpperCase(),
                                                'free': asset.balance,
                                                'total': parseFloat(asset.balance)
                                            }
                                            accountBalance.push(obj)
                                            continue;
                                        }
                                    } else {
                                        let obj = {
                                            'asset': (asset.currency).toUpperCase(),
                                            'free': asset.balance,
                                            'total': asset.balance
                                        }
                                        totalBalance = parseFloat(obj.total) + parseFloat(totalBalance)
                                        accountBalance.push(obj)
                                        continue;
                                    }
                                }
                            }
                        }
                        accountBalance.push({ 'totalBalance': totalBalance })
                        // console.log('279 ==>',accountBalance, 279);
                        return accountBalance;
                    } catch (error) { console.log('Huobi getAccount catch error :', error) }
                    break;
                case 'Coinbase':
                    try {
                        let accountBalance = [];
                        let totalBalance = 0;
                        let token = await coinbaseSignature.signatureGenerate(apiKey, secretKey, "GET", "/api/v3/brokerage/accounts")
                        var config = {
                            method: 'get',
                            url: 'https://api.coinbase.com/api/v3/brokerage/accounts',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            }
                        }
                        let result = await axios(config)
                        if (result.status == 200) {
                            let accounts = result.data.accounts
                            if (result.data.has_next == true) {
                                for (let i = 0; i < 1000; i++) {
                                    let result1 = await axios(config)
                                    if (result1.status == 200) {
                                        if (result.data.has_next == true) {
                                            for (const obj of result.data.accounts) {
                                                accounts.push(obj)
                                            }
                                        } else {
                                            break
                                        }
                                    }
                                }
                            }
                            for (const asset of accounts) {
                                if (asset.currency != 'USDC' && asset.currency != 'USDT' && asset.currency != 'USD' && asset.currency != 'NFT') {
                                    if (tickers[asset.currency + "USDT"]) {
                                        let price = tickers[asset.currency + "USDT"]['price'];
                                        let asset_total = parseFloat(price) * parseFloat(asset.available_balance.value)
                                        totalBalance += asset_total
                                        obj = { asset: asset.currency, free: asset.available_balance.value, locked: asset.hold.value, total: asset_total }
                                        accountBalance.push(obj)
                                    }
                                } else {
                                    let asset_total = parseFloat(asset.available_balance.value)
                                    totalBalance += asset_total
                                    obj = { asset: asset.currency, free: asset.available_balance.value, locked: asset.hold.value, total: asset_total }
                                    accountBalance.push(obj)
                                }
                            }
                            accountBalance.push({ 'totalBalance': totalBalance })
                            return accountBalance;
                        }
                    } catch (error) {
                        console.log('coinbase pro catch error :', error);
                        console.log();
                    }
                    break;
                case 'Kraken':
                    try {
                        function getKrakenSignature(urlPath, data, secret) {
                            let encoded;

                            if (typeof data === 'string') {
                                const jsonData = JSON.parse(data);
                                encoded = jsonData.nonce + data;
                            } else if (typeof data === 'object') {
                                // Construct the data string manually without using querystring
                                const dataStr = Object.entries(data)
                                    .map(([key, value]) => `${key}=${value}`)
                                    .join('&');
                                encoded = data.nonce + dataStr;
                            } else {
                                throw new Error('Invalid data type');
                            }

                            // Create SHA256 hash of the encoded string
                            const sha256Hash = crypto.createHash('sha256').update(encoded).digest();

                            // Create the HMAC signature
                            const message = urlPath + sha256Hash.toString('binary');
                            const secretBuffer = Buffer.from(secret, 'base64');
                            const hmac = crypto.createHmac('sha512', secretBuffer);
                            hmac.update(message, 'binary');
                            const signature = hmac.digest('base64');
                            return signature;
                        }
                        let data = JSON.stringify({
                            "nonce": Date.now() * 1000
                        });
                        const signature = getKrakenSignature('/0/private/BalanceEx', data, secretKey);
                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://api.kraken.com/0/private/BalanceEx',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'API-Key': apiKey,
                                'API-Sign': signature
                            },
                            data: data
                        };

                        let result = await axios(config)
                        let accountBalance = [];
                        let totalBalance = 0;
                        if (result.status == 200) {
                            if (result.data.result) {
                                for (let [key, value] of Object.entries(result.data.result)) {
                                    let key1 = key
                                    if (key.endsWith('.F')) {
                                        key1 = key.replace('.F', '');
                                    }
                                    if (key.startsWith('X')) {
                                        key1 = key.replace('X', '');
                                    }
                                    if (parseFloat(result.data.result[key].balance) > 0.00000001) {
                                        if (key1 != 'USDT' && key1 != 'NFT' && key1 != "ZUSD" && key1 != "XBT") {
                                            let price = 0;
                                            if (tickers[key1 + "USDT"]) {
                                                price = tickers[key1 + "USDT"]['price'];
                                            }
                                            else if (tickers[key1 + "USD"]) {
                                                price = tickers[key1 + "USD"]['price'];
                                            }
                                            let asset_total = parseFloat(price) * parseFloat(result.data.result[key].balance)
                                            totalBalance += asset_total
                                            obj = { asset: key1, free: result.data.result[key].balance, locked: result.data.result[key].hold_trade, total: asset_total }
                                            accountBalance.push(obj)
                                        } else {
                                            let asset_total = parseFloat(result.data.result[key].balance)
                                            totalBalance += asset_total
                                            obj = { asset: key1, free: result.data.result[key].balance, locked: result.data.result[key].hold_trade, total: asset_total }
                                            accountBalance.push(obj)
                                        }
                                    }
                                }
                                accountBalance.push({ 'totalBalance': totalBalance });
                                // console.log('359 Kraken Balance==>', accountBalance)
                                return accountBalance;
                            } else {
                                console.log("Kraken getAccount error:", result.data)
                            }
                        }

                        // const kraken = new Kraken({
                        //     key: apiKey,
                        //     secret: secretKey,
                        //     gennonce: () => Date.now() * 1000,
                        //     timeout: 10000
                        // });
                        // let result = await kraken.balance();
                        // let accountBalance = [];
                        // let totalBalance = 0;
                        // if (result) {
                        //     for (let [key, value] of Object.entries(result)) {
                        //         if (key.startsWith('X')) {
                        //             key = key.replace('X', '');
                        //         }
                        //         if (parseFloat(value) > 0.00001) {
                        //             if (key != 'USDT' && key != 'NFT' && key != "ZUSD" && key != "XBT") {
                        //                 let price = 0;
                        //                 if (tickers[key + "USDT"]) {
                        //                     price = tickers[key + "USDT"]['price'];
                        //                 }
                        //                 else if (tickers[key + "USD"]) {
                        //                     price = tickers[key + "USD"]['price'];
                        //                 }
                        //                 let asset_total = parseFloat(price) * parseFloat(value)
                        //                 totalBalance += asset_total
                        //                 obj = { asset: key, free: value, locked: 0, total: asset_total }
                        //                 accountBalance.push(obj)
                        //             } else {
                        //                 let asset_total = parseFloat(value)
                        //                 totalBalance += asset_total
                        //                 obj = { asset: key, free: value, locked: 0, total: asset_total }
                        //                 accountBalance.push(obj)
                        //             }
                        //         }
                        //     }
                        //     accountBalance.push({ 'totalBalance': totalBalance });
                        //     // console.log('359 Kraken Balance==>', accountBalance)
                        //     return accountBalance;
                        // }
                    } catch (error) { console.log('Kraken getAccount catch error :', error) }
                    break;
                case 'Mexc':
                    try {
                        let accountBalance = [];
                        let totalBalance = 0;
                        let time = await axios({
                            method: 'get',
                            url: 'https://api.mexc.com/api/v3/time'
                        })
                        const serverTime = time.data.serverTime;
                        // const serverTime = get_timestamp()
                        function generate_signature(serverTime) {
                            const message = 'timestamp=' + serverTime
                            return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                        }
                        let sec = generate_signature(serverTime)
                        let string = 'timestamp=' + serverTime;
                        var config = {
                            method: 'get',
                            url: "https://api.mexc.com/api/v3/account?" + string + "&signature=" + sec,
                            headers: {
                                // 'Content-Type': 'application/x-www-form-urlencoded',
                                'X-MEXC-APIKEY': apiKey,
                            }
                        };
                        let data = await axios(config)
                        if (data.status == 200) {
                            if (data.data.balances) {
                                let obj
                                for (let asset of data.data.balances) {
                                    if (asset.asset != 'USDT' && asset.asset != 'NFT') {
                                        let price = await convertProfitPriceForMexc(asset.asset + "USDT")
                                        // if (tickers[asset.asset + "USDT"]) {
                                        // let price = tickers[asset.asset + "USDT"]['price'];
                                        obj = {
                                            'asset': asset.asset,
                                            'free': asset.free,
                                            'locked': asset.locked,
                                            'total': parseFloat(price) * parseFloat(asset.free)
                                        }
                                        totalBalance = (parseFloat(price) * parseFloat(asset.free)) + totalBalance
                                        accountBalance.push(obj)
                                        continue;
                                        // }
                                    } else {
                                        obj = {
                                            'asset': asset.asset,
                                            'free': asset.free,
                                            'locked': asset.locked,
                                            'total': parseFloat(asset.free)
                                        }
                                        totalBalance = parseFloat(asset.free) + totalBalance
                                        accountBalance.push(obj)
                                        continue;
                                    }
                                }
                                accountBalance.push({ totalBalance: totalBalance });
                                return accountBalance
                            }
                        }
                    } catch (error) {
                        console.log('Mexc getAccount catch error :', error);
                        console.log();
                    }
                    break;
                case 'Bitmart':
                    try {
                        let time = await axios({
                            method: 'get',
                            url: 'https://api-cloud.bitmart.com/system/time'
                        })
                        const timestamp = time.data.data.server_time;
                        function generate_signature(timestamp) {
                            const message = `${timestamp}#${api_memo}`;
                            return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                        }
                        let sec = generate_signature(timestamp)
                        var config = {
                            method: 'get',
                            url: 'https://api-cloud.bitmart.com/spot/v1/wallet',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-BM-KEY': apiKey,
                                'X-BM-TIMESTAMP': timestamp,
                                'X-BM-SIGN': sec,
                            }
                        };
                        let accountBalance = [];
                        let totalBalance = 0;
                        let dataRes = await new Promise((resolve, reject) => {
                            axios(config)
                                .then(function (response) {
                                    let data = response.data.data.wallet
                                    if (data.length != 0) {
                                        for (let asset of data) {
                                            let obj
                                            if (asset.id != 'USDT' && asset.id != 'NFT') {
                                                if (tickers[asset.id + "USDT"]) {
                                                    let price = tickers[asset.id + "USDT"]['price'];
                                                    obj = {
                                                        'asset': asset.id,
                                                        'free': asset.available,
                                                        'locked': asset.frozen,
                                                        'total': parseFloat(price) * parseFloat(asset.available)
                                                    }
                                                    totalBalance = (parseFloat(price) * parseFloat(asset.available)) + totalBalance
                                                    accountBalance.push(obj)
                                                    continue;
                                                }
                                            } else {
                                                obj = {
                                                    'asset': asset.id,
                                                    'free': asset.available,
                                                    'locked': asset.frozen,
                                                    'total': parseFloat(asset.available)
                                                }
                                                totalBalance = parseFloat(asset.available) + totalBalance
                                                accountBalance.push(obj)
                                                continue;
                                            }
                                        }
                                        accountBalance.push({ totalBalance: totalBalance });
                                        resolve(accountBalance);
                                    } else {
                                        accountBalance.push({ totalBalance: totalBalance });
                                        resolve(accountBalance);
                                    }
                                })
                                .catch(function (error) {
                                    reject(error);
                                });
                        });
                        return dataRes
                    } catch (error) {
                        console.log('Bitmart getAccount catch error :', error);
                        console.log();
                    }
                    break;
            }
        } catch (error) {
            console.log('getAccount Catch ==> 256 -->', error);
        }
    }
}
async function convertProfitPriceForMexc(symbol) {
    var config = {
        method: 'get',
        url: `https://api.mexc.com/api/v3/ticker/24hr?symbol=${symbol}`,
        headers: {}
    };
    let mexcTickers = await axios(config)
    if (mexcTickers.status == 200) {
        return mexcTickers.data.lastPrice
    }
}

async function convertProfitPriceForKraken(symbol) {
    var config = {
        method: 'get',
        url: `https://api.kraken.com/0/public/Ticker?pair=${symbol}`,
        headers: {}
    };
    let krakenTickers = await axios(config)
    if (krakenTickers.status == 200) {
        return krakenTickers.data.result[symbol].c[0]
    }
}


async function geminiFunction() {
    try {
        let serverTime1 = new Date().getTime()
        console.log("===========================>>>>>>>>>", serverTime1)
        let payload = {
            request: "/v1/balances",
            nonce: serverTime1
        }
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const signatureResult = crypto.createHmac('sha384', '2qAfLVjht5gHtEsDzpeXi3jCmEGf').update(encodedPayload).digest(`hex`);


        console.log("============================>>>", encodedPayload)

        console.log("============================>>>", signatureResult)
        var config = {
            method: 'post',
            url: `https://api.gemini.com/v1/balances`,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': '0',
                'X-GEMINI-APIKEY': 'master-QMJD3LdEJdLIP82MhHzT',
                'X-GEMINI-PAYLOAD': encodedPayload,
                'X-GEMINI-SIGNATURE': signatureResult,
                'Cache-Control': 'no-cache'
            }
        };
        let geminiRes = await axios(config)
        console.log("==================================>>>>>", geminiRes.data)
    } catch (error) {
        console.log("====================>>>>>", error)
    }
}

// geminiFunction()