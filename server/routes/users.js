var express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const authenticateToken = require("../utils/authenticateToken");

var router = express.Router();

// Models
const UserModel = require("../models/User");

const isAdmin = async (req, res, next) => {
  const user = req.user;
  const id = user._id;
  const checkUser = await UserModel.findOne({ _id: id });
  if (!checkUser || checkUser.role !== "admin") {
    return res.status(403).json({
      code: 403,
      message: "Bạn không có quyền truy cập",
    });
  }
  next();
};

/* GET users listing. */
// // Middleware kiểm tra vai trò admin
// const isAdmin = (req, res, next) => {
//   const user = req.user; // Đặt trong quá trình middleware xác thực

//   if (!user || user.role !== "admin") {
//     return res.status(403).json({
//       code: 403,
//       message: "Bạn không có quyền truy cập",
//     });
//   }
//   next(); // Nếu có quyền admin, chuyển sang middleware hoặc route tiếp theo
// };

// Sử dụng middleware isAdmin trước khi xử lý route
router.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    res.json({
      code: 200,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: TypeError,
    });
  }
});

/* GET channel. */
router.get("/channels", async (req, res, next) => {
  const users = await UserModel.find({ role: "journalist" })


  try {
    res.json({
      code: 200,
      data: users,
    });
  } catch (error) {
    res.json({
      code: 500,
      error: TypeError,
    });
  }
});

// vô hiệu hóa tài khoản người dùng
router.post(
  "/locked/:id",
  // authenticateToken,
  // isAdmin,
  async (req, res, next) => {
    const userExist = await UserModel.findOne({ _id: req.params.id });

    try {
      if (userExist) {
        const lockUser = await UserModel.findOneAndUpdate(
          { _id: req.params.id },
          { isDelete: req.body.isDelete }
        );

        if (lockUser) {
          const users = await UserModel.find({});
          res.json({
            code: 200,
            message: "Thao tác thành công",
            data: users,
          });
        } else {
          res.status(500).json({
            code: 500,
            message: "Khóa tài khoản thất bại",
          });
        }
      } else {
        res.status(404).json({
          code: 404,
          message: "Người dùng không tồn tại",
        });
      }
    } catch (error) {
      res.json({
        code: 500,
        message: "Khóa tài khoản thất bại",
        error: TypeError,
      });
    }
  }
);

// update role
router.put(
  "/updateRole/:id",
  // authenticateToken,
  // isAdmin,
  async (req, res, next) => {
    try {
      const userRole = {
        role: req.body.role,
      };
      const updateRoleUser = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        userRole
      );
      const users = await UserModel.find({});

      if (updateRoleUser) {
        res.json({
          code: 200,
          message: "Thay đổi vai trò thành công",
          data: users,
        });
      }
    } catch (error) {
      res.json({
        code: 500,
        message: "Thay đổi vai trò thất bại",
        error: error,
      });
    }
  }
);

router.post("/delete/:id", async function(req, res, next) {
  const userId = req.params.id;

  try {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
    if (!isValidObjectId) {
      return res.status(400).json({
        code: 400,
        message: "Invalid user ID format",
        data: null,
      });
    }

    const userDelete = await UserModel.deleteOne({ _id: new ObjectId(userId) });

    if (userDelete.deletedCount > 0) {
      // Xử lý khi xóa thành công và trả về phản hồi
      const users = await UserModel.find({});
      res.json({
        code: 200,
        message: "Xóa tài khoản thành công",
        data: users,
      });
    } else {
      // Xử lý khi không xóa được và trả về phản hồi
      res.status(404).json({
        code: 404,
        message: "Không tìm thấy tài khoản để xóa",
        data: null,
      });
    }
  } catch (err) {
    // Xử lý lỗi và trả về phản hồi lỗi
    console.error(err);
    res.status(500).json({
      code: 500,
      message: "Lỗi nội bộ máy chủ",
      data: null,
    });
  }
});


// get user by id
router.get("/name/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });

    if (user) {
      res.json({
        code: 200,
        data: user,
      });
    } else {
      res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
});

module.exports = router;
