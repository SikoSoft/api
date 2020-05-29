const db = require("./database");

module.exports = {
  db,

  jsonReply: (context, object) => {
    context.res = {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(object),
    };
  },
};
