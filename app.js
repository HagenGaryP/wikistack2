const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

app.use(morgan("dev")); //logging middleware
app.use(express.static(path.join(__dirname, "./public"))); //serving up static files (e.g. css files)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const { db, Page, User } = require('./models')
const PORT = 8080;

const init = async () => {
  //sync creates the table if it does not exist. alter true creates the tables and makes any changes to keep the modules in sync
  // await User.sync()
  // await Page.sync()

  await db.sync()

  // server.listen(PORT, () => {
    app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
  });
}

init();

app.use("/wiki", require("./routes/wiki"));
app.use("/users", require("./routes/users"));




app.get('/', function (req, res) {
   res.redirect('/wiki/');
});



module.exports = app;
