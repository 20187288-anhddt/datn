import dotenv from 'dotenv'
import { crawlerModelClasses } from "./crawl_model.js";
import Crawler from "crawler";
import Service from "./service.js";
import Utils from "./utils.js";
import moment from "moment"
import {CronJob} from "cron"

dotenv.config()
const service = new Service(process.env.SERVICE_URL)
let allCategories = await service.getAllCategories()
const adminCrawler = process.env.ADMIN_ID

async function putCrawledArticle(article){
    try{
        let articleMapped = {
            title: article.title,
            content: "",
            tag: [],
            status: "published",
            cateNews: getCategory(article.category),
            createdBy: {
                _id: adminCrawler
            },
            articlePicture: article.thumbnail,
            originalLink: article.link,
            sapo: article.sapo,
            source: article.source,
        }
        if(article.dateCreate){
            articleMapped.dateCreate = moment(Date.parse(article.dateCreate)).format('YYYY-MM-DD HH:mm:ss Z')
        }
        const isValidArticle = !Object.values(articleMapped).map(value => value === undefined).includes(true)
        if(isValidArticle){
            const newArticle = await service.putNews(articleMapped)
            if(newArticle?.data?.message){
                const logResult = {
                    msg: newArticle.data.message,
                    link: articleMapped.originalLink,
                    category: articleMapped.cateNews
                }
                console.log(logResult)
            }
        }  
    }catch(err){
        console.log("Error put: " + err.stack)
    }
}

function getCategory(categoryRaw) {
    for(let cate of allCategories){
        try{
            if(Utils.stringToSlug(categoryRaw) == Utils.stringToSlug(cate.name)){
                return cate
            }
        }catch(err){
        }
    }
    return undefined
}

class ArticalCrawler{
    constructor(){
        this.result = []
        let self = this
        this.crawler = new Crawler({
            maxConnections : 10,
            // This will be called for each crawled page
            callback : function (error, res, done) {
                if(error){
                    console.log(error)
                }else{
                    for(let modelClass of crawlerModelClasses){
                        let model = new modelClass(res)
                        if(model.canParse()){
                            Array.prototype.push.apply(self.result, model.parse(model))
                            for(let artical of self.result){
                                putCrawledArticle(artical)
                            }
                        }
                    }
                }
                done();
            }
        });
    }

    crawl(){
        // Queue just one URL, with default callback
        this.crawler.queue('https://znews.vn/');
        this.crawler.queue('https://suckhoedoisong.vn/');
        this.crawler.queue("https://baotintuc.vn/")
        this.crawler.queue("https://tienphong.vn/")
    }
}

function jobRunFunc(){
    service.getAllCategories().then(async (categories)=>{
        try{
            console.log('Start: ' + new Date());
            allCategories = categories
            let crawler = new ArticalCrawler()
            crawler.crawl()
        }catch(error){
            console.log(err)
        }  
    })
}

jobRunFunc()

var job = new CronJob('*/1 * * * *', function() {
    jobRunFunc()
  }, null, true);
  job.start();
