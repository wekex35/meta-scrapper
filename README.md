# Meta(og:) Scrapper

## Tech Tech Stack 
- Nodejs
- AWS lamda
- Dynamodb for caching
- Serverless Framework for deployment

-----------------------
## Api and Response
- Request : {api}/scrapper 
    ```
    e.g http://0.0.0.0:3000/dev/scrapper (POST)
    {
        "url":"web-url" 
    } 
- Response 
    ```
    {
        "result": {
            "title": "Iphone"
            "description": "Iphone Descripiton",
            "images": [
                "https://image.jpg"
            ],    
        },
        "message": "successfull",
        "status": 200
    }
## Debugging and Deploy
- For Offline
    use following Command
    ```
    > npm install
    > serverless offline

- For Deployment (AWS)
    use following Command
    ```
    > serverless config credentials --provider aws --key "aws key" --secret "aws secret"
    > serverless deploy

## Configuration
- current Configuration 
    ```
    const toRead = ['title', 'description','twitter:image','og:title', 'og:description', 'og:image',] 
- To read more meta information just add meta-property or meta-name in above line available in /scrapper/scrapper.utils.js at line no. 5

## Extensibility
- Can be extend to use request based configuration of readable meta content by passing meta-name or meta-property in request
for e.g :
    ```
    {
        "url":"web-url",
        "metaTagToRead": "meta-property1,meta-property2,meta-property3"
    }

    At Backend
        let body = JSON.parse(event.body)
        let propertyNames = body.metaTagToRead.split(",")
        
    This property can to merged with existing 'toRea' or merge with 'toRead' to read more meta Tag and Property

## Unit Testing
```
    Unit Testing can be perform by using Jest npm library 
    with the help of below script.
    const $ = cheerio.load(webContent); //webcontent => any website raw webpage data

    var meta = $('meta')
    var keys = Object.keys(meta)
    
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        readMetaData(response,meta,key); // function inside scrapper utils classs
    }
    
    OR 
    by create a unitTest function in scrapper.utils.js

