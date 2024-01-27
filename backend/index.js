const express = require("express");
const app = express();
const mainRouter = require("./routes/index");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = process.env.PORT || 5050;

app.use(bodyParser.json());

app.use(express.json());
app.use("/api/v1", mainRouter);

app.use(cors());

app.listen(PORT, () => {
	console.log(`listening at port ${PORT}`);
});
