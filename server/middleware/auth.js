const UserModle = require('../models/User');
const jwt = require("jsonwebtoken");

const key = {
  tokenKey: process.env.TOKEN_KEY || "djghhhhuuwiwuewieuwieuriwu"
};

module.exports = async function (req, res, next) {
  const token = req.header('auth-token');

  // Xử lý trường hợp không có token
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Không có quyền đăng nhập",
      data: null
    });
  }

  try {
    const verified = jwt.verify(token, key.tokenKey);
    const user = await UserModle.findOne({ _id: verified._id });

    // Xử lý trường hợp người dùng không tồn tại
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Người dùng không tồn tại",
        data: null
      });
    }

    req.user = user;
    delete req.user.password;
    next();
  } catch (err) {
    // Xử lý lỗi xác thực token
    console.error("Lỗi xác thực token:", err);
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
      data: null
    });
  }
}
