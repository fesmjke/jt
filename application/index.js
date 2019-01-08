const config = require("../config");
const database = require("./database");
const app = require("./app");

database()
  .then(info => {
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    app.listen(config.PORT, () =>
      console.log(`Application listened port ${config.PORT}!`)
    );
  })
  .catch(() => {
    console.log("Unable to connect to databse");
    process.exit(1);
  });
