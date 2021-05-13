const db = require("./database");

const typecastValue = (value) => {
  if (value.match(/^[0-9]+$/)) {
    return parseInt(value);
  }
  return value;
}

module.exports = {
  db,

  typecastValue,

  jsonReply: (context, object) => {
    context.res = {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(object),
    };
  },

  typecastObject: (object) => {
    const newObject = {};
    for (let key in object) {
      newObject[key] = typecastValue(object[key]);
    }
    return newObject;
  }
};
