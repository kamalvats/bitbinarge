import axios from 'axios';
let baseUrl ="https://aedgardo.com/astroqunt"

const createAddress =async(member_id,api_key)=>{
try {
    let result = await axios.post(`${baseUrl}/create-address.php`,{member_id:member_id,api_key:api_key})
    return {result:result.data,status:true}
} catch (error) {
    console.log("createAddress====>>><<<>><><", error)
    // throw error;
    return {status:false,result:error.message}
}
}

const deposit =async(member_id,api_key)=>{
   try {
    let result = await axios.post(`${baseUrl}/deposit.php`,{member_id:member_id,api_key:api_key})
    return {result:result.data,status:true}
} catch (error) {
    console.log("deposit====>>><<<>><><", error)
    // throw error;
    return {status:false,result:error.message}
} 
}

const getWalletBalance =async(member_id,api_key)=>{
   try {
    let result = await axios.post(`${baseUrl}/get-fund-wallet-balance.php`,{member_id:member_id,api_key:api_key})
    return {result:result.data,status:true}
} catch (error) {
    console.log("getFundBalance====>>><<<>><><", error)
    // throw error;
    return {status:false,result:error.message}
} 
}

const deduction =async(member_id,amount,api_key,wallet,type)=>{
   try {
    let result = await axios.post(`${baseUrl}/wallet-credit-debit.php`,{member_id,api_key,amount,wallet,type})
    return {result:result.data,status:true}
} catch (error) {
    console.log("deduction====>>><<<>><><", error)
    // throw error;
    return {status:false,result:error.message}
} 
}

const withDraw =async(member_id,api_key,amount,to_address)=>{
   try {
    let result = await axios.post(`${baseUrl}/withdraw.php`,{member_id,api_key,amount,to_address})
    return {result:result.data,status:true}
} catch (error) {
    console.log("withdraw====>>><<<>><><", error)
    // throw error;
    return {status:false,result:error.message}
} 
}


export default {createAddress,deposit,getWalletBalance,deduction,withDraw}
