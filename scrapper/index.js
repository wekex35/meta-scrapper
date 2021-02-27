
const {Scrap} = require('./scrapper.utils')
  
module.exports.scrapper = async (event, req, callback) => {
  var body = JSON.parse(event.body)
  var url = body.url;
  try {   
    var response = await Scrap(url);
    sendResponse(callback, 200, "successfull", response)
  } catch (error) {
    console.log(error);
    sendResponse(callback, 400, error.message || error.Error || error, null)
  }
};



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