export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    try {
        const response = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sk-hc-v1-14be685cb1814a24825916b19d96308cfaacd192dd7c47f0a26532adeb7b729b',
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