const express = require("express");
const fileUpload = require("express-fileupload");
const NewsModel = require("../models/News");
const RateModel = require("../models/Rate");
const LikeModel = require("../models/Like");
const ViewModel = require("../models/View");
const FollowModel = require("../models/Follow");
const router = express.Router();
const auth = require("../middleware/auth");
const authJour = require("../middleware/checkJournalist");
const authEditor = require("../middleware/checkEditor");
const cheerio = require("cheerio");
const request = require("request-promise");
const axios = require("axios");
const moment = require("moment");
const dotenv = require("dotenv");
const OpenAI = require( "openai");
const logger = require("../utils/logger")

const openai = new OpenAI({
  apiKey: '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',
}
);

/* GET users listing. */

const app = express();
app.use(fileUpload());

function sortNewsListByDateFirst(newsList) {
  newsList.sort((newsOne, newsTwo) => {
    const dateOne = moment(newsOne.dateCreate).format("DD-MM-YYYY");
    const dateTwo = moment(newsTwo.dateCreate).format("DD-MM-YYYY");
    if (dateOne > dateTwo) return -1;
    if (dateOne == dateTwo) {
      if (newsOne.view > newsTwo.view) return -1;
      if (newsOne.view < newsTwo.view) return 1;
    }
    if (dateOne < dateTwo) return 1;
    return 0;
  });
  return newsList;
}

function sortNewsListByViewFirst(newsList) {
  return newsList.sort((newsOne, newsTwo) => {
    const dateOne = moment(newsOne.dateCreate).format("DD-MM-YYYY");
    const dateTwo = moment(newsOne.dateCreate).format("DD-MM-YYYY");
    if (newsOne.view > newsTwo.view) return -1;
    if (newsOne.view == newsTwo.view) {
      if (dateOne > dateTwo) return -1;
      if (dateOne < dateTwo) return 1;
    }
    if (newsOne.view < newsTwo.view) return 1;
    return 0;
  });
  return newsList;
}

