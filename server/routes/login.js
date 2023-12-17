const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validInput = require("../utils/validInput");
const authenticateToken = require("../utils/authenticateToken");
const { responseCode, callRes } = require("../response/error");
const UserModel = require("../models/User");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
    const userExist = await UserModel.findOne({ email: req.body.email });

    if (!userExist) {
      const hash = await bcrypt.hash(req.body.password, 8);
      const User = new UserModel();

      User.username = req.body.userName;
      User.password = hash;
      // User.image = file.name;
      User.email = req.body.email;

      const userCreate = await User.save();

      return res.json({
        code: 200,
        message: "Bạn đã đăng ký thành công",
        data: { userCreate },
      });
    } else {
      return res.json({
        code: 200,
        message: "Người dùng đã tồn tại",
        data: null,
      });
    }
  } catch (err) {
    return res.json({ code: 400, message: err.message, data: null });
  }
});

router.post("/register", async function (req, res) {
  const { password, email, username } = req.body;

  if (!email || !password || !username) {
    return callRes(
      res,
      responseCode.PARAMETER_IS_NOT_ENOUGH,
      "email, password, username"
    );
  }

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return callRes(
      res,
      responseCode.PARAMETER_TYPE_IS_INVALID,
      "email, password, username"
    );
  }

  if (!validInput.checkUserPassword(password)) {
    return callRes(res, responseCode.PARAMETER_VALUE_IS_INVALID, "password");
  }

  if (!validInput.checkEmail(email)) {
    return callRes(res, responseCode.PARAMETER_VALUE_IS_INVALID, "email");
  }

  if (!validInput.checkUserName(username)) {
    return callRes(res, responseCode.PARAMETER_VALUE_IS_INVALID, "username");
  }

  if (email === password) {
    return callRes(
      res,
      responseCode.PARAMETER_VALUE_IS_INVALID,
      "trùng email và pass"
    );
  }

  try {
    let emailExists = await UserModel.findOne({ email });

    if (emailExists) {
      return res.json({
        code: 200,
        message: "Email đã được đăng ký trước đó",
        data: null,
      });
    }

    // Hash password nếu người dùng không tồn tại
    const hash = await bcrypt.hash(password, 8);
    const user = new UserModel({
      username,
      password: hash,
      email,
    });

    const userCreate = await user.save();

    return res.status(201).json({
      code: 201,
      message: "Bạn đã đăng ký thành công",
      data: { userCreate },
    });
  } catch (err) {
    console.error("Error during signup:", err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error", data: null });
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
      });
    }

    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await UserModel.findOne({ email });

    // Kiểm tra người dùng có tồn tại hay không
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Email không tồn tại, vui lòng kiểm tra lại!",
        data: null,
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isDelete === true) {
      return res.status(401).json({
        code: 401,
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!",
        data: null,
      });
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
      });
    } else {
      // Trường hợp mật khẩu không chính xác
      return res.status(401).json({
        code: 401,
        message: "Email hoặc mật khẩu không chính xác",
        data: null,
      });
    }
  } catch (err) {
    // Xử lý lỗi
    return res
      .status(400)
      .json({ code: 400, message: err.message, data: null });
  }
});

// get user
router.get("/:token", async (req, res) => {
  const userToken = req.params.token;

  if (!userToken) {
    return res.status(400).json({
      code: 400,
      message: "Token không được cung cấp",
    });
  }

  let decoded;
  try {
    decoded = jwt.decode(userToken);
  } catch (error) {
    return res.status(400).json({
      code: 400,
      message: "Token không hợp lệ",
    });
  }

  if (!decoded || !decoded._id) {
    return res.status(400).json({
      code: 400,
      message: "Token không chứa thông tin người dùng hợp lệ",
    });
  }

  const id = decoded._id;
  const user = await UserModel.findOne({ _id: id });

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "Người dùng không tồn tại",
    });
  }

  const { username, role, email, image, _id } = user;

  return res.json({
    code: 200,
    data: { username, role, email, image, _id },
  });
});

// update name, email, password, photo
router.put("/updateName/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra người dùng tồn tại
    const userExist = await UserModel.findOne({ _id: req.params.id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
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
      });
    }
  } catch (error) {
    console.error("Error during name update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật tên thất bại",
    });
  }
});

router.put("/updateEmail/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra người dùng tồn tại
    const userExist = await UserModel.findOne({ _id: req.params.id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }

    // Kiểm tra email mới có hợp lệ không
    const newEmail = req.body.newEmail;

    if (!validInput.checkEmail(newEmail)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ",
      });
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
      });
    }
  } catch (error) {
    console.error("Error during email update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật email thất bại",
    });
  }
});

router.put("/updatePassword/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng cung cấp cả mật khẩu hiện tại và mật khẩu mới",
      });
    }
    const userExist = await UserModel.findOne({ _id: req.params.id });
    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
      });
    }
    const comparePassword = await bcrypt.compare(
      currentPassword,
      userExist.password
    );
    if (comparePassword) {
      if (!validInput.checkUserPassword(newPassword)) {
        return callRes(
          res,
          responseCode.PARAMETER_VALUE_IS_INVALID,
          "password"
        );
      }
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
        });
      }
    } else {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu hiện tại không đúng",
      });
    }
  } catch (error) {
    console.error("Error during password update:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật mật khẩu thất bại",
    });
  }
});

router.put("/uploadAvatar/:id", authenticateToken, async (req, res) => {
  try {
    const userExist = await UserModel.findOne({ _id: req.params.id });

    if (userExist) {
      const file = req.files && req.files.file;

      if (file) {
        const uploadPath = path.join(
          __dirname,
          "../../client/public/uploads/users/",
          file.name
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

        // Kiểm tra định dạng tập tin
        const dimensions = sizeOf(file.tempFilePath);
        const acceptedFormats = ["jpeg", "png", "gif", "jpg"];

        if (!acceptedFormats.includes(dimensions.type.toLowerCase())) {
          return res.status(400).json({
            code: 400,
            message: "Tập tin không phải là hình ảnh hợp lệ",
          });
        }

        file.mv(uploadPath);

        const user = {
          image: file.name,
        };

        const updateUserAvatar = await UserModel.findOneAndUpdate(
          { _id: req.params.id },
          user,
          {
            new: true,
            useFindAndModify: false,
          }
        );

        if (updateUserAvatar) {
          return res.status(200).json({
            data: updateUserAvatar,
            code: 200,
            message: "Thay đổi avatar thành công",
          });
        }
      }
    }

    return res.status(404).json({
      code: 404,
      message: "Người dùng không tồn tại",
    });
  } catch (error) {
    console.error("Error during avatar upload:", error);
    return res.status(500).json({
      code: 500,
      message: "Thay đổi avatar thất bại",
    });
  }
});

router.post("/checkToken", (req, res) => {
  const token = req.body.token;
  const role = req.body.role;
  const tokenAuth = key.tokenKey;

  jwt.verify(tokenAuth, token, function (err, decoded) {
    if (err) {
      console.error("Error during token verification:", err);
      return res.json({
        role: role,
        message: "Error during token verification",
      });
    }

    if (decoded) {
      switch (role) {
        case "admin":
        case "sensor":
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
      });
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
      text: `Để đặt lại mật khẩu, vui lòng truy cập liên kết sau: http://your-app/reset-password/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({
          code: 500,
          message: "Gửi email thất bại",
        });
      }
      console.log(`Email sent: ${info.response}`);
      return res.status(200).json({
        code: 200,
        message: "Email đặt lại mật khẩu đã được gửi",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi server",
    });
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
      });
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
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi server",
    });
  }
});

module.exports = router;
