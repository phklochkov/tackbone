class DynamoWrapper {
  constructor(AWS) {
    if (!AWS) {
      throw new Error('AWS is required.')
    }

    this.dynamoDb = new AWS.DynamoDB()
    this.dynamoDoc = new AWS.DynamoDB.DocumentClient()

    this.maxWriteSize = 25 // TODO: Think, const would be best.
    this.length = 0 // TODO: Think, local might be better.
    this.tableName = '' // TODO: See above.
    this.items = [] // TODO: See above.
  }

  _chop(index) {
    return this.items.slice(this.maxWriteSize * index, this.maxWriteSize * (index + 1))
  }

  // Looks very clunky, refactor.
  _bulkWrite(index, resolve, reject) {
    if (index + 1 === this.length) {
      console.log('Success!')
      resolve()
    }

    const chunk = this._chop(index)
    this.dynamoDoc.batchWrite({
        RequestItems: {
          [this.tableName]: chunk
            .map((item) => ({ PutRequest: { Item: item } }))
        }
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        this._bulkWrite(index + 1, resolve, reject)
      })
  }

  createTable(schema) {
    return new Promise((resolve, reject) => {
      this.dynamoDb.createTable(schema, (err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  }

  listTables() {
    return new Promise((resolve, reject) => {
      this.dynamoDb.listTables((err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve(data)
      })
    })
  }

  putItem(tableName, item) {
    return new Promise((resolve, reject) => {
      this.dynamoDoc.put({ TableName: tableName, Item: item }, (err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve(data)
      })
    })
  }

  putItems(tableName, items) {
    this.length = Math.ceil(items.length / this.maxWriteSize)
    this.tableName = tableName
    this.items = items

    return new Promise((resolve, reject) => {
      this._bulkWrite(0, resolve, reject) // Not very good, at all.
    })
  }
}

module.exports = DynamoWrapper
