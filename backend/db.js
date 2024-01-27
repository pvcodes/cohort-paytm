const mongoose = require("mongoose");
mongoose
	.connect(
		"mongodb+srv://pvcodes:Q7veGmgO5YFmof5t@cluster-piwallet.uknti.mongodb.net/paytm"
	)
	.then(() => console.log("DB Connected!"));

const Schema = mongoose.Schema;

const userSchema = new Schema({
	uname: {
		type: String,
		required: true,
	},
	fname: {
		type: String,
		required: true,
		trim: true,
	},
	lname: {
		type: String,
		required: true,
		trim: true,
	},

	email: { type: String, required: true },
	pswrd: String,
});

const accountSchema = new Schema({
	balance: {
		type: Number,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", userSchema);

// mongoose.Types.ObjectId()

// const stringToObjID = (str) => {
// 	const x = new mongoose.Types.ObjectId(str);
// 	return x;
// };

module.exports = {
	User,
	Account,
	// stringToObjID
};