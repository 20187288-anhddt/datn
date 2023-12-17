const UserModle = require("../models/User");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../utils/authenticateToken");
const key = {
  tokenKey: "djghhhhuuwiwuewieuwieuriwu",
};

const authAdmin = async function (req, res, next) {
  const token = req.header("token");
  if (!token) {
  } else {
    try {
      const verified = jwt.verify(token, key.tokenKey);
      const userCheck = await UserModle.findOne({ _id: verified._id });
      if (userCheck.role === "admin") {
        req.user = userCheck;
        next();
      } else {
        return res.json({
          code: 401,
          message: "k co quyen dang nhap",
          data: null,
        });
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: " token khong hop le",
        data: null,
      });
    }
  }
};
const isAdmin = (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({
      code: 403,
      message: "Bạn không có quyền truy cập",
    });
  }

  next();
};

module.exports = { authAdmin, isAdmin };
