const { db, jsonReply, typecastObject } = require("../utils.js");

function optionsArrayToObject (array) {
    const obj = {};
    array.forEach(option => {
        obj[option.name] = option.value;
    });
    return obj;
}

module.exports = async function (context, req) {
    context.log('saasgasg');
    await db.getConnection().then(async (connection) => {
        await connection.query("SELECT * FROM crypto_config").then(async (rows) => {
            context.log("rows", rows);
            jsonReply(context, optionsArrayToObject(rows.map((row) => typecastObject(row))));
        })
    });
}