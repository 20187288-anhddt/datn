const express = require('express');
const router = express.Router();
const logger = require("../utils/logger")
const FollowerModel = require("../models/Follow");
const UserModel = require("../models/User");

// Hàm xử lý lỗi chung cho các route
const handleRouteError = (res, error, defaultMessage) => {
  console.error(defaultMessage, error);
  res.status(500).json({
    code: 500,
    message: error.message || defaultMessage,
    data: null,
  });
};

router.get("/", async (req, res) => {
  try {
    const followers = await FollowerModel.find({});

    // Xử lý trường hợp không có người theo dõi
    if (followers.length === 0) {
      return res.status(200).json({
        code: 200,
        data: [],
        message: "Không có người theo dõi nào được tìm thấy"
      })&& logger.info({status:200, message:"Không có người theo dõi nào được tìm thấy", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Trả về dữ liệu người theo dõi thành công
    res.status(200).json({
      code: 200,
      data: followers
    });
  } catch (error) {
    // Xử lý lỗi khi truy vấn
    handleRouteError(res, error, "Lỗi khi truy vấn người theo dõi");
    logger.error({status:500, message:"Lỗi khi truy vấn người theo dõi", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

router.post("/", async (req, res) => {
  try {
    const { channel, user } = req.body;

    // Kiểm tra xem dữ liệu đầu vào có đầy đủ không
    if (!channel || !user) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
      })&& logger.warn({status:400, message:"Dữ liệu đầu vào không hợp lệ",data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Kiểm tra xem mối quan hệ theo dõi đã tồn tại chưa
    const existingFollower = await FollowerModel.findOne({ channel, followBy: user });

    if (existingFollower) {
      return res.status(400).json({
        code: 400,
        message: "Mối quan hệ theo dõi đã tồn tại",
      })&& logger.warn({status:400, message:"Mối quan hệ theo dõi đã tồn tại",data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Tạo mối quan hệ theo dõi mới
    const follower = new FollowerModel({
      channel: channel,
      followBy: user,
    });

    // Lưu mối quan hệ theo dõi
    const saveFollower = await follower.save();

    // Xử lý trường hợp thêm mối quan hệ không thành công
    if (saveFollower) {
      return res.status(200).json({
        code: 200,
        message: "Following",
      })&& logger.info({status:200, message:"Following",data: saveFollower, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    } else {
      return res.status(500).json({
        code: 500,
        message: "Đã xảy ra lỗi khi tạo follow",
      })&& logger.warn({status:500, message:"Đã xảy ra lỗi khi tạo follow",data: req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }
  } catch (error) {
    // Xử lý lỗi khi thực hiện thêm mối quan hệ
    handleRouteError(res, error, "Lỗi khi thêm mối quan hệ theo dõi");
    logger.error({status:500, message:"Lỗi khi thêm mối quan hệ theo dõi",error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack})
  }
});

router.put("/increase/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    // Kiểm tra xem người dùng cần được cập nhật có tồn tại không
    const userExist = await UserModel.findOne({ _id: _id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
        data: null,
      })&& logger.warn({status:404, message:"Người dùng không tồn tại",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    const body = req.body;

    // Sử dụng findByIdAndUpdate để cập nhật người dùng
    const updateFollow = await UserModel.findByIdAndUpdate(_id, { follow: body.follow }, { new: true });

    // Lấy danh sách người theo dõi sau khi cập nhật
    const followers = await FollowerModel.find({});

    // Trả về kết quả thành công
    return res.status(200).json({
      code: 200,
      message: "Theo dõi thành công",
      data: followers,
    })&& logger.info({status:200, message:"Theo dõi thành công",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, error, "Lỗi khi cập nhật theo dõi");
    logger.error({status:500, message:"Lỗi khi thêm mối quan hệ theo dõi",error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack})
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem mối quan hệ theo dõi có tồn tại không
    const checkFollwer = await FollowerModel.findOne({ _id: id });

    if (!checkFollwer) {
      return res.status(404).json({
        code: 404,
        message: "Mối quan hệ theo dõi không tồn tại",
      })
     && logger.warn({status:404, message:"Mối quan hệ theo dõi không tồn tại",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Xóa mối quan hệ theo dõi
    const removeFollower = await FollowerModel.findByIdAndDelete(id);

    // Trả về thông báo thành công sau khi xóa
    return res.status(200).json({
      code: 200,
      message: "Hủy theo dõi thành công",
    }) && logger.info({status:200, message:"Hủy theo dõi thành công",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, error, "Lỗi khi hủy theo dõi");
    logger.error({status:500, message:"Lỗi khi hủy theo dõi",error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack})
  }
});

router.put("/decrease/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    // Kiểm tra xem người dùng cần được cập nhật có tồn tại không
    const userExist = await UserModel.findOne({ _id: _id });

    if (!userExist) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại",
        data: null,
      })&& logger.warn({status:404, message:"Người dùng không tồn tại",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }

    const body = req.body;

    // Sử dụng findByIdAndUpdate để cập nhật người dùng
    const updateFollow = await UserModel.findByIdAndUpdate(_id, { follow: body.follow }, { new: true });

    // Lấy danh sách người theo dõi sau khi cập nhật
    const followers = await FollowerModel.find({});

    // Trả về kết quả thành công
    return res.status(200).json({
      code: 200,
      message: "Bỏ theo dõi thành công",
      data: followers,
    })&& logger.info({status:200, message:"Hủy theo dõi thành công",data: req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, error, "Lỗi khi bỏ theo dõi");
    logger.error({status:500, message:"Lỗi khi hủy theo dõi",error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack})
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();

// const FollowerModel = require("../models/Follow");
// const UserModel = require("../models/User");

// router.get("/", async (req, res) => {
//   try {
//     const followers = await FollowerModel.find({});

//     if (followers) {
//       res.json({
//         code: 200,
//         data: followers
//       });
//     }
//   } catch (e) {
//     res.json({
//       code: 400,
//       message: e
//     });
//   }
// });

// // follow
// router.post("/", async (req, res) => {
//   try {
//     const body = req.body;
//     const follower = new FollowerModel({
//       channel: body.channel,
//       followBy: body.user
//     });

//     const saveFollower = await follower.save();

//     if (saveFollower) {
//       res.json({
//         code: 200,
//         message: "Following"
//       });
//     }
//   } catch (e) {
//     res.json({
//       code: 400,
//       message: e
//     });
//   }
// });

// router.put("/increase/:id", async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const userExist = await UserModel.findOne({ _id: _id });

//     if (userExist) {
//       const body = req.body;

//       const updateFollow =  await UserModel.findOneAndUpdate({ _id: _id }, { follow: body.follow });
//       const followers = await FollowerModel.find({});

//       if (updateFollow) {
//         return res.json({
//           code: 200,
//           message: "Theo dõi thành công",
//           data: followers
//         });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       code: 400,
//       message: "Theo dõi thất bại",
//       err: err,
//       data: null
//     });
//   }
// });

// // unfollow
// router.delete("/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const checkFollwer = await FollowerModel.findOne({ _id: id });
//     console.log(id);

//     if (checkFollwer) {

//       const removeFollower = await FollowerModel.findOneAndDelete({ _id: id });
//       // const followers = await FollowerModel.find({});

//       if (removeFollower) {
//         res.json({
//           code: 200,
//           message: "Huy Following thanh cong"
//         });
//       }
//     }
//   } catch (e) {
//     res.json({
//       code: 400,
//       message: e
//     });
//   }
// });

// router.put("/decrease/:id", async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const userExist = await UserModel.findOne({ _id: _id });

//     if (userExist) {
//       const body = req.body;

//       const updateFollow =  await UserModel.findOneAndUpdate({ _id: _id }, { follow: body.follow });
//       const followers = await FollowerModel.find({});

//       if (updateFollow) {
//         return res.json({
//           code: 200,
//           message: "Bỏ theo dõi thành công",
//           data: followers
//         });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       code: 400,
//       message: "Bỏ theo dõi thất bại",
//       err: err,
//       data: null
//     });
//   }
// });

// module.exports = router;