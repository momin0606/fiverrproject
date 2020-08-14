const JWT = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("access_token");
  if (!token) {
    return res.status(401).json({
      _id: "",
      role: "",
      isAuthenticated: false
    });
  }

  try {
    const verified = JWT.verify(token, "momin123");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({
      _id: "",
      role: "",
      isAuthenticated: false
    });
  }
};
