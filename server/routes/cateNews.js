var express = require("express");
const CateNewsModel = require("../models/CateNews");
const subCateNewsModel = require("../models/CateNews");
const NewsModel = require("../models/News");
var router = express.Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/checkAdmin");
const authCus = require("../middleware/checkCus");
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      error: err.message,
      data: null,
    });
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
      });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Thêm thất bại",
      err: err.message,
      data: null,
    });
  }
});

router.post("/subCateNews", async function (req, res, next) {
  try {
    const { subCategory, parentCategoryId, createdBy } = req.body;
    console.log(subCategory);
    console.log(parentCategoryId);
    console.log(createdBy);
    // Validation: Đảm bảo rằng 'subCategory', 'parentCategoryId', và 'createdBy' có giá trị
    if (!subCategory || !parentCategoryId || !createdBy) {
      return res.status(400).json({
        code: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
        err: null,
        data: null,
      });
    }

    // Kiểm tra xem parentCategoryId có tồn tại trong CateNews không
    const parentCategoryExists = await CateNewsModel.findById(parentCategoryId);
    if (!parentCategoryExists) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy chuyên mục cha",
        err: null,
        data: null,
      });
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Thêm thất bại",
      err: err.message,
      data: null,
    });
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
          });
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Thêm vào giỏ rác thất bại",
        err: err,
        data: null,
      });
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
          });
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Thêm vào giỏ rác thất bại",
        err: err,
        data: null,
      });
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
          });
        }
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Restore thất bại",
        err: err,
        data: null,
      });
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
          });
        }
      } else {
        res.json({
          code: 404,
          message: "Không tìm thấy chuyên mục con trong giỏ rác",
          err: null,
          data: null,
        });
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Khôi phục thất bại",
        err: err,
        data: null,
      });
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
          });
        }
      }
    } catch (err) {
      res.json({
        code: 400,
        message: "Xóa thất bại",
        data: null,
      });
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
          });
        }
      } else {
        res.json({
          code: 404,
          message: "Không tìm thấy chuyên mục con trong giỏ rác",
          err: null,
          data: null,
        });
      }
    } catch (err) {
      return res.json({
        code: 400,
        message: "Xóa chuyên mục con thất bại",
        err: err,
        data: null,
      });
    }
  }
);

module.exports = router;
