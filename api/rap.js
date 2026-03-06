export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    let body;
    try {
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else if (req.body && typeof req.body === 'object') {
            body = req.body;
        } else {
            return res.status(400).json({ error: 'Invalid or missing request body' });
        }
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body: ' + e.message });
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Missing API key configuration' });
        }

        const response = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
}