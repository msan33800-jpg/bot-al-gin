const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = 'bot_al_gin_secret';

app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);      
        }
    }
});

app.post('/webhook', (req, res) => {
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function handleMessage(sender_psid, received_message) {
    let response;
    let text = received_message.text ? received_message.text.toLowerCase() : '';

    if (text === 'مرحبا' || text === 'السلام عليكم') {
        response = { "text": "أهلاً بك في Bot Al Gin! 🔥 البوت الأسطوري جاهز للخدمة." };
    } else if (text === '!نقاطي') {
        response = { "text": "🏆 رصيد نقاطك الحالي: 100 نقطة!" };
    } else {
        response = { "text": `تم استلام رسالتك: "${received_message.text}" .. جاري تجهيز الردود الأسطورية!` };
    }

    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": { "id": sender_psid },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v18.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
