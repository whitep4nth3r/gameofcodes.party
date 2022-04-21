const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const dataToSend = {
    dataSource: "Cluster0",
    database: "game_of_codes",
    collection: "leaderboard",
    sort: { score: -1 },
    limit: 10,
  };

  const getFromDatabase = await fetch(`${process.env.MONGO_DATA_API_URL}/action/find`, {
    method: "POST",
    headers: {
      "api-key": process.env.MONGO_DATA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  });

  const result = await getFromDatabase.json();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
