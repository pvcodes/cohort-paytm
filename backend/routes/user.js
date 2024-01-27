const express = require("express");
const { User, Account } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

const signupSchema = zod.object({
	fname: zod.string(),
	lname: zod.string(),
	uname: zod.string().min(5),
	email: zod.string().email(),
	pswrd: zod.string().min(6),
});

const unameOrEmailCustomValidation = zod.string().refine(
	(unameOrEmail) => {
		if (
			zod.string().min(5).safeParse(unameOrEmail) ||
			zod.string().email().safeParse(unameOrEmail)
		)
			return true;
		else return false;
	},
	{ msg: "User or email is not vaild" }
);

const loginSchema = zod.object({
	unameOrEmail: unameOrEmailCustomValidation,
	pswrd: zod.string().min(6),
});

const nameOrPswrdCustomValidation = zod.object().refine(
	(obj) => {
		if (
			zod.string().safeParse(obj.name) ||
			zod.string().min(6).safeParse(obj.pswrd)
		)
			return true;
		else return false;
	},
	{ msg: "No valid update input found" }
);

const userUpdateSchema = zod.object({
	lname: zod.string(),
	fname: zod.string(),
	pswrd: zod.string().min(6),
});

router.post("/signup", async (req, res) => {
	const { name, email, pswrd, uname } = req.body;
	const [fname, lname] = name.split(" ");
	const userPayload = {
		uname,
		fname,
		lname,
		email,
		pswrd,
	};

	// ZOD Validation
	const { success } = signupSchema.safeParse(userPayload);
	if (!success) {
		res.status(404).json({ msg: "Inputs does not fullfill" });
		return;
	}

	// Checking does uname or email already exist?
	const usr = await User.findOne({
		$or: [{ uname: userPayload.uname }, { email: userPayload.email }],
	});
	if (usr) {
		res.status(411).json({ msg: "User already exist" });
		return;
	}

	// Creating new user
	try {
		console.log(11, typeof userPayload.uname);
		const response = await User.create(userPayload);

		if (response) {
			const userId = response._id;

			await Account.create({
				userId,
				balance: 1 + Math.random() * 1000,
			});

			const token = jwt.sign(
				{
					uname: response.uname,
					email: response.email,
				},
				JWT_SECRET
			);
			res.status(200).json({
				msg: "User created successfully",
				token: token,
			});
		} else res.json(403).json({ msg: "DB error" });
	} catch (err) {
		throw err;
	}
});

router.get("/login", async (req, res) => {
	const { uname, email, pswrd } = req.body;
	const userPayload = {
		unameOrEmail: uname || email,
		pswrd: pswrd,
	};

	const { success } = loginSchema.safeParse(userPayload);
	if (!success) {
		res.status(400).json({ msg: "Inputs does not fullfill" });
		return;
	}

	try {
		const usr = await User.findOne({
			$or: [
				{ uname: userPayload.unameOrEmail, pswrd: userPayload.pswrd },
				{ email: userPayload.unameOrEmail, pswrd: userPayload.pswrd },
			],
		});

		if (usr) {
			const token = jwt.sign(
				{ uname: usr.uname, email: usr.email, userId: usr._id },
				JWT_SECRET
			);
			res.status(200).json({ token });
		} else {
			res.status(411).json({ msg: "Error while logging in" });
		}
	} catch (err) {
		throw err;
	}
});

router.put("/", authMiddleware, async (req, res) => {
	const { userEmail, userUname } = req.user;

	console.log(userEmail, userUname);

	const { name, pswrd } = req.body;

	console.log(name);

	const [fname, lname] = name.split(" ");

	let updateData = {};

	if (
		zod.string().safeParse(fname).success &&
		zod.string().safeParse(lname).success
	) {
		updateData = {
			fname: fname,
			lname: lname,
			...updateData,
		};
		console.log(1, updateData);
	}

	if (zod.string().min(6).safeParse(pswrd).success) {
		console.log("added pswrd");
		updateData = {
			pswrd: pswrd,
			...updateData,
		};
	}

	if (Object.keys(updateData).length > 0) {
		console.log(12, updateData);
		await User.findOneAndUpdate(
			{ $or: [{ email: userEmail }, { uname: userUname }] },
			updateData
		)
			.then((usr) => {
				console.log(12, usr);
				res.status(200).json({
					msg: `Updated successfully ${JSON.stringify(updateData)}`,
				});
				return;
			})
			.catch((err) => {
				return res.status(411).json({
					msg: "Error while updating information",
				});
			});
	}
	return res.status(403).json({ msg: "Not valid inputs for updation" });

	// const [fname, lname] = name.split(" ");
});

router.get("/bulk", authMiddleware, async (req, res) => {
	const { filter } = req.query;
	console.log(filter);
	if (!zod.string().safeParse(filter).success) {
		return res.status(400).json({ msg: "Inputs does not fullfill" });
	}

	const users = await User.find({
		$or: [
			{
				fname: { $regex: filter },
			},
			{
				lname: { $regex: filter },
			},
		],
	});

	const filteredUser = users.map((user) => {
		return (user = {
			_id: user._id,
			uname: user.uname,
			fname: user.fname,
			lname: user.lname,
		});
	});

	console.log(filteredUser);
	res.status(200).json({ filteredUser });
});

module.exports = router;
