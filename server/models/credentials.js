import Mongoose, {
    Schema
} from "mongoose";
import status from '../enums/status';

const options = {
    collection: "credential",
    timestamps: true
};

const schemaDefination = new Schema({

        title: {
            type: String
        },
        nowPaymentApiKey: {
            type: String
        },
        nowPaymentUrl: {
            type: String
        },
        nowPaymentCallbackUrl: {
            type: String
        },
        sendGridKey: {
            type: String
        },
        trustPaymentUrl: {
            type: String
        },
        trustPaymentUserName: {
            type: String
        },
        trustPaymentPassword: {
            type: String
        },
        trustPaymentSiteReference: {
            type: String
        },
        trustPaymentAlias: {
            type: String
        },
        cloud_name: {
            type: String
        },
        api_key: {
            type: String
        },
        api_secret: {
            type: String
        },
        status: {
            type: String,
            default: status.ACTIVE
        }
    },
    options
);

module.exports = Mongoose.model("credential", schemaDefination);



Mongoose.model("credential", schemaDefination).find({}, (err, result) => {
    if (err) {
        console.log("DEFAULT CREDENTIAL ERROR", err);
    } else if (result.length !=0) {
        console.log("Default CREDENTIAL already exist.");
    } else {
        let arr = [{
                title: "nowPayment",
                nowPaymentApiKey: "",
                nowPaymentUrl: "",
                nowPaymentCallbackUrl: ""
            },
            {
                title: "sendGrid",
                sendGridKey: ""
            },
            {
                title: "trustPayment",
                trustPaymentUrl: "",
                trustPaymentUserName: "",
                trustPaymentPassword: "",
                trustPaymentSiteReference: "",
                trustPaymentAlias: ""
            },
            {
                title: "cloudinary",
                cloud_name: "",
                api_key: "",
                api_secret: ""
            },
        ]


        Mongoose.model("credential", schemaDefination).insertMany(arr, async (err1, result1) => {
            if (err1) {
                console.log("DEFAULT CREDENTIAL  creation ERROR", err1);
            } else {
                console.log("DEFAULT CREDENTIAL Created", result1);
            }
        });
    }
});