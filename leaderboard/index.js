const { db, jsonReply } = require("../utils.js");
const perPage = 25;

module.exports = async function (context, req) {
  await db.getConnection().then(async (connection) => {
    if (req.method === "POST") {
      const body =
        typeof req.body === "string"
          ? parse(req.body)
          : req.body
          ? req.body
          : {};
      body.time = Math.floor(new Date().getTime() / 1000);
      body.ip =
        req.headers && req.headers["x-forwarded-for"]
          ? req.headers["x-forwarded-for"].replace(/:[0-9]+/, "")
          : "";
      await connection.query(
        "INSERT INTO leaderboard (name, score, duration, time, ip) VALUES(?, ?, ?, ?, ?)",
        [body.name, body.score, body.duration, body.time, body.ip]
      );
    }
    await connection
      .query(
        "SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT ?",
        [perPage]
      )
      .then((rows) => {
        jsonReply(
          context,
          rows.map((row, i) => ({ ...row, rank: i + 1 }))
        );
      });
  });
};
