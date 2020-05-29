const azureStorage = require("azure-storage");
const blobService = azureStorage.createBlobService();
const { parse } = require("querystring");
const containerName = "config";
const blobName = "leaderboard.json";
const maxSize = 1000;
const perPage = 25;

async function getBlobContent() {
  return new Promise((resolve, reject) => {
    blobService.getBlobToText(containerName, blobName, (err, blobContent) => {
      if (err) {
        reject(err);
      } else {
        resolve(blobContent);
      }
    });
  });
}

async function writeBlobContent(content) {
  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromText(
      containerName,
      blobName,
      content,
      err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function processRecords(records) {
  const startOffset = 0;
  return records.slice(startOffset, perPage).map((record, i) => {
    return { ...record, rank: startOffset + i + 1 };
  });
}

module.exports = async function(context, req) {
  context.log(
    `JavaScript HTTP trigger function processed a request. ${req.method}`
  );
  await getBlobContent().then(
    async content => {
      const body = typeof req.body === "string" ? parse(req.body) : req.body;
      let records = JSON.parse(content);
      if (body && body.name && body.score && body.duration) {
        const newRecord = {
          name: body.name,
          score: body.score,
          duration: body.duration,
          time: Math.ceil(new Date().getTime() / 1000),
          ip: req.headers["x-forwarded-for"]
        };
        records = [...records, newRecord].sort((a, b) => b.score - a.score);
        const rank = records.indexOf(newRecord) + 1;
        records = processRecords(records);
        await writeBlobContent(JSON.stringify(records)).then(() => {
          context.res = {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ records, rank })
          };
        });
      } else if (body && body.reset === "boombaby") {
        await writeBlobContent("[]").then(() => {
          context.res = {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ reset: true })
          };
        });
      } else {
        context.res = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ records: processRecords(records) })
        };
      }
    },
    error => {
      context.res = {
        status: 400,
        body: error
      };
    }
  );
};
