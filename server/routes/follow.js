const express = require('express');
const router = express.Router();

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
      });
    }

    // Trả về dữ liệu người theo dõi thành công
    res.status(200).json({
      code: 200,
      data: followers
    });
  } catch (e) {
    // Xử lý lỗi khi truy vấn
    handleRouteError(res, e, "Lỗi khi truy vấn người theo dõi");
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
      });
    }

    // Kiểm tra xem mối quan hệ theo dõi đã tồn tại chưa
    const existingFollower = await FollowerModel.findOne({ channel, followBy: user });

    if (existingFollower) {
      return res.status(400).json({
        code: 400,
        message: "Mối quan hệ theo dõi đã tồn tại",
      });
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
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Đã xảy ra lỗi khi tạo mối quan hệ",
      });
    }
  } catch (e) {
    // Xử lý lỗi khi thực hiện thêm mối quan hệ
    handleRouteError(res, e, "Lỗi khi thêm mối quan hệ theo dõi");
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
      });
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
    });
  } catch (err) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, err, "Lỗi khi cập nhật theo dõi");
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
      });
    }

    // Xóa mối quan hệ theo dõi
    const removeFollower = await FollowerModel.findByIdAndDelete(id);

    // Trả về thông báo thành công sau khi xóa
    return res.status(200).json({
      code: 200,
      message: "Hủy theo dõi thành công",
    });
  } catch (e) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, e, "Lỗi khi hủy theo dõi");
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
      });
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
    });
  } catch (err) {
    // Xử lý trường hợp lỗi và trả về phản hồi chi tiết
    handleRouteError(res, err, "Lỗi khi bỏ theo dõi");
  }
});

module.exports = router;
