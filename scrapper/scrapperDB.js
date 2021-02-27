const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const UpdateItem = async (keys, TableName, data) => {
    var key = {}
    var updateExpression = "set";
    var expressionAttributeValues = {};
    for (var k in data) {
        if (keys.includes(k)) {
            key[`${k}`] = data[`${k}`]
            continue;
        }
        updateExpression += ` ${k} = :${k},`;
        expressionAttributeValues[`:${k}`] = data[`${k}`]
    }
    updateExpression = updateExpression.slice(0, updateExpression.length - 1) //to remove last comma
    const params = {
        TableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    };
    const res = await documentClient.update(params).promise();
    return res;
}

const RetriveItem = async (keys, TableName) => {
    for (var k in keys) {
       if(k == null || k == undefined)
        throw {message : `${k} Cannot be null`}
    }
    var params = {
        TableName,
        Key: keys
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
}




const AddItem = async (TableName,data) => {
    const params = {
        TableName,
        Item: data,
        ReturnValues: 'ALL_OLD'
    };
    try {
        const res = await documentClient.put(params).promise();
        return res;
    } catch (error) {
        console.log(error);
        throw {message : error}        
    }
}

const DeleteItem = async (keys, TableName) => {
    for (var k in keys) {
       if(k == null || k == undefined)
        throw {message : `${k} Cannot be null`}
    }
    var params = {
        TableName,
        Key: keys
    };
    const res = await documentClient.get(params).promise();
    return res.Item;
}

module.exports = {
    UpdateItem,
    RetriveItem,
    AddItem,
    DeleteItem}