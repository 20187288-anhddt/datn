var express = require("express");
const CateNewsModel = require("../models/CateNews");
const subCateNewsModel = require("../models/CateNews");
const NewsModel = require("../models/News");
var router = express.Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/checkAdmin");
const authCus = require("../middleware/checkCus");
const logger = require("../utils/logger");
const authenticateToken = require("../utils/authenticateToken");

router.get("/", async function (req, res, next) {
  try {
    const cateNews = await CateNewsModel.find({ isDelete: false }).populate('parentCateNewsName');
     // Đảo ngược mảng trực tiếp
     cateNews.reverse();
    return res.json({
      code: 200,
      error: null,
      data: cateNews,
    }) && logger.info({status:200, message:"Lấy danh sách thể loại thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    }) && logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
  }
});

router.get("/cateNews", async function (req, res, next) {
  try {
    const cateNews = await CateNewsModel.find({ isDelete: false, parentCateNews:null }).populate('parentCateNewsName');
     // Đảo ngược mảng trực tiếp
     cateNews.reverse();
    return res.json({
      code: 200,
      error: null,
      data: cateNews,
    }) && logger.info({status:200, message:"Lấy danh sách thể loại thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    })&& logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});;
  }
});

router.get("/subCateNews", async function (req, res, next) {
  try {
    const subCateNews = await CateNewsModel.find({ isDelete: false, parentCateNews: { $ne: null } }).populate('parentCateNewsName');
     // Đảo ngược mảng trực tiếp
     subCateNews.reverse();
    return res.json({
      code: 200,
      error: null,
      data: subCateNews,
    })&& logger.info({status:200, message:"Lấy danh sách thể loại con thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    })&& logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
  }
});


// router.get("/subCateNews", async function (req, res, next) {
//   try {
//     const subCateNews = await subCateNewsModel.find({ isDelete: false }).populate(
//       "createdBy"
//     );

//     return res.json({
//       code: 200,
//       error: null,
//       data: subCateNews,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       code: 500,
//       error: err.message,
//       data: null,
//     });
//   }
// });

router.get("/:id/subcategories", async function (req, res, next) {
  try {
    const categoryId = req.params.id;
    const subCategories = await CateNewsModel.find({
      parentCateNews: categoryId,
      isDelete: false,
    });

    return res.status(200).json({
      code: 200,
      error: null,
      data: subCategories,
    })&& logger.info({status:200, message:"Lấy danh sách thể loại con của parentCateNews thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    })&& logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack})
  }
});
router.get("/trash", async function (req, res, next) {
  try {
    const cateNews = await CateNewsModel.find({ isDelete: true }).populate(
      "createdBy"
    );

    return res.json({
      code: 200,
      error: null,
      data: cateNews,
    })&& logger.info({status:200, message:"Lấy danh sách thể loại trong giỏ rác thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    })&& logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack})
  }
});

router.get("/:_idCate", auth, async function (req, res, next) {
  try {
    const categoryId = req.params._idCate;
    const cateNews = await CateNewsModel.find({
      _id: categoryId,
      isDelete: false,
    }).populate("createdBy");

    return res.status(200).json({
      code: 200,
      error: null,
      data: cateNews,
    })&& logger.info({status:200, message:"Lấy thông tin thể loại thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    })&& logger.error({status:500, message: err.message, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { category, createdBy } = req.body;

    // Validation: Đảm bảo rằng 'category' và 'createdBy' có giá trị
    if (!category) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
        err: null,
        data: null,
      })&& logger.warn({status:400, message: "Dữ liệu đầu vào không hợp lệ", data : req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }

    const Category = new CateNewsModel({
      name: category,
      createdBy: createdBy,
    });

    const CategoryClass = await Category.save();

    return res.status(201).json({
      code: 201,
      message: "Thêm thành công",
      data: CategoryClass,
      err: null,
    }) && logger.info({status:201, message:"Thêm thể loại thành công ",data:  CategoryClass, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Thêm thất bại",
      err: err.message,
      data: null,
    })&& logger.error({status:500, message: "Thêm thể loại thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});;
  }
});

router.post("/subCateNews", async function (req, res, next) {
  try {
    const { subCategory, parentCategoryId, createdBy } = req.body;

    // Validation: Đảm bảo rằng 'subCategory', 'parentCategoryId', và 'createdBy' có giá trị
    if (!subCategory || !parentCategoryId || !createdBy) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
        err: null,
        data: null,
      })
      && logger.warn({status:400, message: "Dữ liệu đầu vào không hợp lệ", data : req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Kiểm tra xem parentCategoryId có tồn tại trong CateNews không
    const parentCategoryExists = await CateNewsModel.findById(parentCategoryId);
    if (!parentCategoryExists) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy chuyên mục cha",
        err: null,
        data: null,
      })
      && logger.warn({status:404, message: "Không tìm thấy chuyên mục cha", data : req.body, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    // Tạo một đối tượng SubCategory
    const subCategoryObject = {
      name: subCategory,
      parentCateNews: parentCategoryId,
      createdBy: createdBy,
    };

    // Tạo SubCategory trong CSDL
    const SubCategory = await CateNewsModel.create(subCategoryObject);

    return res.status(201).json({
      code: 201,
      message: "Thêm thành công",
      data: SubCategory,
      err: null,
    })
    && logger.info({status:201, message: "Thêm subCateNews thành công", data : SubCategory, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Thêm thất bại",
      err: err.message,
      data: null,
    })&& logger.error({status:500, message: "Thêm subCateNews thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
  }
});
// move to trash
router.put(
  "/trash/:_id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    try {
      const _id = req.params._id;
      const cateExist = await CateNewsModel.findOne({ _id: _id });

      if (cateExist) {
        const moveToTrash = await CateNewsModel.findOneAndUpdate(
          { _id: _id },
          { isDelete: true }
        );
        const categories = await CateNewsModel.find({});

        if (moveToTrash) {
          res.json({
            data: categories,
            message: "Đã thêm vào giỏ rác",
            code: 200,
          })
          logger.info({status:200, message: "Đã thêm vào giỏ rác", data : moveToTrash, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Thêm vào giỏ rác thất bại",
        err: err,
        data: null,
      })&& logger.error({status:400, message: "Thêm vào giỏ rác thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});;
    }
  }
);

router.put(
  "/subCateNews/trash/:_id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    try {
      const _id = req.params._id;
      const subCateExist = await subCateNewsModel.findOne({ _id: _id });

      if (subCateExist) {
        const moveToTrash = await subCateNewsModel.findOneAndUpdate(
          { _id: _id },
          { isDelete: true }
        );
        const subCategories = await subCateNewsModel.find({});

        if (moveToTrash) {
          res.json({
            data: subCategories,
            message: "Đã thêm vào giỏ rác",
            code: 200,
          })&& logger.info({status:200, message: "Đã thêm vào giỏ rác", data : moveToTrash, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Thêm vào giỏ rác thất bại",
        err: err,
        data: null,
      })&& logger.error({status:400, message: "Thêm vào giỏ rác thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
    }
  }
);

// restore from trash
router.put(
  "/restore/:_id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    try {
      const _id = req.params._id;
      const cateExist = await CateNewsModel.findOne({ _id: _id });

      if (cateExist) {
        const restoreFromTrash = await CateNewsModel.findOneAndUpdate(
          { _id: _id },
          { isDelete: false }
        );
        const categories = await CateNewsModel.find({ isDelete: true });

        if (restoreFromTrash) {
          res.json({
            data: categories,
            message: "Restore thành công",
            code: 200,
          }) && logger.info({status:200, message: "Restore thể loại thành công", data : restoreFromTrash, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Restore thất bại",
        err: err,
        data: null,
      })&& logger.error({status:400, message: "Restore thể loại thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});;
    }
  }
);

router.put(
  "/restore/subCateNews/:_id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    try {
      const _id = req.params._id;
      const subCateExist = await subCateNewsModel.findOne({ _id: _id, isDelete: true });

      if (subCateExist) {
        const restoreSubCate = await subCateNewsModel.findOneAndUpdate(
          { _id: _id },
          { isDelete: false }
        );
        const subCategories = await subCateNewsModel.find({});

        if (restoreSubCate) {
          res.json({
            data: subCategories,
            message: "Khôi phục thành công",
            code: 200,
          })&& logger.info({status:200, message: "Khôi phục subCateNews thành công", data : restoreSubCate, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
        }
      } else {
        res.json({
          code: 404,
          message: "Không tìm thấy chuyên mục con trong giỏ rác",
          err: null,
          data: null,
        })&& logger.warn({status:404, message: "Không tìm thấy subCateNews trong giỏ rác", data : req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Khôi phục thất bại",
        err: err,
        data: null,
      })&& logger.error({status:400, message: "Khôi phục thất bại", err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});;
    }
  }
);


router.delete(
  "/:id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    const cateId = req.params.id;
    const cateCheck = CateNewsModel.findOne({ _id: cateId });
    try {
      if (cateCheck) {
        const cateDelete = await CateNewsModel.findOneAndDelete({
          _id: cateId,
        });
        const cateNews = await CateNewsModel.find({ isDelete: true }).populate(
          "createdBy"
        );

        if (cateDelete) {
          res.json({
            code: 200,
            message: "Xóa thành công",
            data: cateNews,
          })&& logger.info({status:200, message: "Xóa thể loại thành công", data : req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
        }
      }
    } catch (err) {
      res.json({
        code: 400,
        message: "Xóa thất bại",
        data: null,
      })&& logger.error({status:400, message: "Xóa thất bại", data: req.params, err, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack});
    }
  }
);

router.delete(
  "/delete/subCateNews/:_id",
  // authenticateToken,
  // authAdmin.isAdmin,
  async function (req, res, next) {
    try {
      const _id = req.params._id;
      const subCateExist = await subCateNewsModel.findOne({ _id: _id, isDelete: true });

      if (subCateExist) {
        const deleteSubCate = await subCateNewsModel.deleteOne({ _id: _id });
        const subCategories = await subCateNewsModel.find({});

        if (deleteSubCate) {
          res.json({
            data: subCategories,
            message: "Xóa chuyên mục con thành công",
            code: 200,
          })&& logger.info({status:200, message: "Xóa chuyên mục con thành công", data : subCateExist, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
        }
      } else {
        res.json({
          code: 404,
          message: "Không tìm thấy chuyên mục con trong giỏ rác",
          err: null,
          data: null,
        })&& logger.warn({status:404, message: "Không tìm thấy chuyên mục con trong giỏ rác", data : req.params, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Xóa chuyên mục con thất bại",
        err: err,
        data: null,
      }) && logger.warn({status:400, message: "Xóa chuyên mục con thất bại", err , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: err.stack})
    }
  }
);

module.exports = router;
