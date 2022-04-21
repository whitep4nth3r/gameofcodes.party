const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const { score, username } = event.queryStringParameters;
  const difficulty = "default";

  const dataToSend = {
    dataSource: "Cluster0",
    database: "game_of_codes",
    collection: "leaderboard",
    document: {
      username,
      score,
      difficulty,
    },
  };

  const sendToDatabase = await fetch(`${process.env.MONGO_DATA_API_URL}/action/insertOne`, {
    method: "POST",
    headers: {
      "api-key": process.env.MONGO_DATA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  });

  const result = await sendToDatabase.json();

  console.log(result);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
