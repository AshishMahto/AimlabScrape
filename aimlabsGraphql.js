var https = require("https");

const aimlabsGraphql = (query, variables) => {
  var options = {
    method: "POST",
    headers: { "content-type": "application/json" },
  };
  var chunks = [];

  return new Promise(function (resolve, reject) {
    var req = https.request("https://api.aimlab.gg/graphql", options, function (res) {
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", function (chunk) {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        console.dir(body, { depth: null });
        resolve(body);
      });
    });
    req.on("error", (error) => {
      const who = "aimlabsGraphql";
      console.error({ who, error });
      reject({ who, error });
    });
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
};

module.exports = aimlabsGraphql;
