const Binance = require("binance-api-node").default;
const util = require('util');
const axios = require('axios');
const request = require('request');
const requestPromise = util.promisify(request);
const crypto = require('crypto');
const Huobi = require('../helper/huobiGlobalAPI');
import Coinbase from '../helper/coinbase-pro/index'
const Mexc = require('node-mexc-api').default;
import { Kraken } from 'node-kraken-api';
import coinbaseSignature from "./coinbaseSignature";

module.exports = {
    triangularOrderDetails: async (exchange, apiKey, secretKey, orderId, symbol, customerId, api_memo, passPhrase) => {
        switch (exchange) {
            case 'Binance':
                try {
                    // let time = await axios({
                    //     method: 'get',
                    //     url: 'https://api4.binance.com/api/v3/time'
                    // })
                    
                    const serverTime = new Date().getTime();
                    function generate_signature(serverTime) {
                        const message = `symbol=${symbol}&orderId=${orderId}&timestamp=` + serverTime;
                        return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                    }
                    let sec = generate_signature(serverTime)
                    let string = `symbol=${symbol}&orderId=${orderId}&timestamp=` + serverTime;
                    var config = {
                        method: 'get',
                        url: "https://api4.binance.com/api/v3/order?" + string + "&signature=" + sec,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'X-MBX-APIKEY': apiKey,
                        }
                    };
                    let getOrderData = await axios(config)
                    if (getOrderData.status == 200) {
                        getOrderData = getOrderData.data
                        // console.log("biance triangular order details", getOrderData)
                        return getOrderData;
                    }
                }
                catch (error) {
                    console.log(error);
                }
                break;
            case 'Huobi':
                let orderData = await Huobi.get_order(apiKey, secretKey, orderId);
                // console.log('152 ==>', orderData);
                return orderData;
                break;
            case 'Coinbase':
                try {
                    let token = await coinbaseSignature.signatureGenerate(apiKey, secretKey, "GET", `/api/v3/brokerage/orders/historical/${orderId}`)
                    var config = {
                        method: 'get',
                        url: `https://api.coinbase.com/api/v3/brokerage/orders/historical/${orderId}`,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'CB-VERSION': '2024-07-06'
                        }
                    };
                    let orderDetails = await axios(config)
                    if (orderDetails.status = 200) {
                        // console.log("coinbase OrderStatus triangular order details 100  ==>", orderDetails)
                        return orderDetails.data.order
                    }
                } catch (err) {
                    console.log("coinbase OrderStatus error==>79", err,)
                    // return { status: "cancelled" }
                }
                break;
            case 'Kraken':
                try {
                    let options = {
                        key: apiKey,
                        secret: secretKey,
                        gennonce: () => new Date().getTime() * 1000,
                        timeoutMs: 5000
                    }
                    const krakenClient = new Kraken(options);
                    return await krakenClient.queryOrders({ txid: orderId }).then((orderDetails) => {
                        // console.log("kraken OrderStatus  95-==>", orderDetails[orderId], 210)
                        return orderDetails[orderId]
                    })

                } catch (e) {
                    console.log('98 ==>', e)
                    // return { status: false }
                }
                break;
            case 'Mexc':
                try {

                    // let time = await axios({
                    //     method: 'get',
                    //     url: 'https://api.mexc.com/api/v3/time'
                    // })
                    const serverTime = new Date().getTime();
                    function generate_signature(serverTime) {
                        const message = `symbol=${symbol}&orderId=${orderId}&timestamp=` + serverTime;
                        return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                    }
                    let sec = generate_signature(serverTime)
                    let string = `symbol=${symbol}&orderId=${orderId}&timestamp=` + serverTime;
                    var config = {
                        method: 'get',
                        url: "https://api.mexc.com/api/v3/order?" + string + "&signature=" + sec,
                        headers: {
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                            'X-MEXC-APIKEY': apiKey,
                        }
                    };
                    let result = await axios(config)
                    if (result.status == 200) {
                        return result.data
                    }
                }
                catch (error) {
                    console.log(error);
                }
                break;
            case 'Bitmart':
                try {
                    function get_timestamp() {
                        return new Date().getTime().toString();
                    }
                    function generate_signature(timestamp, body) {
                        const message = `${timestamp}#${api_memo}#${body}`;
                        return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                    }
                    async function order_details() {
                        const body = {
                            orderId: orderId
                        };
                        const path = `https://api-cloud.bitmart.com/spot/v4/query/order`;
                        const timestamp = get_timestamp();
                        // let queryString = { "order_id": orderId }
                        const headers = {
                            'Content-Type': 'application/json',
                            'X-BM-KEY': apiKey,
                            'X-BM-TIMESTAMP': timestamp,
                            'X-BM-SIGN': generate_signature(timestamp, JSON.stringify(body)),
                        };
                        try {
                            const response = await axios.post(path, body, { headers });
                            return response
                        } catch (error) {
                            console.error(`Error: buy`, error);
                        }
                    }

                    let result = await order_details();
                    if (result.status == 200) {
                        return result.data.data
                    }
                    //  ====================WORKING OLD VERSION=================
                    // function get_timestamp() {
                    //     return new Date().getTime().toString();
                    // }
                    // function generate_signature(timestamp) {
                    //     const message = `${timestamp}#${api_memo}`;
                    //     return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
                    // }
                    // async function order_details() {
                    //     const path = `https://api-cloud.bitmart.com/spot/v2/order_detail?order_id=${orderId}`;
                    //     const timestamp = get_timestamp();
                    //     // let queryString = { "order_id": orderId }
                    //     const headers = {
                    //         'Content-Type': 'application/json',
                    //         'X-BM-KEY': apiKey,
                    //         'X-BM-TIMESTAMP': timestamp,
                    //         'X-BM-SIGN': generate_signature(timestamp),
                    //     };
                    //     try {
                    //         const response = await axios.get(path, { headers });
                    //         return response
                    //     } catch (error) {
                    //         console.error(`Error: buy`, error);
                    //     }
                    // }

                    // let result = await order_details();
                    // if (result.status == 200) {
                    //     return result.data.data
                    // }
                } catch (error) {
                    console.log('208 ==>', error)
                }
                break;
        }
    }
}

