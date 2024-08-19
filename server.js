const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/exchange-rate', async (req, res) => {
    try {
        // Add a random query parameter to bypass cache
        const randomParam = Math.random();
        const url = `https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=ZMW&_=${randomParam}`;

        // Fetch the HTML from the XE currency converter page
        const { data } = await axios.get(url, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Select the element containing the exchange rate
        const rateElement = $('p.sc-e08d6cef-1.fwpLse');

        if (rateElement.length === 0) {
            return res.status(404).json({ error: 'Exchange rate element not found. Please check the selector.' });
        }

        // Extract and clean the exchange rate (remove any non-numeric text)
        let exchangeRate = rateElement.text().trim();
        exchangeRate = parseFloat(exchangeRate.replace(/[^\d.]/g, ''));

        // Return the currency data in JSON format
        res.json({
            currency: 'ZMW',
            value: exchangeRate
        });
    } catch (error) {
        console.error('Error scraping exchange rate:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rate data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
