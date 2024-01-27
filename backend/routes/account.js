const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { User, Account } = require("../db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

async function transferAmount(from, to, amount) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const fromUserAcc = await Account.findOne({ useId: from._id });

		if (!fromUserAcc || fromUserAcc.balance < amount) {
			return res.status(400).json({ msg: "Insufficient balance" });
		}

		const toUser = await User.findOne({ uname: to });
		// if toUser Doesnot exist
		if (!toUser) {
			return res.status(400).json({ msg: "Invalid Account" });
		}

		const toUserAcc = await Account.findOne({ userId: toUser._id });

		await session.commitTransaction();
		console.log("Transaction committed successfully.");
	} catch (error) {
		// If any operation fails, abort the transaction
		await session.abortTransaction();
		console.error("Transaction aborted:", error);
	} finally {
		// End the session
		session.endSession();
	}
}

router.get("/balance", authMiddleware, async (req, res) => {
	//
	const { userEmail } = req.user;
	try {
		const user = await User.findOne({ email: userEmail });
		if (user) {
			// console.log(99, user.uname);

			const userAcc = await Account.findOne({ userId: user._id });
			if (userAcc) {
				// console.log(1, userAcc);
				return res.status(200).json({ balance: userAcc.balance });
			} else {
				return res.status(403).json({ msg: "something went wrong" });
			}
		}
	} catch (err) {
		console.log(err);
		// throw err;
	}
});

router.post("/transfer", authMiddleware, async (req, res) => {
	//
	const { to, amount } = req.body;
	const { userId } = req.user;

	const session = await mongoose.startSession();
	console.log(typeof amount);
	session.startTransaction();
	try {
		const account = await Account.findOne({ userId }).session(session);

		console.log(account);

		if (!account || account.balance < amount) {
			await session.abortTransaction();
			return res.status(400).json({ msg: "Insufficient balance" });
		}

		const toAccount = await User.findOne({ uname: to }).then(
			async (toUser) =>
				await Account.findOne({ userId: toUser._id }).session(session)
		);

		if (!toAccount) {
			await session.abortTransaction();
			return res.status(400).json({ msg: "Invalid Recipent" });
		}

		// amount tranfer
		await Account.updateOne(
			{ userId },
			{ $inc: { balance: -amount } }
		).session(session);

		await Account.updateOne(
			{ _id: toAccount._id },
			{ $inc: { balance: amount } }
		).session(session);

		session.commitTransaction();
		res.status(200).json({ msg: "Transfer successful" });
	} catch (err) {
		session.abortTransaction();
		res.status(400).json({ msg: "Something went wrong" });
		throw err;
	}
});

module.exports = router;
