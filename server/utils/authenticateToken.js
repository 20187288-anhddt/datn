const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const key = {
  tokenKey: process.env.TOKEN_KEY || "djghhhhuuwiwuewieuwieuriwu_cus",
};

const authenticateToken = (req, res, next) => {
  console.log(req.headers);
  const token = req.headers["token"];

  // Xử lý trường hợp không có token
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Token không được cung cấp",
    });
  }

  // Xác thực token
  jwt.verify(token, key.tokenKey, (err, user) => {
    if (err) {
      console.error("Lỗi xác thực token:", err);
      return res.status(403).json({
        code: 403,
        message: "Xác thực token không hợp lệ",
      });
    }

    // Kiểm tra và lấy thông tin người dùng từ cơ sở dữ liệu
    UserModel.findById(user._id, (err, foundUser) => {
      if (err || !foundUser) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        return res.status(401).json({
          code: 401,
          message: "Người dùng không tồn tại",
        });
      }

      req.user = foundUser;
      next();
    });
  });
};

module.exports = authenticateToken;
