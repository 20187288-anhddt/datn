const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const key = {
  tokenKey: "djghhhhuuwiwuewieuwieuriwu_cus",
};
const authenticateToken = (req, res, next) => {
  const token = req.headers["token"];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Token không được cung cấp",
    });
  }

  jwt.verify(token, key.tokenKey, (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: "Xác thực token không hợp lệ",
      });
    }

    req.user = user; // Đặt thông tin người dùng vào req để sử dụng ở các middleware và route khác
    next();
  });
};

module.exports = authenticateToken;
