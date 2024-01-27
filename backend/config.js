require("dotenv").config();

module.exports = {
	JWT_SECRET: process.env.JWT_SECRET,
	MONGO_URL: process.env.MONGO_URL,
};
