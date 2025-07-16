import {
    credentialServices
} from "../api/v1/services/credentials";
const {
    updateCredentials,
    listCredentials,
    findCredentials
} = credentialServices

module.exports={
    nowPaymentApiKey:async()=>{
        let nowPayment =await findCredentials({title:"nowPayment"})
        return nowPayment.nowPaymentApiKey
    },
    nowPaymentUrl:async()=>{
        let nowPayment =await findCredentials({title:"nowPayment"})
        return nowPayment.nowPaymentUrl
    },
    nowPaymentCallbackUrl: async()=>{
        let nowPayment =await findCredentials({title:"nowPayment"})
        return nowPayment.nowPaymentCallbackUrl
    },

    sendGridKey: async()=>{
        let nowPayment =await findCredentials({title:"sendGrid"})
        return nowPayment.sendGridKey
    },

    trustPaymentUrl: async()=>{
        let nowPayment =await findCredentials({title:"trustPayment"})
        return nowPayment.trustPaymentUrl
    },
    trustPaymentUserName: async()=>{
        let nowPayment =await findCredentials({title:"trustPayment"})
        return nowPayment.trustPaymentUserName
    },
    trustPaymentPassword: async()=>{
        let nowPayment =await findCredentials({title:"trustPayment"})
        return nowPayment.trustPaymentPassword
    },
    trustPaymentSiteReference: async()=>{
        let nowPayment =await findCredentials({title:"trustPayment"})
        return nowPayment.trustPaymentSiteReference
    },
    trustPaymentAlias: async()=>{
        let nowPayment =await findCredentials({title:"trustPayment"})
        return nowPayment.trustPaymentAlias
    },

    cloud_name: async()=>{
        let nowPayment =await findCredentials({title:"cloudinary"})
        return nowPayment.cloud_name
    },
    api_key: async()=>{
        let nowPayment =await findCredentials({title:"cloudinary"})
        return nowPayment.api_key
    },
    api_secret: async()=>{
        let nowPayment =await findCredentials({title:"cloudinary"})
        return nowPayment.api_secret
    },

} 

