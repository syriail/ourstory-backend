import * as AWS from 'aws-sdk'
const seededEmployees = require('../../db-seeds/employees.json')
const seededCollections = require('../../db-seeds/collections.json')
const seededStories = require('../../db-seeds/stories.json')
const seededTranslations = require('../../db-seeds/translations.json')
const seededTagValues = require('../../db-seeds/tag-values.json')

const region = 'localhost'
  const endpoint = 'http://localhost:8000'
const itemToKey = (
  item: AWS.DynamoDB.DocumentClient.AttributeMap,
  keySchema: AWS.DynamoDB.KeySchemaElement[],
) => {
  let itemKey: AWS.DynamoDB.DocumentClient.Key = {};
  keySchema.map(key => {
    itemKey = { ...itemKey, [key.AttributeName]: item[key.AttributeName] };
  });
  return itemKey;
};

export const clearAllItems = async (tableName: string) => {
  // get the table keys
  const table = new AWS.DynamoDB({ region, endpoint });
  const { Table = {} } = await table
    .describeTable({ TableName: tableName })
    .promise();

  const keySchema = Table.KeySchema || [];

  // get the items to delete
  const db = new AWS.DynamoDB.DocumentClient({ region, endpoint });
  const scanResult = await db
    .scan({
      AttributesToGet: keySchema.map(key => key.AttributeName),
      TableName: tableName,
    })
    .promise();
  const items = scanResult.Items || [];
  if (items.length > 0) {
    const deleteRequests = items.map(item => ({
      DeleteRequest: { Key: itemToKey(item, keySchema) },
    }));

    await db
      .batchWrite({ RequestItems: { [tableName]: deleteRequests } })
      .promise();
  }
};

export const writeItems = async (
  tableName: string,
  items: AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap[],
) => {
  const db = new AWS.DynamoDB.DocumentClient({ region, endpoint });
  const writeRequests = items.map(item => ({
    PutRequest: { Item: item },
  }));

  await db
    .batchWrite({ RequestItems: { [tableName]: writeRequests } })
    .promise();
};

export const reseedData = async()=>{
  await clearAllItems('employees-dev')
  await clearAllItems('collections-dev')
  await clearAllItems('stories-dev')
  await clearAllItems('translations-dev')
  await clearAllItems('tag-values-dev')
  await writeItems('employees-dev', seededEmployees)
  await writeItems('collections-dev', seededCollections)
  await writeItems('stories-dev', seededStories)
  await writeItems('translations-dev', seededTranslations)
  await writeItems('tag-values-dev', seededTagValues)
}
