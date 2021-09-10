
const axios = require('axios');
const jwt = require("jsonwebtoken");


const REDIRECT_ENDPOINT = "https://sandbox-pgw.2c2p.com";
// const ACTION_ENDPOINT = "https://demo2.2c2p.com/2C2PFrontend/PaymentActionV2/PaymentProcess.aspx";
const MERCHANT_KEY = "ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9";

module.exports = function (app) {

    function randomNumber(length) {
        let chars = '0123456789'
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    async function generatePaymentLink() {
        try {

            let endpoint = REDIRECT_ENDPOINT + "/payment/4.1/paymentToken";
            let data = {
                "merchantID": "JT01",
                "invoiceNo": randomNumber(10),
                "description": "item 1",
                "amount": 1000.00,
                "currencyCode": "SGD",
                "frontendReturnUrl": "http://localhost:3000/frontresponse",
                "backendReturnUrl": "http://e5d9-84-253-224-242.ngrok.io/backresponse"  //replace this with your ngrok url
            }
            let token = jwt.sign(data, MERCHANT_KEY, { algorithm: 'HS256' });
            let payload = { "payload": token };
            let resp = await axios.post(endpoint, payload);
            let decodedResponse = jwt.decode(resp.data.payload);
            console.log(decodedResponse);
            return { success: true, response: decodedResponse }
        } catch (error) {
            console.log(error.message);
            return { success: false, response: error.message }
        }
    }

    app.get('/test', async function (req, res) {
        try {
            let resp = await generatePaymentLink();
            if (resp.success !== false) {
                res.send({ status: 200, response: resp.response });
            } else {
                res.send({ status: 400, response: resp.response });
            }
        } catch (error) {
            console.log(error.message);
            res.send({ status: 400, response: error.message });
        }
    });

    app.get('/', async function (req, res) {
        let resp = await generatePaymentLink();
        if (resp.success !== false) {
            res.render('sample', {
                paymentUrl: resp.response.webPaymentUrl
            });
        } else {
            res.render('sorry');
        }

    });

    app.post('/backresponse', function (req, res) {
        //Replace ngrok url above if you want to get this locally        
        let decodedResponse = jwt.decode(req.body.payload);
        console.log(req.body.payload);
        res.send({ status: 200 });
    });

    app.post('/frontresponse', function (req, res) {
        let confirmationResponse = Buffer.from(req.body.paymentResponse, "base64").toString();
        console.log(confirmationResponse);
        res.render('thankyou');
    });
};