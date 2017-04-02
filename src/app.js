const fs = require('fs')
const AWS = require('aws-sdk')
const DynamoWrapper = require('./db/dynamoWrapper')

AWS.config.update({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
 })

const db = new DynamoWrapper(AWS)
const mockData = JSON.parse(fs.readFileSync('./mock/MOCK_DATA.json', 'utf8'))

const tableName = 'Employees'
const params = {
  TableName: tableName,
  KeySchema: [{ AttributeName: "id", KeyType: "HASH"}],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10
  }
}

// db.createTable(params).then((result) => {
  db.putItems(tableName, mockData)
    .catch((error) => console.error(error))
// }).catch((err) => console.error('Error #', err))
// db.dynamoDb.scan({ TableName: tableName }, (err, data) => console.log('Scan result #', data))


