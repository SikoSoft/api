require('dotenv').config();
const { v4: uuidV4 } = require('uuid');

const { login } = require("tplink-cloud-api");
const { jsonReply } = require('../utils');

const { TPLINK_USER, TPLINK_PASSWORD, CAM_KEY, CAM_NAME } = process.env;

module.exports = async function (context, req) {

    context.log(req);

    const response = { status: 0 };

    if (CAM_KEY && CAM_KEY === req.headers.cam_key) {
        response.status = 1;
        const tpLink = await login(
            TPLINK_USER,
            TPLINK_PASSWORD,
            uuidV4()
        );

        await tpLink.getDeviceList();
        const camera = await tpLink.newDevice(CAM_NAME);

        if (req.query && req.query.action) {
            camera[req.query.action]();
        }
    } else {
        response.error = "Missing or invalid key provided";
    }

    jsonReply(context, response);
}