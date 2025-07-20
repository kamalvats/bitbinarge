module.exports = {
    paymentRequired(name, plan_name, amount, due_date, pay_address, pay_coin, renewal_date, plan_duration) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }
      
  		table {
    		border-collapse: collapse;
  		}
  		th, td {
            border: 1px solid #f2f2f2;
            padding: 5px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Subscription Plan</h2>
            <hr>
            <p>Dear ${name},</p>
            <p>This is a friendly reminder that your payment for the plan ${plan_name} is due. Please make sure to complete the payment of ${amount} by ${due_date} to avoid any interruptions in your service.</p>

            <p>Here are the details for the payment:</p>
              <p><strong>Payment Address:</strong> ${pay_address}</p>
              <p><strong>Payment Coin:</strong> ${pay_coin}</p>
            <p>Additionally, please note that your plan ${plan_name} is set to renew on ${renewal_date} for a duration of ${plan_duration}. If your subscription is not renewed within 7 days from the expiration of your current plan, you will be required to pay the initial connection fee again. Please note that exceptions cannot be made beyond this deadline.</p>
            <p> Thank you for being a valued customer. Should you have any questions or need assistance, please do not hesitate to contact our customer support team.</p>
            <div style="margin: 40px 0 50px;">
                <!-- <a type="button" class="contactbutton" href="" target="_blank">Contact Us</a> -->
            </div>
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    signloginOtp(name, otp) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>One Time Password (OTP) for AstroQunt Account Login</h2>
            <hr>
            <p>Dear ${name},</p>
            <p>Please check your email for the One Time Password (OTP) ${otp} required to login to your AstroQunt account. The OTP is valid for 3 minutes.</p>

            <p>This OTP is essential for verifying the device from which you are attempting to access the application. For the security of your account, please refrain from sharing this OTP with anyone.</p>
            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    forgotPassword(name, otp) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>One Time Password (OTP) for AstroQunt Account Reset Password</h2>
            <hr>
            <p>Dear ${name},</p>
            <p>Please check your email for the One Time Password (OTP) ${otp} required to Reset Password for your AstroQunt account. The OTP is valid for 3 minutes.</p>

            <p>This OTP is essential for verifying the device from which you are attempting to access the application. For the security of your account, please refrain from sharing this OTP with anyone.</p>
            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    resendOtp(name, otp) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>One Time Password (OTP) for AstroQunt Account Verification</h2>
            <hr>
            <p>Dear ${name},</p>
            <p>Please check your email for the One Time Password (OTP) ${otp} required to verify your AstroQunt account. The OTP is valid for 3 minutes.</p>

            <p>This OTP is essential for verifying the device from which you are attempting to access the application. For the security of your account, please refrain from sharing this OTP with anyone.</p>
            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    contactUS(email, mobile_no, name, message) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>
      
 <style>
  table {
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #f2f2f2;
    padding: 5px;
  }
</style>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Contact Us</h2>
            <hr>
            
          <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mobile No:</strong> ${mobile_no}</p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Message:</strong> ${message}</p>

            
              </br>
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    activeAccount(email) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>AstroQunt Account Reactivated</h2>
            <hr>
             <p>Dear User's,</p>
                <p>
                  We would like to inform you that your AstroQunt account has been Reactivated. This email serves as a notification to inform you about the account Reactivation.
                </p>
                <p><strong>Email Address:</strong> ${email}</p>
                <p>
                  Thank you for your understanding and cooperation during your account activation period.
                </p>


            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    inActiveAccount(email, reason, Adminemail) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>AstroQunt Account Suspended</h2>
            <hr>
             <p>Dear User's,</p>
                <p>
                  We regret to inform you that your AstroQunt account has been temporarily suspended. This email serves as a notification to inform you about the account suspension. Below are the details:
                </p>
                <p><strong>Email Address:</strong> ${email}</p>
                <p><strong>Suspension Reason:</strong> ${reason}</p>
                <p>
                  During the suspension period, you will not be able to access your account or utilise the features and functionalities of AstroQunt. We understand that this may cause inconvenience, and we sincerely apologise for any disruption this may cause.
                </p>
                <p>
                  If you believe that the suspension has been made in error or if you have any concerns or questions regarding the account suspension, please contact our support team at support@astroqunt.app. We will thoroughly review your case and provide the necessary assistance and resolution.
                </p>
                <p>
                  We value your participation, and we strive to maintain a secure and compliant environment for all users. Account suspensions are occasionally implemented to ensure the integrity of our platform and protect the interests of our users.
                </p>
                <p>
                  Thank you for your understanding and cooperation during this suspension period.
                </p>
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    insufficientBalance(name) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Insufficient Balance</h2>
            <hr>
            <p>Dear ${name},</p>
           <p> We regret to inform you that your recent attempt to execute a trade on your AstroQunt account failed due to insufficient balance.</p>

<p>To proceed with your trade, please add funds to your account.</p>
            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    tradeClose(name, arbitrage_Name, symbol, capital, profit) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

 		table {
    		border-collapse: collapse;
  		}
  		th, td {
    		border: 1px solid #f2f2f2;
    		padding: 5px;
  		}

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Trade Successfull</h2>
            <hr>
            <p>Dear ${name},</p>
          <p>We are pleased to inform you that your recent trade executed on your AstroQunt account has been successfully completed.</p>
              <p><strong>Strategy Type:</strong> ${arbitrage_Name}</p>
               <p><strong>Symbol:</strong> ${symbol}</p>
              <p><strong>Capital:</strong> ${capital}</p>
              <p><strong>Profit:</strong> ${profit}</p>

<p>You can view the details of this transaction in your account under the "Trade History" section.</p>

<p>If you have any questions or need further assistance, please feel free to contact us.</p>

<p>Thank you for choosing AstroQunt for your trading needs</p>
  <p>Disclaimer: Past performance does not guarantee future results. Trading cryptocurrencies involves significant risk. Please seek professional financial advice before trading.</p>
            
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    inviteUser(email, password, websiteURL) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }
      
  		table {
    		border-collapse: collapse;
  		}
  		th, td {
            border: 1px solid #f2f2f2;
            padding: 5px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
<!--             <h2>Invitation to User astroqunt.</h2> -->
            <hr>
            <p>Dear user,</p>
            <p>You have been appointed as a Sub Admin.</p>
            <p>To get started, please log in to the Admin Panel using the credentials provided below. Once logged in, you will have access to specific administrative functions based on your role.</p>
<p><strong>Email Address:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            <p>If you have any questions or need assistance as you familiarise yourself with your new responsibilities, do not hesitate to reach out to us. </p>

            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },
    paymentRequiredTrustPayment(name, plan_name, renewal_date, plan_duration) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }
      
  		table {
    		border-collapse: collapse;
  		}
  		th, td {
            border: 1px solid #f2f2f2;
            padding: 5px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Issue with Your Recent Payment</h2>
            <hr>
            <p>Dear ${name},</p>
           

<p>We wanted to inform you that there was an issue processing your recent recurring payment through your card. Encountered an error while attempting to complete the transaction.</p>

<p>Please rest assured that your service remains active, and we are here to assist you in resolving this as soon as possible. We kindly ask you to review the following options to help resolve the issue:</p>

<p>1. Sufficient funds: Ensure that your card has sufficient funds available for the transaction.</p>
<p>2.Contact your bank: Sometimes, banks block recurring transactions for security reasons, so you may need to check with your card issuer.</p>
<p>If the issue persists or if you have any questions, please don't hesitate to reach out to us at [support email] or [support phone number]. We greatly appreciate your cooperation and apologize for any inconvenience caused.</p>
            <p>Additionally, please note that your plan ${plan_name} is set to renew on ${renewal_date} for a duration of ${plan_duration}. If your subscription is not renewed within 10 days from the expiration of your current plan, you will be required to pay the initial connection fee again. Please note that exceptions cannot be made beyond this deadline.</p>
            <p> Thank you for being a valued customer. Should you have any questions or need assistance, please do not hesitate to contact our customer support team.</p>
            <div style="margin: 40px 0 50px;">
                <!-- <a type="button" class="contactbutton" href="" target="_blank">Contact Us</a> -->
            </div>
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },

    paymentRequestCash() {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }
      
  		table {
    		border-collapse: collapse;
  		}
  		th, td {
            border: 1px solid #f2f2f2;
            padding: 5px;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2>Your Subscription is Expiring Soon – Renew Now!</h2>
            <hr>
            <p>Dear User,</p>
           

<p>We wanted to remind you that your subscription is set to expire in a few days. To avoid any interruptions in your service, please take a moment to renew your subscription.</p>

<p>Here’s how to renew:</p>

<p>* Go to your profile: Log in and navigate to the profile section.</p>
<p>* Choose your payment plan: Select either Custom or Regular as your preferred subscription plan.</p>
<p>* Choose your payment type: Select either CARD or CRYPTO as your preferred payment method.</p>
<p>* Click the "Buy" button: Complete your renewal by clicking on the Buy button.</p>

            <p> Thank you for being a valued customer. Should you have any questions or need assistance, please do not hesitate to contact our customer support team.</p>
            <div style="margin: 40px 0 50px;">
                <!-- <a type="button" class="contactbutton" href="" target="_blank">Contact Us</a> -->
            </div>
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },

    exclusiveUserEmail(couponCode, planNames, amount) {
        return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: sans-serif;
                margin: 0;
                padding: 0;
                color: #fbf2f2;
            }
    
            .main-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                background-color: rgba(17, 26, 9, 255);
                border-radius: 5px;
                overflow: hidden;
            }
    
            .contactbutton {
                border: 1px solid #fff !important;
                background: #1b250c !important;
                color: #fff !important;
                padding: 13px 30px;
                border-radius: 10px;
                margin-bottom: 24px;
                margin-top: 10px;
                text-decoration: none;
                font-size: 14px;
            }
    
            .container {
                max-width: 100%;
                max-height: 1000px;
                margin-top: 10px;
                padding: 20px;
                background-color: #1b250c;
                border-radius: 5px;
            }
    
            header {
                text-align: center;
                margin-bottom: 20px;
                color: #fbf2f2;
            }
    
            img {
                max-width: 100%;
                height: auto;
            }
    
            h2 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #fbf2f2;
            }
    
            p {
                margin-bottom: 15px;
                line-height: 1.5;
                color: #fbf2f2;
            }
    
            td {
                margin-bottom: 15px;
                line-height: 1.5;
                color: #fbf2f2;
            }
    
            .otp-code {
                display: flex;
                justify-content: center;
                margin: 10px auto;
                color: #fbf2f2;
            }
    
            .otp-code h3 {
                font-size: 24px;
                margin: 0 10px;
                text-align: center;
                color: #fbf2f2;
            }
    
            footer {
                border-top: 1px solid #5f5858;
                padding-top: 20px;
                text-align: center;
            }
    
            a {
                text-decoration: underline;
            }
    
            @media only screen and (max-width: 600px) {
                .container {
                    padding: 15px;
                }
    
                header {
                    text-align: center;
                }
    
                h2 {
                    font-size: 20px;
                    color: #fbf2f2;
                }
    
                .otp-code h3 {
                    font-size: 20px;
                    color: #fbf2f2;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="main-container">
            <div class="container">
                <header>
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                            alt="AstroQunt" width="130px">
                    </div>
                </header>
                <h2>Welcome to Our Service!</h2>
                <hr>
                <p>Dear user,</p>
                <p>We are excited to have you onboard. As a token of our appreciation, we have an exclusive offer on below plans just for you!</p>
    
                <p><strong>Plan List:</strong></p>
                ${planNames.map((plan) => `<p>${plan}</p>`).join('')}
                <p><strong>Coupon Values:</strong> ${amount}</p>
                <p>You can now get the following plan(s) at a discounted rate using the coupon code below:</p>
                <h2>${couponCode}</h2>

                <p>Don't miss out on this opportunity!</p>
                
                <p>Best regards,</p>
                <p>AstroQunt</p>
                <br>
            </div>
        </div>
    </body>
    
    </html>`;
    },

    newLetterForAdmin(email) {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Letter</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2> Great news! You’ve got a new subscriber to the AstroQunt newsletter. 🎉</h2>
            <hr>
            <p>Dear Admin,</p>
            <p><strong>Subscriber Details:</strong></p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
            </ul>
            <p>This is a fantastic opportunity to grow our community and keep our audience engaged with all the latest updates. Let’s keep the momentum going!</p>
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },

    newLetter() {
        return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Letter</title>
    <style>
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            color: #fbf2f2;
        }

        .main-container {
            max-width: 600px;

            margin: 0 auto;
            padding: 30px;
            background-color: rgba(17, 26, 9, 255);
            border-radius: 5px;
            overflow: hidden;
        }

        .contactbutton {
            border: 1px solid #fff !important;
            background: #1b250c !important;
            color: #fff !important;
            padding: 13px 30px;
            border-radius: 10px;
            margin-bottom: 24px;
            margin-top: 10px;
            text-decoration: none;
            font-size: 14px;
        }

        .container {
            max-width: 100%;
            max-height: 1000px;
            margin-top: 10px;
            padding: 20px;
            background-color: #1b250c;
            border-radius: 5px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #fbf2f2;
        }

        p {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        td {
            margin-bottom: 15px;
            line-height: 1.5;
            color: #fbf2f2;
        }

        .otp-code {
            display: flex;
            justify-content: center;
            margin: 10px auto;
            color: #fbf2f2;
        }

        .otp-code h3 {
            font-size: 24px;
            margin: 0 10px;
            text-align: center;
            color: #fbf2f2;
        }

        footer {
            border-top: 1px solid #5f5858;
            padding-top: 20px;
            text-align: center;
        }

        a {
            text-decoration: underline;
        }

        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }

            header {
                text-align: center;
            }

            h2 {
                font-size: 20px;
                color: #fbf2f2;
            }

            .otp-code h3 {
                font-size: 20px;
                color: #fbf2f2;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <div class="container">
            <header>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://res.cloudinary.com/dh7k14pzn/image/upload/v1720185497/atkethry56xipxfloo8t.png"
                        alt="AstroQunt" width="130px">

                </div>
            </header>
            <h2> Thank you for subscribing to AstroQunt's newsletter! 🎉</h2>
            <hr>
            <p>Dear User,</p>
            <p>We’re thrilled to have you join our community. Get ready for exciting updates, exclusive insights, special offers, and much more, delivered straight to your inbox.</p>

            <p>We’re so glad you’re here!</p>
            
            <p> Best regards,</p>
            <p> AstroQunt</p>
            <br>
        </div>
    </div>
</body>

</html>`
    },

}