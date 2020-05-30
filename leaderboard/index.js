const { db, jsonReply } = require("../utils.js");
const perPage = 25;

module.exports = async function (context, req) {
  await db.getConnection().then(async (connection) => {
    const body =
      typeof req.body === "string" ? parse(req.body) : req.body ? req.body : {};
    if (req.method === "POST") {
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
      .query("SELECT * FROM leaderboard ORDER BY score DESC")
      .then((rows) => {
        const allRaw = rows.map((row, i) => ({ ...row, rank: i + 1 }));
        const rank =
          body.score && body.name
            ? allRaw.filter(
                (row) =>
                  body.name === row.name &&
                  body.score === row.score &&
                  body.duration === row.duration &&
                  body.time === row.time &&
                  body.ip === row.ip
              )[0].rank
            : false;
        const all = allRaw.map((row) => ({
          name: row.name,
          score: row.score,
          rank: row.rank,
        }));
        let startOffset = rank - Math.ceil(perPage / 2);
        if (startOffset < 1) {
          startOffset = 1;
        }
        const records = [
          all[0],
          ...all.slice(startOffset, startOffset + perPage - 1),
        ];
        jsonReply(context, { rank, records });
      });
  });
};
