const axios = require("axios");
const cheerio = require("cheerio");
const { AddItem, RetriveItem } = require('./scrapperDB')
const TableName = "ScrapperTable"
const toRead = ['title', 'description','twitter:image','og:title', 'og:description', 'og:image',]//Configure to Add property or name for scrapping from Meta tag


const Scrap = async (url) => {
    if (!url) throw { message: "Please Enter Valid Url" };
    var response = await RetriveItem({ url }, TableName) //To cheack  if content is available in table or not
    let isToScrap = false;
    if(response == undefined){
      isToScrap = true;
    }else if(response.length < 100+url.length){
      isToScrap = true;
    }
    if (isToScrap) {
      response = await ScrapDataFromUrl(url);
      toTable = response;
      toTable['url'] = url;
      await AddItem(TableName, toTable)
    }else{
      console.log("loading from db");
    }
    delete response.url
    return response;
}

const  ScrapDataFromUrl = async (url) => {

  var webPageResponse = await axios.get(url,
    {
      headers: {
        "method": "GET",
        "scheme": "https",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36",
      }
    }
  );
  var response = {}
  response["images"] = []
  const webPageContent = webPageResponse.data;
  
  const $ = cheerio.load(webPageContent);
  var meta = $('meta')
  var keys = Object.keys(meta)
  
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    readMetaData(response,meta,key);
  }
  return response;
}

function readMetaData(response,meta,key) {
    if (JSON.stringify(meta[key].attribs) != undefined) {
      const metaAttribs = JSON.parse(JSON.stringify(meta[key].attribs))
      if (metaAttribs.name != undefined || metaAttribs.property != undefined) {
        
        var toExtract = metaAttribs.name;
        if (toExtract == undefined) {
          toExtract = metaAttribs.property;
        }
  
        if (toRead.includes((metaAttribs.property || metaAttribs.name).toLowerCase())) {
          let responseKey = (metaAttribs.property || metaAttribs.name).split(":");
    
          if (responseKey[1] != undefined) {
            responseKey = responseKey[1];
          }
  
          let objectKey = responseKey.toString().toLowerCase()
          if (objectKey != "image") {
            response[objectKey] = metaAttribs.content;
          } else {
            if (metaAttribs.content.startsWith("http"))
              response['images'].push(metaAttribs.content);
          }
  
        }
      }
  
    }
  }
  
  module.exports = {
    Scrap,
    ScrapDataFromUrl
}