const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger")
const key = {
  tokenKey: process.env.TOKEN_KEY || "djghhhhuuwiwuewieuwieuriwu",
};

const authenticateToken = require("../utils/authenticateToken");

const authAdmin = async function (req, res, next) {
  const token = req.header("token");

  // Xử lý trường hợp không có token
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Token không được cung cấp",
      data: null,
    })
    && logger.warn({status:401, message:"Token không được cung cấp", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  }

  try {
    // Sử dụng authenticateToken nếu có
    const verified = await authenticateToken(token, key.tokenKey);

    // Lấy thông tin người dùng từ cơ sở dữ liệu
    const userCheck = await UserModel.findOne({ _id: verified._id });

    // Xử lý trường hợp người dùng không tồn tại
    if (!userCheck) {
      return res.status(401).json({
        code: 401,
        message: "Người dùng không tồn tại",
        data: null,
      })
      && logger.warn({status:401, message:"Người dùng không tồn tại", data: token, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Kiểm tra vai trò người dùng
    if (userCheck.role === "admin") {
      // Attach thông tin người dùng vào request
      req.user = userCheck;
      next();
    } else {
      return res.status(401).json({
        code: 401,
        message: "Không có quyền đăng nhập",
        data: null,
      })
      && logger.warn({status:401, message:"Không có quyền đăng nhập", data: userCheck, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (err) {
    // Xử lý lỗi xác thực token
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
      data: null,
    }) && logger.error({status:400, message:"Token không hợp lệ", data :token , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack : err.stack});
  }
};

const isAdmin = async function (req, res, next) {
  const token = req.header("token");

  // Xử lý trường hợp không có token
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Token không được cung cấp",
      data: null,
    })
    && logger.warn({status:401, message:"Token không được cung cấp", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  }

  try {
    // Sử dụng authenticateToken nếu có
    const verified = await authenticateToken(token, key.tokenKey);

    // Lấy thông tin người dùng từ cơ sở dữ liệu
    const userCheck = await UserModel.findOne({ _id: verified._id });

    // Xử lý trường hợp người dùng không tồn tại
    if (!userCheck) {
      return res.status(401).json({
        code: 401,
        message: "Người dùng không tồn tại",
        data: null,
      })
      && logger.warn({status:401, message:"Người dùng không tồn tại", data: token, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Kiểm tra vai trò người dùng
    if (userCheck.role === "admin") {
      // Attach thông tin người dùng vào request
      req.user = userCheck;
      next();
    } else {
      return res.status(401).json({
        code: 401,
        message: "Không có quyền đăng nhập",
        data: null,
      })
      && logger.warn({status:401, message:"Không có quyền đăng nhập", data: userCheck, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (err) {
    // Xử lý lỗi xác thực token
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
      data: null,
    }) && logger.error({status:400, message:"Token không hợp lệ", data :token , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack : err.stack});
  }
};

module.exports = { authAdmin, isAdmin };
