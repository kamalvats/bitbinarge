import axios from 'axios';
let baseUrl ="https://aedgardo.com/astroqunt"

const createAddress =async(member_id,api_key)=>{
try {
    let result = await axios.post(`${baseUrl}/create-address.php`,{member_id:member_id,api_key:api_key})
    return result.data
} catch (error) {
    console.log("createAddress====>>><<<>><><", error)
    throw error;
}
}

const deposit =async(member_id,api_key)=>{
   try {
    let result = await axios.post(`${baseUrl}/deposit.php`,{member_id:member_id,api_key:api_key})
    return result.data
} catch (error) {
    console.log("deposit====>>><<<>><><", error)
    throw error;
} 
}

const getFundBalance =async(member_id,api_key)=>{
   try {
    let result = await axios.post(`${baseUrl}/get-fund-wallet-balance.php`,{member_id:member_id,api_key:api_key})
    return result.data
} catch (error) {
    console.log("getFundBalance====>>><<<>><><", error)
    throw error;
} 
}

const deduction =async(member_id,api_key,amount,trxType)=>{
   try {
    let result = await axios.post(`${baseUrl}/create-address.php`,{member_id:member_id,api_key:api_key,amount,trxType})
    return result.data
} catch (error) {
    console.log("deduction====>>><<<>><><", error)
    throw error;
} 
}


export {createAddress,deposit,getFundBalance,deduction}
