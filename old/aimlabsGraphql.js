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
      res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        resolve(body);
      });
    });
    req.on("error", (error) => {
      const err = { who: "aimlabsGraphql", error };
      console.error(err);
      reject(err);
    });
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
};

module.exports = aimlabsGraphql;
