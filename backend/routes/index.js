const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");

const router = express.Router();
// console.log(userRouter);

// user routes
router.use("/user", userRouter);

router.use("/account", accountRouter);
module.exports = router;
//
// router.get("/login", (req, res) => {
// 	res.json({ msg: "User logged in" });
// });

// router.post("/signup", (req, res) => {
// 	res.json({ msg: "User signned in" });
// });

// router.put("/update", (req, res) => {
// 	res.json({ msg: "User updated" });
// });
