const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validInput = require("../utils/validInput");
const authenticateToken = require("../utils/authenticateToken");
const { responseCode, callRes } = require("../utils/errorCode");
const UserModel = require("../models/User");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sizeOf = require("image-size")
const mime = require('mime-types');
const logger = require("../utils/logger");

const key = {
  tokenKey: "djghhhhuuwiwuewieuwieuriwu_cus",
};
// function authenticateToken(req, res, next) {
//   const token = req.header("auth-token");

//   if (!token) {
//     return res.status(401).json({
//       code: 401,
//       message: "Access denied. Token is missing.",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, key.tokenKey);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({
//       code: 403,
//       message: "Invalid token.",
//     });
//   }
// }

const app = express();
app.use(fileUpload());

router.post("/signup", async function (req, res) {
  try {
    if (req.body.email == undefined ||req.body.email == undefined||req.body.email == undefined) {
      console.log(req.body.username);
      return res.status(400).json({
        code: 400,
        message: `Vui lòng nhập đầy đủ thông tin`,
        data: null,
      });
    }

    const userExist = await UserModel.findOne({ email: req.body.email });

    if (!userExist) {
      const hash = await bcrypt.hash(req.body.password, 8);
      const User = new UserModel();
      password = req.body.password;
      User.username = req.body.username;
      User.password = hash;
      // User.image = file.name;
      User.email = req.body.email;
      if (User.username == undefined ||password == undefined||User.email == undefined) {
        console.log(req.body.username);
        return res.status(400).json({
          code: 400,
          message: `Vui lòng nhập đầy đủ thông tin`,
          data: null,
        });
      }

      const userCreate = await User.save();

      return res.json({
        code: 200,
        message: "Bạn đã đăng ký thành công",
        data: { userCreate },
      }) && logger.info({status:200, message: "Đăng ký thành công tài khoản", data: userCreate, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    } else {
      return res.json({
        code: 491,
        message: "Người dùng đã tồn tại",
        data: null,
      }) && logger.info({status:491, message: "Người dùng đã tồn tại", data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    }
  } catch (error) {
    return logger.error({ code: 400, message: error.message, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack  });
  }
});


router.post("/", async function (req, res, next) {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng cung cấp cả email và password",
        data: null,
      }) && logger.warn({status:400, message: "Vui lòng cung cấp cả email và password", data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    }

    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await UserModel.findOne({ email });

    // Kiểm tra người dùng có tồn tại hay không
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Email không tồn tại, vui lòng kiểm tra lại!",
        data: null,
      }) && logger.warn({status:401, message: "Email không tồn tại, vui lòng kiểm tra lại!", data: req.body , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isDelete === true) {
      return res.status(402).json({
        code: 402,
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!",
        data: null,
      })&& logger.warn({status:402, message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!", data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Tạo token
      const token = jwt.sign({ _id: user._id }, key.tokenKey, {
        expiresIn: "24h", // Token hết hạn sau 24 giờ
      });

      // Trả về thông tin người dùng và token
      const { username, role, email, image, _id } = user;
      return res.status(200).json({
        code: 200,
        message: "Đăng nhập thành công",
        data: { username, role, email, image, _id },
        token,
      }) && logger.info({status:200, message: "Đăng nhập thành công", data: { username, role, email, image, _id },
      token , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
      ;
    } else {
      // Trường hợp mật khẩu không chính xác
      return res.status(401).json({
        code: 401,
        message: "Email hoặc mật khẩu không chính xác",
        data: null,
      }) && logger.warn({status:401, message: "Email hoặc mật khẩu không chính xác", data: { username, role, email, image, _id }, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (error) {
    // Xử lý lỗi
     logger.error({status:400, message: error.message, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
      
  } 
}) ;

// get user
router.get("/:token", async (req, res) => {
  const userToken = req.params.token;

  if (!userToken) {
    return res.status(400).json({
      code: 400,
      message: "Token không được cung cấp",
    }) && logger.warn({status:400, message: "Token không được cung cấp", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  }

  let decoded;
  try {
    decoded = jwt.decode(userToken);
  } catch (error) {
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
    })&& logger.warn({status:400, message: "Token không hợp lệ", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack });
  }

  if (!decoded || !decoded._id) {
    return res.status(400).json({
      code: 400,
      message: "Token không chứa thông tin người dùng hợp lệ",
    })&& logger.warn({status:400, message: "Token không chứa thông tin người dùng hợp lệ", data: req.params , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  }

  const id = decoded._id;
  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "Người dùng không tồn tại",
    }) && logger.warn({status:404, message: "Người dùng không tồn tại", data: req.params , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  }

  const { username, role, email, image, _id } = user;

  return res.json({
    code: 200,
    data: { username, role, email, image, _id },
  })&& logger.info({status:200, message: "Lấy thông tin user thành công", data: { username, role, email, image, _id }, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
});

// update name, email, password, photo
router.put("/updateName/:id", 
// authenticateToken, 
async (req, res) => {
  try {
    // Kiểm tra người dùng tồn tại
    const userExist = await UserModel.findOne({ _id: req.params.id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      }) && logger.info({status:404, message: "Người dùng không tồn tại", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    }

    // Cập nhật tên
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { username: req.body.userName },
      {
        new: true,
        useFindAndModify: false,
      }
    );

    if (updatedUser) {
      return res.status(200).json({
        code: 200,
        data: updatedUser,
        message: "Cập nhật tên thành công",
      })&& logger.info({status:200, message: "Cập nhật tên thành công", data: updatedUser, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (error) {
    console.error("Error during name update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật tên thất bại",
    }) && logger.error({status:500, message: "Cập nhật tên thất bại", data: req.params + req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

router.put("/updateEmail/:id", 
// authenticateToken, 
async (req, res) => {
  try {
    // Kiểm tra người dùng tồn tại
    const userExist = await UserModel.findOne({ _id: req.params.id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      })&& logger.info({status:404, message: "Người dùng không tồn tại", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    }

    // Kiểm tra email mới có hợp lệ không
    const newEmail = req.body.email;

    if (!validInput.checkEmail(newEmail)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ",
      })&& logger.warn({status:400, message: "Email không hợp lệ", data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    }

    // Kiểm tra xem email mới đã tồn tại cho người dùng khác
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id, email: { $ne: newEmail } },
      { email: newEmail },
      { new: true, useFindAndModify: false }
    );

    if (updatedUser) {
      return res.status(200).json({
        code: 200,
        data: updatedUser,
        message: "Cập nhật email thành công",
      }) && logger.info({status:200, message: "Cập nhật email thành công", data: updatedUser, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    }
  } catch (error) {
    console.error("Error during email update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật email thất bại",
    })&&  logger.error({status:500, message: "Cập nhật email thất bại", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack });;
  }
});

router.put("/updatePassword/:id", 
// authenticateToken, 
async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới",
      })&& logger.warn({status:400, message: "Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới", data: req.body , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
    const userExist = await UserModel.findOne({ _id: req.params.id });
    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      }) && logger.warn({status:404, message: "Người dùng không tồn tại", data: req.params , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
    const comparePassword = await bcrypt.compare(
      currentPassword,
      userExist.password
    );
    if (comparePassword) {
      const hashPassword = await bcrypt.hash(newPassword, 8);
      const user = {
        password: hashPassword,
      };

      const updateUserPassword = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        user,
        {
          new: true,
          useFindAndModify: false,
        }
      );

      if (updateUserPassword) {
        return res.status(200).json({
          data: updateUserPassword,
          code: 200,
          message: "Cập nhật mật khẩu thành công",
        })&& logger.info({status:200, message: "Cập nhật mật khẩu thành công", data: updateUserPassword , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers}) ;
      }
    } else {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu hiện tại không đúng",
      })&& logger.info({status:400, message: "Mật khẩu hiện tại không đúng", data: req.params && req.body,userId:req.params.id , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers}) ;
    }
  } catch (error) {
    console.error("Error during password update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật mật khẩu thất bại",
    }) && logger.error({status:500, message: "Cập nhật mật khẩu thất bại", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack  }) ;;
  }
});

router.put("/uploadAvatar/:id", async (req, res) => {
  try {
    const userExist = await UserModel.findOne({ _id: req.params.id });
    
    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      })&& logger.warn({status:404, message: "Người dùng không tồn tại", data: req.params , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }

    const file = req.files && req.files.file;

    if (!file) {
      return res.status(400).json({
        code: 400,
        message: "Không có file được tải lên",
      })&& logger.warn({status:400, message: "Không có file được tải lên", data: req.params , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }
    // Tạo chuỗi ngày tháng
    const currentDate = new Date();
const dateString = currentDate.toISOString().replace(/[-T:.Z]/g, '');
    const newFileName = `${dateString}${path.extname(file.name)}`;
    const uploadPath = path.join(
      __dirname,
      "../../client/public/uploads/users/",
      newFileName
    );

    // Kiểm tra kích thước tập tin
    const fileSizeInBytes = file.size;
    const maxSizeInBytes = 1024 * 1024; // 1MB

    if (fileSizeInBytes > maxSizeInBytes) {
      return res.status(400).json({
        code: 400,
        message: "Kích thước tập tin vượt quá giới hạn 1MB",
      });
    }
    const acceptedFormats = ["jpeg", "png", "gif", "jpg"];
// Kiểm tra định dạng tập tin
const fileData = Uint8Array.from(file.data);  // Chuyển đổi dữ liệu từ Buffer thành Uint8Array
const mimeType = mime.lookup(file.name);

if (!mimeType || !acceptedFormats.includes(mimeType.split('/')[1])) {
  return res.status(400).json({
    code: 400,
    message: "Tập tin không phải là hình ảnh hợp lệ",
  })&& logger.warn({status:400, message: "Tập tin không phải là hình ảnh hợp lệ", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
}

const dimensions = sizeOf(fileData);

if (!acceptedFormats.includes(dimensions.type.toLowerCase())) {
  return res.status(400).json({
    code: 400,
    message: "Tập tin không phải là hình ảnh hợp lệ",
  })&& logger.warn({status:400, message: "Tập tin không phải là hình ảnh hợp lệ", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
}

    // Di chuyển tập tin đến địa chỉ đích
    await file.mv(uploadPath);

    // Cập nhật thông tin người dùng
    const updateUserAvatar = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { image: newFileName},
      {
        new: true,
        useFindAndModify: false,
      }
    );

    if (!updateUserAvatar) {
      return res.status(500).json({
        code: 500,
        message: "Cập nhật thông tin người dùng thất bại",
      })&& logger.error({status:500, message: "Cập nhật thông tin người dùng thất bại", data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    }

    // Trả về kết quả thành công
    return res.status(200).json({
      data: updateUserAvatar,
      code: 200,
      message: "Thay đổi avatar thành công",
    })&& logger.info({status:200, message: "Thay đổi avatar thành công", data: updateUserAvatar, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });

  } catch (error) {
    console.error("Error during avatar upload:", error);
    return res.status(500).json({
      code: 500,
      message: "Thay đổi avatar thất bại",
    }) && logger.error({status:500, message: "Thay đổi avatar thất bại", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});
router.post("/checkToken", (req, res) => {
  const token = req.body.token;
  const role = req.body.role;
  const tokenAuth = key.tokenKey;

  jwt.verify(tokenAuth, token, function (error, decoded) {
    if (error) {
      console.error("Error during token verification:", error);
      return res.json({
        role: role,
        message: "Error during token verification",
      });
    }

    if (decoded) {
      switch (role) {
        case "admin":
        case "editor":
        case "journalist":
        case "customer":
          return res.json({ role: role });
        default:
          return res.json({ role: role, message: "Unknown role" });
      }
    }
  });
});

// Route đặt lại mật khẩu
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Email không tồn tại",
      })&& logger.warn({status:404, message: "Email không tồn tại", data: req.body , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpire = Date.now() + 300000; // Hết hạn sau 5 phút
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpire = resetTokenExpire;
    await user.save();

    // Gửi email chứa liên kết đặt lại mật khẩu
    const transporter = nodemailer.createTransport({
      // Cấu hình transporter để gửi email
      service: "gmail",
      auth: {
        user: "tienanhbghd@gmail.com",
        pass: "puqz ybtd mulo cdii",
      },
    });

    const mailOptions = {
      from: "tienanhbghd@gmail.com",
      to: user.email,
      subject: "Đặt lại mật khẩu",
      text: `Để đặt lại mật khẩu, vui lòng truy cập liên kết sau: http://ddtienanh.fun/reset-password/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: "Gửi email thất bại",
        }) && logger.error({status:500, message: "Gửi email thất bại", error });
      }
      console.log(`Email sent: ${info.response}`);
      return res.status(200).json({
        code: 200,
        message: "Email đặt lại mật khẩu đã được gửi",
      }) && logger.info({status:200, message: "Email đặt lại mật khẩu đã được gửi", data : req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi server",
    })&& logger.error({status:500, message: "Lỗi server", error , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// Route để xác nhận và đặt lại mật khẩu
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Tìm người dùng với mã đặt lại hợp lệ
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      })&& logger.warn({status:400, message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", data : req.body + req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
    }

    // Hash mật khẩu mới và cập nhật vào cơ sở dữ liệu
    const hash = await bcrypt.hash(newPassword, 8);
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save();

    return res.status(200).json({
      code: 200,
      message: "Mật khẩu đã được đặt lại thành công",
    }) && logger.info({status:200, message: "Mật khẩu đã được đặt lại thành công", data : user , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi server",
    })&& logger.error({status:500, message: "Lỗi server", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack  });
  }
});

module.exports = router;
