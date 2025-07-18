const Binance = require("binance-api-node").default;
// Bitfinex module call
const util = require('util');
const axios = require('axios');
const request = require('request');
const requestPromise = util.promisify(request);
const crypto = require('crypto');
const Huobi = require('../helper/huobiGlobalAPI');
import { Kraken } from 'node-kraken-api';
const Mexc = require('node-mexc-api').default;
const { parse } = require("path");
import Coinbase from 'coinbase-pro';
import coinbaseSignature from "./coinbaseSignature";
module.exports = {
    order_details: async (exchange, apiKey, secretKey, passPhrase, orderId, symbol, api_memo) => {
        switch (exchange) {
            case 'Binance':
                try {
                    let time = await axios({
                        method: 'get',
                        url: 'https://api4.binance.com/api/v3/time'
                    })
                    const serverTime = time.data.serverTime;
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
                        console.log("buy", getOrderData);
                        if (getOrderData.status == 'FILLED') {
                            return { status: true, amount: (parseFloat(getOrderData.executedQty) - (parseFloat(getOrderData.executedQty) * 0.1 / 100)), totalAmount: getOrderData.cummulativeQuoteQty };
                        }
                        else if (getOrderData.status == 'CANCELED' || getOrderData.status == 'REJECTED' || getOrderData.status == 'EXPIRED' || getOrderData.status == 'EXPIRED_IN_MATCH') {
                            return { status: false }
                        }
                        else {
                            return { status: "PENDING" };
                        }
                    }
                }
                catch (error) {
                    console.log(error);
                }
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
                        console.log("coinbase OrderStatus triangular order details 100  ==>", orderDetails)
                        let statusArray = ['CANCELLED', 'FAILED', 'EXPIRED']
                        orderDetails = orderDetails.data
                        if (orderDetails.status == 'FILLED') {
                            return { status: true, amount: (parseFloat(orderDetails.filled_size) - parseFloat(orderDetails.filled_size) * 0.6 / 100), totalAmount: orderDetails.filled_value };
                        } else if (statusArray.includes(orderDetails.status)) {
                            return { status: false }
                        } else {
                            return { status: "PENDING" };
                        }
                    }
                } catch (err) {
                    console.log("coinbase OrderStatus error==>", err,)
                }
                break;
            case 'Huobi':
                try {
                    var orderdata = await Huobi.get_order(apiKey, secretKey, orderId)
                    console.log("Huobi orderDetail", orderdata);
                    if (orderdata.state == 'filled') {
                        var amounts = parseFloat(orderdata.amount - orderdata['field-fees']);
                        return { status: true, amount: amounts, totalAmount: orderdata['field-cash-amount'] };
                    }
                    else if (orderdata.state == 'canceled') {
                        return { status: false };
                    }
                    else if (orderdata.state == 'submitted') {
                        return { status: "PENDING" };
                    }
                }
                catch (error) {
                    console.log(error);
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
                        console.log("kraken OrderStatus  -==>", orderDetails, 210)
                        if (orderDetails[orderId].status == "open") {
                            return { status: "PENDING" }
                        }
                        else if (orderDetails[orderId].status == "closed") {
                            return { status: true, amount: orderDetails[orderId].vol_exec, totalAmount: orderDetails[orderId].cost }
                        }
                        else if (orderDetails[orderId].is_live == false && orderDetails[orderId].is_cancelled == true) {
                            return { status: false }
                        }
                    });

                } catch (e) {
                    console.log('147 ==>', e)
                    // return { status: false }
                }
                break;
            case 'Mexc':
                try {
                    let time = await axios({
                        method: 'get',
                        url: 'https://api.mexc.com/api/v3/time'
                    })
                    const serverTime = time.data.serverTime;
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
                    let data = await axios(config)
                    if (data.status == 200) {
                        console.log("data.datadata.datadata.data", data.data)
                        if (data.data.status == 'FILLED') {
                            return { status: true, amount: data.data.executedQty, totalAmount: data.data.cummulativeQuoteQty }
                        }
                        else if (data.data.status == 'CANCELED') {
                            return { status: false }
                        }
                        else {
                            return { status: "PENDING" };
                        }
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
                        const headers = {
                            'Content-Type': 'application/json',
                            'X-BM-KEY': apiKey,
                            'X-BM-TIMESTAMP': timestamp,
                            'X-BM-SIGN': generate_signature(timestamp, JSON.stringify(body)),
                        };
                        try {
                            const response = await axios.get(path, body, { headers });
                            return response
                        } catch (error) {
                            console.error(`Error: buy`, error);
                        }
                    }

                    let result = await order_details();
                    if (result.status == 200) {
                        console.log("bitmart order response===>>>", result.data.data)
                        if (result.data.data.state == 'filled') {
                            return { status: true, amount: result.data.data.filledSize, totalAmount: result.data.data.filledNotional };
                        }
                        else if (result.data.data.state == 'canceled' || result.data.data.state == 'failed') {
                            return { status: false }
                        }
                        else {
                            return { status: "PENDING" };
                        }
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
                    //     console.log("bitmart order response===>>>", result.data.data)
                    //     if (result.data.data.status == '6') {
                    //         return { status: true, amount: result.data.data.filled_size, totalAmount: result.data.data.filled_notional };
                    //     }
                    //     else if (result.data.data.status == '8') {
                    //         return { status: false }
                    //     }
                    //     else {
                    //         return { status: "PENDING" };
                    //     }
                    // }
                }
                catch (error) {
                    console.log("44F > OrderDetails >>>", error)
                    if (error.response) {
                        return error.response.data.label;
                    }
                }
                break;
        }
    },
}
