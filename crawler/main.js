import dotenv from "dotenv";
import { crawlerModelClasses } from "./crawl_model.js";
import Crawler from "crawler";
import Service from "./service.js";
import Utils from "./utils.js";
import moment from "moment";
import { CronJob } from "cron";

dotenv.config();
const service = new Service(process.env.SERVICE_URL);
let allCategories = await service.getAllCategories();
const adminCrawler = process.env.ADMIN_ID;

async function putCrawledArticle(article) {
  try {
    let articleMapped = {
      title: article.title,
      content: "",
      tag: [],
      status: "published",
      cateNews: getCategory(article.category),
      createdBy: {
        _id: adminCrawler,
      },
      articlePicture: article.thumbnail,
      originalLink: article.link,
      sapo: article.sapo,
      source: article.source,
    };
    if (article.dateCreate) {
      articleMapped.dateCreate = moment(Date.parse(article.dateCreate)).format(
        "YYYY-MM-DD HH:mm:ss Z"
      );
    }
    if ((article.content = "")) {
    }
    const isValidArticle = !Object.values(articleMapped)
      .map((value) => value === undefined)
      .includes(true);
    if (isValidArticle) {
      const newArticle = await service.putNews(articleMapped);
      if (newArticle?.data?.message) {
        const logResult = {
          msg: newArticle.data.message,
          link: articleMapped.originalLink,
          category: articleMapped.cateNews,
        };
        console.log(logResult);
      }
    }
  } catch (err) {
    console.log("Error put: " + err.stack);
  }
}

function getCategory(categoryRaw) {
  // Lặp qua mảng allCategories
  for (let cate of allCategories) {
    try {
      // So sánh tên danh mục sau khi được chuyển đổi thành dạng slug
      if (Utils.stringToSlug(categoryRaw) == Utils.stringToSlug(cate.name)) {
        // Nếu tìm thấy, trả về đối tượng danh mục
        return cate;
      }
    } catch (err) {
      // Bỏ qua lỗi nếu có và tiếp tục với các phần tử tiếp theo
    }
  }
  // Nếu không tìm thấy, trả về undefined
  return undefined;
}

class ArticalCrawler {
  constructor() {
    this.result = [];
    let self = this;
    this.crawler = new Crawler({
      maxConnections: 10,
      // Hàm gọi lại này sẽ được gọi cho mỗi trang đã crawl
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          for (let modelClass of crawlerModelClasses) {
            // Tạo một thể hiện của lớp mô hình hiện tại với phản hồi trang đã crawl
            let model = new modelClass(res);
            if (model.canParse()) {
              // Phân tích mô hình và thêm kết quả vào mảng kết quả
              Array.prototype.push.apply(self.result, model.parse(model));
              for (let article of self.result) {
                putCrawledArticle(article);
              }
            }
          }
        }
        done();
      },
    });
  }

  crawl() {
    // Queue just one URL, with default callback
    this.crawler.queue("https://znews.vn");
    this.crawler.queue("https://suckhoedoisong.vn");
    this.crawler.queue("https://baotintuc.vn");
    this.crawler.queue("https://tienphong.vn");
    //this.crawler.queue("https://vnexpress.net");
  }
}

function jobRunFunc() {
  service.getAllCategories().then(async (categories) => {
    try {
      console.log("Start: " + new Date());
      allCategories = categories;
      let crawler = new ArticalCrawler();
      crawler.crawl();
    } catch (error) {
      console.log(err);
    }
  });
}
jobRunFunc();
        var job = new CronJob(
          "*/1 * * * *", // Chuỗi thời gian được sử dụng để định kỳ khi công việc sẽ được thực hiện.
          function () {
            jobRunFunc();// Hàm thực hiện thu thập data
          },
          null, // hàm callback được gọi khi công việc hoàn thành
          true  // công việc bắt đầu ngay lập tức sau khi tạo không.
        );
        job.start(); // bắt đầu thực hiện công việc theo định kỳ.
