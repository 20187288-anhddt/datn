const UserModle = require('../models/User');
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger")
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
    })&& logger.warn({status:401, message:"Không có quyền đăng nhập",data: req, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
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
      })&& logger.warn({status:401, message:"Người dùng không tồn tại",data: req, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    req.user = user;
    delete req.user.password;
    next();
  } catch (error) {
    // Xử lý lỗi xác thực token
    console.error("Lỗi xác thực token:", error);
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
      data: null
    })
    && logger.error({status:400, message:"Token không hợp lệ ", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
    ;
  }
}
