const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	// console.log(authHeader);
	// const token = headerPayload.authorization?.split(" ")[1];

	if (!authHeader || !authHeader.startsWith("Bearer"))
		return res.status(403).json({});

	const token = authHeader.split(" ")[1];

	// console.log(12, token);

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		if (decoded) {
			req.user = {
				userUname: decoded.uname,
				userEmail: decoded.email,
				userId: decoded.userId,
			};
			console.log(1, "Token Valid...");
			next();
		}
	} catch (err) {
		return res.status(403).json({ msg: "Change your headers" });
	}
}

module.exports = {
	authMiddleware,
};
