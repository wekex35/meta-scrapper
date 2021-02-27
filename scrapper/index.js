const axios = require("axios");
const cheerio = require("cheerio");
const { AddItem, RetriveItem } = require('./scrapperDB')
const TableName = "ScrapperTable"
const toRead = ['title', 'description','twitter:image','og:title', 'og:description', 'og:image', ]//
  
module.exports.scrapper = async (event, req, callback) => {
  var body = JSON.parse(event.body)
  var url = body.url;
  try {
    if (!url) throw { message: "Please Enter Valid Url" };
    var response = await RetriveItem({ url }, TableName) //To cheack  if content is available in table or not
    let isToScrap = false;
    if(response == undefined){
      isToScrap = true;
    }else if(response.length < 100+url.length){
      isToScrap = true;
    }

    if (isToScrap) {
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
      response = {}
      response["images"] = []
      const webPageContent = webPageResponse.data;
      
      const $ = cheerio.load(webPageContent);
      var meta = $('meta')
      var keys = Object.keys(meta)
      
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        readMetaData(response,meta,key);
      }

      var toTable = response;
      toTable['url'] = url;
      await AddItem(TableName, toTable)
    }else{
      console.log("loading from db");
    }
    delete response.url


    // console.log(response);
    sendResponse(callback, 200, "successfull", response)
  } catch (error) {
    console.log(error);
    sendResponse(callback, 400, error.message || error.Error || error, null)
  }
};

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


function sendResponse(callback, status, message, data) {
  const res = {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      result: data,
      message: message,
      status: status
    })
  };
  callback(null, res)
}