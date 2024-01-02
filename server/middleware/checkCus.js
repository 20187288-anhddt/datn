const cookie = require('cookie');
const express = require('express');
const UserModel = require('../models/User');
const jwt = require("jsonwebtoken");

const key = {
    tokenKey: process.env.TOKEN_KEY || "djghhhhuuwiwuewieuwieuriwu"
};

const authCus = async function (req, res, next) {
    const token = req.header('auth-token');

    // Xử lý trường hợp không có token
    if (!token) {
        return res.status(401).json({
            code: 401,
            message: "Token không được cung cấp",
            data: null
        });
    }

    try {
        // Xác thực token
        const verified = jwt.verify(token, key.tokenKey);

        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const userCheck = await UserModel.findOne({ _id: verified._id });

        // Xử lý trường hợp người dùng không tồn tại
        if (!userCheck) {
            return res.status(401).json({
                code: 401,
                message: "Người dùng không tồn tại",
                data: null
            });
        }

        // Kiểm tra vai trò người dùng
        if (userCheck.role === 'customer' || userCheck.role === 'admin') {
            // Attach thông tin người dùng vào request
            req.user = userCheck;
            req.user.password = null;
            next();
        } else {
            return res.status(401).json({
                code: 401,
                message: "Không có quyền đăng nhập",
                data: null
            });
        }
    } catch (err) {
        // Xử lý lỗi xác thực token
        console.error("Lỗi xác thực token:", err);
        return res.status(400).json({
            code: 400,
            message: "Token không hợp lệ",
            data: null
        });
    }
};

module.exports = { authCus };
