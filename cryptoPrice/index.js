const { default: axios } = require("axios");
const { db } = require("../utils.js");

const coins = ['bitcoin', 'ethereum', 'cardano', 'dogecoin', 'monero', 'bitcoin-cash', 'zcash', 'ravencoin', 'uniswap', 'litecoin'];
const fiats = ['usd', 'eur', 'sek'];


module.exports = async function (context, myTimer) {
    await axios.get(
        'https://api.coingecko.com/api/v3/simple/price', {
            params: {
            ids: coins.join(','),
            vs_currencies: fiats.join(',')
            }
        }
    ).then(async function(response) {
        const time = new Date();
        await db.getConnection().then(async (connection) => {
            for (let coin in response.data) {
                    let valueFields = fiats.map((fiat) => `value_${fiat}`).join(", ");
                    let valuePlaceholders = fiats.map(() => "?").join(", ");
                    await connection.query(
                        `INSERT INTO crypto_prices (coin, time, year, month, day, hour, minute, ${valueFields}) VALUES(?, ?, ?, ?, ?, ?, ?, ${valuePlaceholders})`,
                        [
                            coin,
                            Math.ceil(time.getTime()/1000),
                            time.getFullYear(),
                            time.getMonth()+1,
                            time.getDate(),
                            time.getHours(),
                            time.getMinutes(),
                            ...fiats.map((fiat) => response.data[coin][fiat])
                        ]
                    ).then(async () => {
                        context.log(`Coins saved`)
                    })

            }
        });
    });
    /*
    var timeStamp = new Date().toISOString();
    
    if (myTimer.IsPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);
    */
};