// get trash ( isDelete = true )
router.get("/trash", async function (req, res, next) {
  try {
    const News = await NewsModel.find({ isDelete: true })
      .populate("cateNews")
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách bài viết trash thành công" , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    console.log(error);
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.error({status:400, message: error.messege, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// get news entertainment
router.get("/newsEntertainments", async function (req, res, next) {
  try {
    const newsId = req.query.newsId;
    const News = await NewsModel.find({ status: "published", cateNews: newsId })
      .limit(9)
      .sort({ view: -1, dateCreate: -1 })
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách tin tức giải trí thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.error({status:400, message: error.messege, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});;
  }
});

// get news Reel
router.get("/newsReels", async function (req, res, next) {
  try {
    const newsId = req.query.newsId;

    if (!newsId) {
      return res.status(400).json({
        code: 400,
        error: "Missing 'newsId' parameter",
        data: null,
      }) && logger.error({status:400, message: "Missing 'newsId' parameter", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers  });
    }

    // Tiếp tục xử lý với newsId hợp lệ
    const News = await NewsModel.find({ status: "published", cateNews: newsId })
      .limit(8)
      .sort({ view: -1, dateCreate: -1 })
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách tin tức thời sự thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: error.message,
      data: null,
    }) && logger.error({status:500, message: error.message,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack });
  }
});

// search
// router.get("/q", async function (req, res, next) {
//   try {
//     const textSearch = req.query.textSearch;

//     if (!textSearch || textSearch.trim() === "") {
//       return res.status(400).json({
//         code: 400,
//         error: "Invalid or missing 'textSearch' parameter",
//         data: null,
//       });
//     }

//     const News = await NewsModel.find({
//       title: { $regex: textSearch, $options: "i" },
//       isDelete: false,
//       status: "published",
//     })
//       .limit(30)
//       .sort({ view: -1, dateCreate: -1 });
//       console.log(News);
//     if (News) {
//       return res.json({
//         code: 200,
//         error: null,
//         data: News,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       code: 500,
//       error: error.message,
//       data: null,
//     });
//   }
// });
const Fuse = require('fuse.js');

router.get("/q", async function (req, res, next) {
  try {
    const textSearch = req.query.textSearch;

    if (!textSearch || textSearch.trim() === "") {
      return res.status(400).json({
        code: 400,
        error: "Vui lòng nhập 'textSearch' parameter",
        data: null,
      }) && logger.warn({status:400, message: "Vui lòng nhập 'textSearch' parameter", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
    }

    const newsData = await NewsModel.find({
      isDelete: false,
      status: "published",
    })
      .sort({ view: -1, dateCreate: -1 });

    // Chuyển đổi dữ liệu tin tức sang định dạng mà fuse.js yêu cầu
    const fuseOptions = {
      keys: ['title', 'content', 'sapo'], // Thêm các trường cần tìm kiếm
    };
    const fuse = new Fuse(newsData, fuseOptions);

    // Thực hiện tìm kiếm với fuse.js
    const searchResult = fuse.search(textSearch);
    return res.json({
      code: 200,
      error: null,
      data: searchResult,
    }) && logger.info({status:200, message: "Tìm kiếm thành công từ khóa: " + textSearch, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: error.message,
      data: null,
    }) && logger.error({status:500, message: error.message,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});


// get latestnews
router.get("/latestNews", async function (req, res, next) {
  try {
    const News = await NewsModel.find({ status: "published" })
      .limit(10)
      .sort({ dateCreate: -1 })
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách tin tức mới nhất thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.error({status:400, message: error.message,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// router.get("/newsByAuthor/:source/:createdBy", async function (req, res, next) {
//   try {
//     const source = req.params.source;
//     const createdBy = req.params.createdBy;

//     // Query the database to find articles with the specified source and createdBy
//     const articles = await NewsModel.find({
//       source: source,
//       "createdBy._id": createdBy, // Assuming createdBy is a subdocument within the NewsModel
//     }).populate("createdBy");

//     if (articles.length === 0) {
//       return res.json({
//         code: 200,
//         error: null,
//         data: [],
//       });
//     }

//     return res.json({
//       code: 200,
//       error: null,
//       data: articles,
//     });
//   } catch (error) {
//     return res.json({
//       code: 400,
//       error: error.message,
//       data: null,
//     });
//   }
// });

// news ( status = "published" )
router.get("/featuredNews", async function (req, res, next) {
  try {
    // Lấy thời điểm hiện tại
    const now = new Date();

    // Tính thời điểm 24 giờ trước đó
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(now.getHours() - 72);

    // Truy vấn để lấy các bài viết nổi bật trong vòng 24 giờ
    const featuredNews = await NewsModel.find({
      status: "published",
      isDelete: false,
      dateCreate: { $gte: twentyFourHoursAgo, $lte: now },
    })
      .limit(5)
      .sort({ view: -1, dateCreate: -1 })
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: featuredNews,
    }) && logger.info({status:200, message: "Lấy danh sách tin tức featuredNews thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.message,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});;
  }
});

// news other
router.get("/other", async function (req, res, next) {
  try {
    const number = +req.query.number;
    const threeDaysAgo = moment().subtract(7, "days").toDate();
    // console.log(threeDaysAgo);
    // const News = await NewsModel.aggregate([
    //   { $match: { status: "published", dateCreate: { $gte: threeDaysAgo } } }, // Lọc các bản ghi có trạng thái "published" và dateCreate trong vòng 3 ngày
    //   { $sample: { size: number } }, // Lấy ngẫu nhiên 10 bản ghi
    // ]);

    const News = await NewsModel.aggregate([
      { $match: { status: "published", dateCreate: { $gte: threeDaysAgo } } }, // Lọc các bản ghi có trạng thái "published" và dateCreate trong vòng 3 ngày
      { $sample: { size: 3 } }, // Lấy ngẫu nhiên 10 bản ghi
    ]);

    // Lọc các bản ghi trùng lặp
    const filterDuplicateNews = (newNews, prevNews) => {
      const prevNewsIds = prevNews.map((news) => news._id.toString());
      return newNews.filter(
        (news) => !prevNewsIds.includes(news._id.toString())
      );
    };

    const newNews = await NewsModel.aggregate([
      { $match: { status: "published", dateCreate: { $gte: threeDaysAgo } } },
      { $sample: { size: number } },
    ]);
    const filteredNews = filterDuplicateNews(newNews, News);
    const combinedNews = [...News, ...filteredNews];

    // const News = await NewsModel.find({ status: "published" })
    //   .limit(number)
    //   .sort({ view: -1 })
    //   .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: combinedNews,
    }) && logger.info({status:200, message: "Lấy danh sách tin tức news other thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: error.messege, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// News For You
router.get("/newsForYou", async function (req, res, next) {
  try {
    const userId = req.query.userId;

    if (userId) {
      const getChannelUserFollow = await FollowModel.find({ followBy: userId });

      const channels = [];

      getChannelUserFollow.forEach((v) => channels.push(`${v.channel}`));

      const news = await NewsModel.find({ status: "published" })
        .limit(8)
        .sort({ dateCreate: -1 })
        .populate("createdBy");

      const getNews = [...news];

      const getNewsUserFollow = await getNews.filter((v) =>
        channels.includes(`${v.createdBy._id}`)
      );

      return res.json({
        code: 200,
        error: null,
        data: getNewsUserFollow,
      }) && logger.info({status:200, message: "Lấy danh sách tin tức newsForYou thành công ", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:200, message: error.messege, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// news ( status = "published" )
router.get("/published", async function (req, res, next) {
  try {
    const News = await NewsModel.find({ status: "published", view: { $gt: 9 } })
      .limit(3)
      .sort({ view: -1 })
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách bài viết published thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// news ( isDelete = false ) by id user
router.get("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const News = await NewsModel.find({
      createdBy: { _id: id },
      isDelete: false,
    })
      .populate("cateNews")
      .populate("createdBy");
    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy danh sách bài viết ( isDelete = false ) by id user thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// news ( edit )
router.get("/new/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const News = await NewsModel.find({ _id: id })
      .populate("cateNews")
      .populate("createdBy");
    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy bài viết cần edit thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// news ( isDelete = true )
router.get("/trash/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const News = await NewsModel.find({
      createdBy: { _id: id },
      isDelete: true,
    })
      .populate("cateNews")
      .populate("createdBy");
    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy bài viết news ( isDelete = true ) thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});;
  }
});

// Hiển thị tin tức của một danh mục cụ thể (trạng thái = "published")
router.get("/categories/:id", async function (req, res, next) {
  try {
    // Trích xuất ID của danh mục từ tham số URL
    const categoryId = req.params.id;

    // Lấy tin tức với trạng thái "published" cho ID danh mục đã chỉ định
    const news = await NewsModel.find({
      status: "published",
      cateNews: categoryId,
    }).sort({ dateCreate: -1 })
      .populate("cateNews")
      .populate("createdBy");

    // Trả về tin tức đã lấy
    return res.json({
      code: 200,
      error: null,
      data: news,
    }) &&  logger.info({status:200, message: "Lấy bài viết theo thể loại ( status = published ) thành công theo " + categoryId, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    // Trả về thông báo lỗi chi tiết hơn
    return res.status(400).json({
      code: 400,
      error: `Lỗi khi lấy tin tức: ${error.message}`,
      data: null,
    }) && logger.warn({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });;
  }
});

router.get("/categories/new/:id", async function (req, res, next) {
  try {
    // Trích xuất ID của danh mục từ tham số URL
    const categoryId = req.params.id;

    // Lấy tin tức với trạng thái "published" cho ID danh mục đã chỉ định
    const news = await NewsModel.find({
      status: "published",
      cateNews: categoryId,
    })
      .populate("cateNews")
      .populate("createdBy").limit(5);

    // Trả về tin tức đã lấy
    return res.json({
      code: 200,
      error: null,
      data: news,
    }) && logger.info({status:200, message: "Lấy bài viết news bởi category( status = published ) thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    // Trả về thông báo lỗi chi tiết hơn
    return res.status(400).json({
      code: 400,
      error: `Lỗi khi lấy tin tức: ${error.message}`,
      data: null,
    }) && logger.warn({status:400, message: error.message,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// Hiển thị tin tức của một subCateNews cụ thể (trạng thái = "published")
router.get("/subCategories/:id", async function (req, res, next) {
  try {
    // Trích xuất ID của subCateNews từ tham số URL
    const subCateId = req.params.id;

    // Lấy tin tức với trạng thái "published" cho ID subCateNews đã chỉ định
    const news = await NewsModel.find({
      status: "published",
      subCateNews: subCateId,
    })
      .populate("cateNews")
      .populate("subCateNews")  // Thêm populate cho subCateNews
      .populate("createdBy");

    // Trả về tin tức đã lấy
    return res.json({
      code: 200,
      error: null,
      data: news,
    }) && logger.info({status:200, message: "Lấy tin tức của subCateNews thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    // Trả về thông báo lỗi chi tiết hơn
    return res.status(400).json({
      code: 400,
      error: `Lỗi khi lấy tin tức: ${error.message}`,
      data: null,
    }) && logger.warn({status:400, message: "Lấy tin tức của subCateNews thất bại " +error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

// show news of users ( status = "published" ) channel
router.get("/users/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const News = await NewsModel.find({
      status: "published",
      createdBy: { _id: id },
    })
      .limit(40)
      .populate("cateNews")
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy tin tức của users ( status = published ) channel thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.message,
      data: null,
    }) && logger.warn({status:400, message: "Lấy tin tức của users ( status = published ) channel thất bại",error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});;
  }
});


// tin tức tương tự
router.get("/similar/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const News = await NewsModel.find({
      status: "published",
      cateNews: { _id: id },
    })
      .limit(8)
      .populate("cateNews")
      .populate("createdBy");

    return res.json({
      code: 200,
      error: null,
      data: News,
    }) && logger.info({status:200, message: "Lấy tin tức của tương tự cateNews thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    }) && logger.warn({status:400, message: "Lấy tin tức tương tự cateNews thất bại" + error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

router.get("/:_idNews", async function (req, res, next) {
  try {
    const idNews = req.params._idNews;

    // Thực hiện câu truy vấn với populate cho cả cateNews và subCateNews
    const news = await NewsModel.findById(idNews)
      .populate({
        path: 'cateNews',
        populate: { path: 'subCateNews' }  // Thêm populate cho subCateNews
      })
      .populate("createdBy");

    // Kiểm tra nếu không tìm thấy tin tức
    if (!news || news.isDelete) {
      return res.json({
        code: 404,
        error: "Không tìm thấy tin tức",
        data: null,
      }) && logger.warn({status:404, message: "Không tìm thấy tin tức" + idNews, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});;
    }

    // Chuẩn bị dữ liệu trả về
    const data = {
      title: news.title,
      content: news.content,
      categoryId: news.cateNews._id,
      categoryName: news.cateNews.name,
      subCategoryId: news.cateNews.subCateNews._id,
      subCategoryName: news.cateNews.subCateNews.name,
      tags: news.tag,
      articlePicture: news.articlePicture,
    };

    return res.json({
      code: 200,
      error: null,
      data: data,
    }) && logger.info({status:200, message: "Lấy dữ liệu thành công tin tức" + idNews, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    return res.json({
      code: 400,
      error: error.message,
      data: null,
    }) && logger.error({status:400, message: error.message, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

// get news detail
router.get("/details/:_idNews", async function (req, res, next) {
  try {
    const idNews = req.params._idNews;
    const News = await NewsModel.find({
      _id: idNews,
      isDelete: false,
    }).populate("createdBy");
    console.log(News[0].originalLink);
    if (News.length === 0) {
      return res.json({
        code: 200,
        error: null,
        data: [null],
      });
    }
    const newsItem = News[0];

    // Kiểm tra xem content có giá trị rỗng hay không
    if (
      newsItem.content.trim() === "" &&
      newsItem.source.trim() === "znews.vn"
    ) {
      // Nếu rỗng, thực hiện lấy toàn bộ mã HTML từ URL
      try {
        let stopCrawl = false;
        const response = await axios.get(newsItem.originalLink);
        const html = response.data;

        // Sử dụng cheerio để load mã HTML
        const $ = cheerio.load(html);

        // Duyệt qua từng thẻ img và thực hiện thay đổi
        $('img').each((index, element) => {
          const $img = $(element);

          // Loại bỏ thuộc tính src và imgid
          $img.removeAttr('src');
          $img.removeAttr('imgid');
          $img.removeAttr('width');
          $img.removeAttr('height');

          // Thay đổi tên thuộc tính src thành data-src
          $img.attr('src', $img.attr('data-src'));

          // Loại bỏ thuộc tính data-src

        });
        // Trích xuất nội dung từ phần tử mong muốn (thay bằng phần tử thực tế bạn muốn trích xuất)
        // const extractedContent = $(".the-article-body").html();
        const extractedContent = $(".the-article-body").find('*').filter(function () {
          if (stopCrawl) {
            return false;
        }
    
        if ($(this).hasClass('inner-article') || $(this).attr('id') === 'zone-krlv706p') {
            stopCrawl = true;
        }
    
        return this.type === 'text' || $(this).is('p') || $(this).is('img');
    });
        // Lưu nội dung vào newsItem.content
        newsItem.content = extractedContent;
        await newsItem.save();

        const newsClass = await NewsModel.findOneAndUpdate(
          { _id: idNews },
          {
            $set: {
              title: News.title,
              //content: extractedContent,
              content : News.content,
              tag: News.tags,
              cateNews: News.cateNews,
              createdBy: News.createdBy,
              articlePicture: News.articlePicture,
              originalLink: News.originalLink,
              dateCreate: News.dateCreate,
              sapo: News.sapo,
              source: News.source,
              status: News.status,
            },
          }
        );
      } catch (error) {
        console.error("Error fetching HTML:", error);
        logger.error({ message: "Error fetching HTML:", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
      }
    }

    if (
      newsItem.content.trim() === "" &&
      newsItem.source.trim() === "tienphong.vn"
    ) {
      try {
        let stopCrawl = false;
        const response = await axios.get(newsItem.originalLink);
        const html = response.data;
        const $ = cheerio.load(html);

        $('img').each((index, element) => {
          const $img = $(element);

          // Loại bỏ thuộc tính src và imgid
          // $img.removeAttr('src');
          $img.removeAttr('imgid');
          $img.removeAttr('width');
          $img.removeAttr('height');

          // Thay đổi tên thuộc tính src thành data-src
          $img.attr('src', $img.attr('data-src'));

          // Loại bỏ thuộc tính data-src

        });
        // Sử dụng cheerio để load mã HTML
        const articleBody = $('.article__body.cms-body').find('*').filter(function () {
          if (stopCrawl) {
              return false;
          }
      
          if ($(this).hasClass('article__story.cms-relate') || $(this).hasClass('article__author')) {
              stopCrawl = true;
          }
      
          return this.type === 'text' || $(this).is('p') || $(this).is('img');
      });
      

        // Lưu nội dung vào newsItem.content
        newsItem.content = articleBody;
        await newsItem.save();

        const newsClass = await NewsModel.findOneAndUpdate(
          { _id: idNews },
          {
            $set: {
              title: News.title,
              //content: extractedContent,
              content : News.content,
              tag: News.tags,
              cateNews: News.cateNews,
              createdBy: News.createdBy,
              articlePicture: News.articlePicture,
              originalLink: News.originalLink,
              dateCreate: News.dateCreate,
              sapo: News.sapo,
              source: News.source,
              status: News.status,
            },
          }
        );
      } catch (error) {
        console.error("Error fetching HTML:", error);
        logger.error({ message: "Error fetching HTML:", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
        
      }
    }

    if (
      newsItem.content.trim() === "" &&
      newsItem.source.trim() === "suckhoedoisong.vn"
    ) {
      try {

        let stopCrawl = false;
        const response = await axios.get(newsItem.originalLink);
        const html = response.data;
        // Sử dụng cheerio để load mã HTML
        const $ = cheerio.load(html);
        const detailContent = $('.detail-content.afcbc-body').find('*').filter(function () {
          if (stopCrawl) {
              return false;
          }
      
          if ($(this).hasClass('detail-author') || $(this).attr('id') === 'zone-krlv706p') {
              stopCrawl = true;
          }
      
          return this.type === 'text' || $(this).is('p') || $(this).is('img');
      });
      

        // Lưu nội dung vào newsItem.content
        newsItem.content = detailContent;
        await newsItem.save();
        const newsClass = await NewsModel.findOneAndUpdate(
          { _id: idNews },
          {
            $set: {
              title: News.title,
              //content: extractedContent,
              content : News.content,
              tag: News.tags,
              cateNews: News.cateNews,
              createdBy: News.createdBy,
              articlePicture: News.articlePicture,
              originalLink: News.originalLink,
              dateCreate: News.dateCreate,
              sapo: News.sapo,
              source: News.source,
              status: News.status,
            },
          }
        );
      } catch (error) {
        console.error("Error fetching HTML:", error);
        logger.error({ message: "Error fetching HTML:", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
      }
    }

    if (
      newsItem.content.trim() === "" &&
      newsItem.source.trim() === "baotintuc.vn"
    ) {
      try {

        let stopCrawl = false;
        const response = await axios.get(newsItem.originalLink);
        const html = response.data;
        // Sử dụng cheerio để load mã HTML
        const $ = cheerio.load(html);
        const detailContent = $('.divfirst').find('*').filter(function () {
          if (stopCrawl) {
              return false;
          }
      
          if ($(this).hasClass('detail-author') || $(this).attr('id') === 'zone-krlv706p') {
              stopCrawl = true;
          }
      
          return this.type === 'text' || $(this).is('p') || $(this).is('img');
      });
      

        // Lưu nội dung vào newsItem.content
        newsItem.content = detailContent;
        await newsItem.save();
        const newsClass = await NewsModel.findOneAndUpdate(
          { _id: idNews },
          {
            $set: {
              title: News.title,
              //content: extractedContent,
              content : News.content,
              tag: News.tags,
              cateNews: News.cateNews,
              createdBy: News.createdBy,
              articlePicture: News.articlePicture,
              originalLink: News.originalLink,
              dateCreate: News.dateCreate,
              sapo: News.sapo,
              source: News.source,
              status: News.status,
            },
          }
        );
      } catch (error) {
        console.error("Error fetching HTML:", error);
        logger.error({ message: "Error fetching HTML:", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
      }
    }
    
    
    const NewsUpdate = await NewsModel.find({
      _id: idNews,
      isDelete: false,
    }).populate("createdBy");
    // Trả về dữ liệu
    return res.json({
      code: 200,
      error: null,
      data: NewsUpdate,
    }) && logger.info({status:200, message: "Cập nhật nội dung content tin tức thành công" + idNews, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
  } catch (error) {
    return res.json({
      code: 400,
      error: error.message,
      data: null,
    }) && logger.warn({status:400, message: error.message , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});;
  }
});
// add news
router.put("/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const body = req.body;
      const files = req.files;

      // Kiểm tra và thực hiện tóm tắt nếu sapo không được truyền
      if (!body.sapo && body.content) {
        // Tóm tắt nội dung với ChatGPT
        const { summarizedContent, message } = await tomtatWithChatGPT(body.content);
  
        body.sapo = summarizedContent;
  
        // Gán giá trị message vào trường sapo_message nếu cần
        body.sapo_message = message;
      }
      // Tiếp tục với phần còn lại của mã nguồn

      if (files && files.file) {
        files.file.mv(`${__dirname}/../../client/public/uploads/news/${files.file.name}`);

        const news = {
          title: body.title,
          content: body.content,
          sapo: body.sapo,
          cateNews: body.cateNews,
          subCateNews: body.subCateNews || null,  // Bổ sung cập nhật subCateNews
          tag: JSON.parse(body.tags),
          articlePicture: files.file.name,
          originalLink: body.originalLink,
          dateCreate: body.dateCreate,
          status: body.status,
        };

        await NewsModel.findOneAndUpdate({ _id: _id }, news);

        return res.json({
          code: 200,
          message: "Sửa bài viết thành công",
        })&& logger.info({status:200, message : "Sửa bài viết thành công"+ _id , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
      } else {
        const news = {
          title: body.title,
          content: body.content,
          sapo: body.sapo,
          cateNews: body.cateNews,
          subCateNews: body.subCateNews || null,  // Bổ sung cập nhật subCateNews
          tag: JSON.parse(body.tags),
          originalLink: body.originalLink,
          dateCreate: body.dateCreate,
          status: body.status,
        };

        await NewsModel.findOneAndUpdate({ _id: _id }, news);

        return res.json({
          code: 200,
          message: "Sửa bài viết thành công",
        })  && logger.info({status:200, message : "Sửa bài viết thành công"+ _id , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
      }
    }
  } catch (error) {
    console.error(error);
    return res.json({
      code: 400,
      message: "Sửa bài viết thất bại",
      error: error,
      data: null,
    })&&  logger.error({status:400, message : "Sửa bài viết thất bại"+ _id,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// Hàm thực hiện tóm tắt với ChatGPT



async function tomtatWithChatGPT(content) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "Tóm tắt văn bản sau không quá 30 từ " + content }],
      model: "gpt-3.5-turbo",
    });

    const summarizedContent = completion.choices[0].message.content;
    return { summarizedContent, message: completion.choices[0].message };
  } catch (error) {
    console.error(error); 
    logger.error({status:error.response.status, message : error,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack})
    throw new Error("Lỗi khi tóm tắt nội dung");
  }
}



// add news crawler
router.post("/crawled_news", async function (req, res, next) {
  try {
    const body = req.body;
    const result = await NewsModel.findOne({ title: body.title }).exec();
    if (result != null) {
      const newsClass = await NewsModel.findOneAndUpdate(
        { _id: result._id },
        {
          $set: {
            content: body.content,
            tag: body.tags,
            cateNews: body.cateNews,
            createdBy: body.createdBy,
            articlePicture: body.articlePicture,
            originalLink: body.originalLink,
            // dateCreate: body.dateCreate,
            sapo: body.sapo,
            source: body.source,
            status: body.status,
          },
        }
      );
      return res.json({
        code: 200,
        message: "Update thành công bài báo " + body.title,
        data: newsClass,
      }) && logger.info({status:200, message : "Update thành công bài báo " + req.body.title , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
    }

    const News = new NewsModel({
      title: body.title,
      content: body.content,
      tag: body.tags,
      cateNews: body.cateNews,
      createdBy: body.createdBy,
      articlePicture: body.articlePicture,
      originalLink: body.originalLink,
      dateCreate: body.dateCreate,
      sapo: body.sapo,
      source: body.source,
      status: body.status,
    });

    const NewsClass = await News.save();

    return res.json({
      code: 200,
      message: "Gửi yêu cầu thành công",
      data: NewsClass,
    }) && logger.info({status:200, message : "Gửi yêu cầu thành công " + body.title, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error,
      message: "Thêm thất bại",
    }) && logger.warn({status:400, message : "Thêm thất bại " + body.title ,error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

// add news ( upload anh )
router.post("/upload", function (req, res, next) {
  try {
    const file = req.files.upload;

    file.mv(`${__dirname}/../../client/public/uploads/news/${file.name}`);
  } catch (error) {
    return res.json({
      code: 400,
      error: error,
      message: "Upload thất bại",
    })&& logger.warn({status:400, message :"Upload ảnh thất bại", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// add news
router.post("/", async function (req, res, next) {
try {
  const body = req.body;
  const file = req.files.file;

  if (file) {
    file.mv(`${__dirname}/../../client/public/uploads/news/${file.name}`);
  }
  const News = new NewsModel({
    title: body.title,
    content: body.content,
    sapo: body.sapo,
    content: body.content,
    cateNews: body.cateNews,
    tag: JSON.parse(body.tags),
    createdBy: body.createdBy,
    articlePicture: file.name,
    originalLink: body.originalLink,
    dateCreate: body.dateCreate,
    status: body.status
  });

  const NewsClass = await News.save();

  return res.json({
    code: 200,
    message: "Gửi yêu cầu thành công",
    data: NewsClass
  }) && logger.info({status:200, message :"Gửi yêu cầu thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });

} catch (error) {
  return res.json({
    code: 400,
    error: error,
    message: "Thêm thất bại"
  })&& logger.warn({status:400, message :"Gửi yêu cầu thất bại",error: error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
}
});


// increase views
router.put("/views/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const views = req.body.views;
      const increaseViews = await NewsModel.findOneAndUpdate(
        { _id: _id },
        { view: views }
      );

      const news = await NewsModel.find({
        _id: _id,
        isDelete: false,
      }).populate("createdBy");

      if (increaseViews) {
        res.json({
          code: 200,
          data: news,
        }) && logger.info({status:200, message :"Tăng view thành công cho bài" + _id, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      error: error,
      data: null,
    }) && logger.error({status:400, message :error ,error,  url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// Give up draft
router.put("/giveUpDraft/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const giveUpDraft = await NewsModel.findOneAndUpdate(
        { _id: _id },
        { status: "new" }
      );
      const news = await NewsModel.find({});

      if (giveUpDraft) {
        res.json({
          code: 200,
          message: "Bỏ nháp thành công",
          data: news,
        }) && logger.info({status:200, message :"Bỏ nháp thành công"+ _id , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: "Bỏ nháp thất bại",
      error: error,
      data: null,
    })&& logger.warn({status:400, message :"Bỏ nháp thất bại", error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers , stack: error.stack});
  }
});

// save draft
router.put("/saveDraft/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const giveUpDraft = await NewsModel.findOneAndUpdate(
        { _id: _id },
        { status: "draft" }
      );
      const news = await NewsModel.find({});

      if (giveUpDraft) {
        res.json({
          code: 200,
          message: "Lưu nháp thành công",
          data: news,
        }) && logger.info({status:200, message :"Lưu nháp thành công"+ _id, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: "Lưu nháp thất bại",
      error: error,
      data: null,
    }) && logger.warn({status:400, message :"Lưu nháp thất bại", error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });;
  }
});

// move a new to trash
router.put("/trash/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const moveToTrash = await NewsModel.findOneAndUpdate(
        { _id: _id },
        { $set: { isDelete: true, status: "unpublished" } },
      );
      const news = await NewsModel.find({}).populate("createdBy");

      if (moveToTrash) {
        res.json({
          code: 200,
          message: "Đã thêm vào giỏ rác",
          data: news,
        }) && logger.info({status:200, message :"Đã thêm vào giỏ rác" + _id, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: "Thêm vào giỏ rác thất bại",
      error: error,
      data: null,
    })&& logger.warn({status:400, message :"Thêm vào giỏ rác thất bại" + _id, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

// restore from trash
router.put("/restore/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const restoreFromTrash = await NewsModel.findOneAndUpdate(
        { _id: _id },
        { isDelete: false }
      );
      const news = await NewsModel.find({ isDelete: true }).populate(
        "createdBy"
      );

      if (restoreFromTrash) {
        res.json({
          code: 200,
          message: "Restore thành công",
          data: news,
        })&& logger.info({status:200, message :"Restore thành công" + _id, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: "Restore thất bại",
      error: error,
      data: null,
    })&& logger.warn({status:400, message :"Restore thất bại" + _id, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });;
  }
});

router.delete("/:_id", async function (req, res, next) {
  try {
    const _id = req.params._id;
    const newExist = await NewsModel.findOne({ _id: _id });

    if (newExist) {
      const newDelete = await NewsModel.findOneAndDelete({ _id: _id });
      const news = await NewsModel.find({ isDelete: true }).populate(
        "createdBy"
      );

      if (newDelete) {
        res.json({
          code: 200,
          message: "Xóa thành công",
          data: news,
        }) && logger.info({status:200, message :"Xóa thành công" + _id , url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers});
      }
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: "Xóa thất bại",
      error: error,
      data: null,
    }) &&  logger.warn({status:400, message :"Xóa thất bại",  error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack });
  }
});

router.get("/favorite", auth, async function (req, res, next) {
  try {
    const postLike = await LikeModel.find({
      createdBy: req.user._id,
      isDelete: false,
    });
    const postFav = await NewsModel.find({ _id: postLike.News });
    return res.json({
      code: 200,
      error: null,
      data: postFav,
    }) && logger.info({status:200, message :"Thêm vào yêu thích thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });;
  } catch (error) {
    return res.json({
      code: 400,
      error: error,
      data: null,
    }) && logger.error({status:400, error,url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers, stack: error.stack});
  }
});

router.get("/bestNews", auth, async function (req, res, next) {
  try {
    const Newss = await NewsModel.find({ isDelete: false }).sort({
      avangeRating: "desc",
    });
    return res.json({
      code: 200,
      error: null,
      data: Newss,
    })&& logger.info({status:200, message :"Lấy danh sách tin tức bestNews thành công", url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers });
  } catch (error) {
    return res.json({
      code: 400,
      error: error,
      data: null,
    }) && logger.error({status:400, error, url: req.originalUrl, method: req.method, sessionID: req.sessionID, headers: req.headers,stack: error.stack});
  }
});

// news ( isDelete = false )
router.get("/", async function (req, res, next) {
  try {
    const News = await NewsModel.find({ isDelete: false })
      .populate("cateNews")
      .populate("createdBy");
      News.reverse();
    return res.json({
      code: 200,
      error: null,
      data: News,
    });
  } catch (error) {
    return res.json({
      code: 400,
      error: error.messege,
      data: null,
    });
  }
});

module.exports = router;
