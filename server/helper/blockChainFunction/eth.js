let blockChainFunctionController = require('../../api/v1/controllers/cronjob/blockChainFunctionController')
const bip39 = require('bip39');
const {
    hdkey
} = require('ethereumjs-wallet');
const ethers = require('ethers');
import Web3 from "web3"
const web3Ether = new Web3(blockChainFunctionController.etherRPC);
const web3Fiero = new Web3(blockChainFunctionController.fieroRPC);
const EthereumTx = require("ethereumjs-tx").Transaction;
const common = require("ethereumjs-common");
import axios from "axios"
module.exports = {
    async generateFieroWalletAddress(count) {
        try {
            const myContract = new web3Fiero.eth.Contract(blockChainFunctionController.fieroDepositABI, blockChainFunctionController.fieroContractAddress);
            let result = await myContract.methods.createWallet(count).call()
            let obj = { address: result, status: true }
            return obj
        } catch (error) {
            console.log("error ==  >>generateFieroWalletAddress", error)
            let obj = { address: "", status: false }
            return obj
        }
    },
    async generateUsdWalletAddress(count) {
        try {
            const myContract = new web3Ether.eth.Contract(blockChainFunctionController.bnbDepositABI, blockChainFunctionController.etherContractAddress);
            let result = await myContract.methods.createWallet(count).call()
            let obj = { address: result, status: true }
            return obj
        } catch (error) {
            console.log("error ==  >>generateFieroWalletAddress", error)
            let obj = { address: "", status: false }
            return obj
        }
    },
    async getBalanceMulti(fieroWalletAddresses, usdWalletAddress) {
        try {
            const myContract = new web3Ether.eth.Contract(blockChainFunctionController.etherTokenAbi, blockChainFunctionController.tokenContract);
            let [userBalance, response] = await Promise.all([
                myContract.methods.balanceOf(usdWalletAddress).call(),
                web3Fiero.eth.getBalance(fieroWalletAddresses)
            ])
            userBalance = web3Ether.utils.fromWei(userBalance, 'ether');
            let obj = {
                usdt_amount: parseFloat(userBalance),
                fiero_amount: parseFloat(response)
            }

            return obj;
        } catch (error) {
            console.log("getBalanceMulti===>>>", error)
        }
    },

    async getTransactionDetailForUsd(txHash) {
        try {
            console.log("=dfkdskfkdsfkdsjfkdsjfkjdskfdsf",txHash)
            const receipt = await web3Ether.eth.getTransactionReceipt(txHash);
            const transaction = await web3Ether.eth.getTransaction(txHash)
            const block = await web3Ether.eth.getBlock(receipt.blockNumber);
            if (transaction) {
                const toAddress = transaction.to.toLowerCase();
                if (toAddress === blockChainFunctionController.etherContractAddress.toLowerCase()) {
                    const input = transaction.input;
                    const methodId = input.slice(0, 10);
                    if (methodId === '0x47e7ef24') {
                        const recipient = '0x' + input.slice(34, 74);
                        const value = web3Ether.utils.toBN('0x' + input.slice(74));
                        const recipientAddress = web3Ether.utils.toChecksumAddress(recipient);
                        const ethAmount = web3Ether.utils.fromWei(value.toString(), 'ether');
                        return { ethAmount: ethAmount, status: receipt.status, to: receipt.to, from: receipt.from, timestamp: block.timestamp, recipientAddress: recipientAddress.toString() }
                    }
                } else {
                    console.log('This transaction is not a token transfer.');
                    return { status: false }
                }
            }
        } catch (error) {
            console.log("=================>>>>>error",error)
            return { status: false }
        }
    },
    async getTransactionDetailForFiero(txHash) {
        try{
            const receipt = await web3Fiero.eth.getTransactionReceipt(txHash);
            
            const transaction = await web3Fiero.eth.getTransaction(txHash)           
            const block = await web3Fiero.eth.getBlock(receipt.blockNumber);
            if (transaction) {
                const toAddress = transaction.to.toLowerCase();
                if (toAddress === blockChainFunctionController.fieroContractAddress.toLowerCase()) {
                    const input = transaction.input;
                    const methodId = input.slice(0, 10);
                    if (methodId === '0xf340fa01') {
                        const recipient = '0x' + input.slice(34, 74);
                        const recipientAddress = web3Fiero.utils.toChecksumAddress(recipient);
                        const ethAmount = web3Fiero.utils.fromWei(transaction.value.toString(), 'ether');
                        return { ethAmount:ethAmount, status: receipt.status, to: receipt.to, from: receipt.from, timestamp: block.timestamp, recipientAddress: recipientAddress.toString() }
                    }
                } else {
                    console.log('This transaction is not a token transfer.');
                    return { status: false }
                }
            }
        }catch (error) {
            console.log("=================>>>>>error",error)
            return { status: false }
        }
    }
}
