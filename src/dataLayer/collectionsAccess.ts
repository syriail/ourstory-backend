import { Collection, TranslableType, Tag } from '../models'
import {createDynamodbClient} from './dynamodb-infrastructure'
import {createLogger} from '../libs/logger'
import OurstoryErrorConstructor from '../ourstoryErrors'
import { UpdateCollectionRequest, TranslateCollectionRequest } from '../requests'



export class CollectionAccess{
    constructor (
        private readonly documentClient = createDynamodbClient(),
        private readonly collectionTable = process.env.COLLECTIONS_TABLE,
        private readonly translationsTable = process.env.TRANSLATIONS_TABLE,
        private readonly translationByTypeIndex = process.env.TRANSLATION_BY_TYPE_INDEX
    ){}
    async getCollection(collectionId: string):Promise<{[key:string]:any}>{
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.collectionTable,
            Key:{
                id: collectionId
            }
        }
        const response = await this.documentClient.get(params).promise()
        return response.Item
    }
    async getCollections(userId:string):Promise<{[key:string]:any}[]>{
        const query: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: this.collectionTable,
            FilterExpression: 'contains(editors, :userId) OR managerId = :userId',
            ExpressionAttributeValues:{
                ':userId': userId
            }
        }
        const response = await this.documentClient.scan(query).promise()
        return response.Items
    }

    async getCollectionTranslation(collectionId: string, locale: string):Promise<{[key:string]: any}>{
        try{
            const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
                TableName: this.translationsTable,
                Key:{
                    id: collectionId,
                    locale: locale
                }
            }
        const response = await this.documentClient.get(params).promise()
        return response.Item
        }catch(error){
            throw error
        }
        
        
    }

    async createCollection(collection: Collection, requestId: string){
        const logger = createLogger(requestId, 'Data Access', 'createCollection')
        const slugs = collection.tags? collection.tags.map(tag=> tag.slug) : []
        const editorsIds = collection.editors.map(editor => editor.id)
        let transactItems: AWS.DynamoDB.DocumentClient.TransactWriteItemList = []
        let itemToAdd = {
            id: collection.id,
            managerId: collection.manager.id,
            createdAt: collection.createdAt,
            defaultLocale: collection.defaultLocale,
            storiesCount: 0,
            availableTranslations: collection.availableTranslations,
            tags: slugs,
            editors: editorsIds
        }
        const putCollection: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Put:{
                TableName: this.collectionTable,
                Item: itemToAdd
            }
        }
        transactItems.push(putCollection)

        for(const tag of collection.tags){
            const putTagTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
                Put:{
                    TableName: this.translationsTable,
                    Item:{
                        id: `${collection.id}#${tag.slug}`,
                        translatedType: TranslableType.TAG,
                        tagName: tag.name,
                        locale: collection.defaultLocale
                    }
                }
            }
            transactItems.push(putTagTranslation)
        }
        let translationItem: AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap = {
            id: collection.id,
            translatedType: TranslableType.COLLECTION,
            locale: collection.defaultLocale,
            collectionName: collection.name
        }
        if(collection.description){
            translationItem['collectionDescription'] = collection.description
        }
        const putCollectionTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Put:{
                TableName: this.translationsTable,
                Item:translationItem
            }
        }
        transactItems.push(putCollectionTranslation)

        let transation: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
            TransactItems: transactItems
        }
        try{
            logger.info('Create collection transaction begins')
            await this.documentClient.transactWrite(transation).promise()
            logger.info('Create collection transation successfully finished')
        }catch(error){
            logger.error(error)
            throw error
        }
        
    }

    async getCollectionCurrentTagsTranslation(collectionId: string, slugs: string[], locale:string):Promise<Tag[]>{
        if(!slugs.length) return []
        try{
            let requests = {}
            const keys = slugs.map((slug)=>{return {id: `${collectionId}#${slug}`, locale}})
            requests[this.translationsTable] = {
                    Keys: keys
                }
        const batchGet: AWS.DynamoDB.DocumentClient.BatchGetItemInput = {
            RequestItems: requests
        }
        const response = await this.documentClient.batchGet(batchGet).promise()
        const items = response.Responses[this.translationsTable]
        return parseTags(items)
        }catch(error){
            throw error
        }
    }

    async getCollectionTagsTranslation(collectionId: string, locale: string):Promise<Tag[]>{
        try{
            const params: AWS.DynamoDB.DocumentClient.QueryInput = {
                TableName: this.translationsTable,
                IndexName: this.translationByTypeIndex,
                KeyConditionExpression:'translatedType = :tag AND begins_with(id, :collectionId)',
                FilterExpression: 'locale = :locale',
                ExpressionAttributeValues:{
                    ':tag': TranslableType.TAG,
                    ':collectionId': collectionId,
                    ':locale': locale
                }
            }
            const response = await this.documentClient.query(params).promise()
            return parseTags(response.Items)
        }catch(error){
            throw error
        }
        

    }
    async getAllTagsTranslations(locale: string): Promise<Tag[]>{
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: this.translationsTable,
            IndexName: this.translationByTypeIndex,
            KeyConditionExpression:'translatedType = :tag',
            FilterExpression: 'locale = :locale',
            ExpressionAttributeValues:{
                ':tag': TranslableType.TAG,
                ':locale': locale
            }
        }
        const response = await this.documentClient.query(params).promise()
        return parseTags(response.Items)
    }
    async getTagTranslation(collectionId: string, slug: string, locale: string):Promise<Tag>{
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.translationsTable,
            Key:{
                id: `${collectionId}#${slug}`,
                locale
            }

        }
        const response = await this.documentClient.get(params).promise()
        return parseTag(response.Item)
    }

    async updateCollection(collection: UpdateCollectionRequest, userId: string, requestId: string){
        const logger = createLogger(requestId, 'CollectionAccess', 'updateCollection')
        logger.info('Start update collection transaction')
        let transactItems: AWS.DynamoDB.DocumentClient.TransactWriteItemList = []
        const slugs = collection.tags? collection.tags.map(tag=> tag.slug) : []
        const editorsIds = collection.editors ? collection.editors : []

        //Update base collection
        // collection must exists and the user must be the manager
        const updateCollection: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Update:{
                TableName: this.collectionTable,
                Key:{
                    id: collection.id
                },
                UpdateExpression: 'SET tags = :slugs, editors = :editors',
                ConditionExpression: "attribute_exists(id) AND managerId = :managerId",
                ExpressionAttributeValues: {
                    ':slugs': slugs,
                    ':editors': editorsIds,
                    ':managerId': userId
                }
            }
        }
        transactItems.push(updateCollection)

        //Update collection default locale translation

        let updateTranslationExp = 'SET collectionName = :name'
        let updateTranslationValues = {
            ':name': collection.name
        }

        if(collection.description){
            updateTranslationExp = updateTranslationExp + ', collectionDescription = :description'
            updateTranslationValues[':description'] = collection.description
        }else{
            updateTranslationExp = updateTranslationExp + ' REMOVE collectionDescription'
        }

        const updateTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Update:{
                TableName: this.translationsTable,
                Key:{
                    id: collection.id,
                    locale: collection.defaultLocale
                },
                UpdateExpression: updateTranslationExp,
                ExpressionAttributeValues: updateTranslationValues
            }
        }
        transactItems.push(updateTranslation)

        if(collection.tags){
            for(const tag of collection.tags){
                //Using Update won't work when the tag value does not exist
                //Using Add will add the item if not exists or replace it otherwise
                const putTagTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
                    Put:{
                        TableName: this.translationsTable,
                        Item:{
                            id: `${collection.id}#${tag.slug}`,
                            translatedType: TranslableType.TAG,
                            tagName: tag.name,
                            locale: collection.defaultLocale
                        }
                    }
                }
                transactItems.push(putTagTranslation)
            }
        }
        let transation: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
            TransactItems: transactItems
        }
        try{
            logger.info('Update collection transaction begins')
            await this.documentClient.transactWrite(transation).promise()
            logger.info('Update collection transation successfully finished')
        }catch(error){
            //The only reason the transaction could be cancelled for is that the collection does not exist or the user is not the manager
            if(error.code === 'TransactionCanceledException'){
                logger.error('Either collection does not exist or user is not its manager')
                throw OurstoryErrorConstructor._403('Either collection does not exist or user is not its manager')
            }
            logger.error(error)
            throw error
        }
    }

    async saveTranslation (request: TranslateCollectionRequest, requestId: string){
        const logger = createLogger(requestId, 'CollectionAccess', 'saveTranslation')
        logger.info('Start save collection transaction')
        let transactItems: AWS.DynamoDB.DocumentClient.TransactWriteItemList = []

        //Update base collection

        const updateCollection: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Update:{
                TableName: this.collectionTable,
                Key:{
                    id: request.id
                },
                UpdateExpression: 'SET availableTranslations = list_append(availableTranslations, :locale)',
                ExpressionAttributeValues: {
                    ':locale': [request.locale]
                }
            }
        }
        transactItems.push(updateCollection)

        //Update collection locale translation

        let updateTranslationExp = 'SET collectionName = :name'
        let updateTranslationValues = {
            ':name': request.name
        }

        if(request.description){
            updateTranslationExp = updateTranslationExp + ', collectionDescription = :description'
            updateTranslationValues[':description'] = request.description
        }else{
            updateTranslationExp = updateTranslationExp + ' REMOVE collectionDescription'
        }

        const updateTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
            Update:{
                TableName: this.translationsTable,
                Key:{
                    id: request.id,
                    locale: request.locale
                },
                UpdateExpression: updateTranslationExp,
                ExpressionAttributeValues: updateTranslationValues
            }
        }
        transactItems.push(updateTranslation)

        for(const tag of request.tags){
            //Using Update won't work when the tag value does not exist
            //Using Add will add the item if not exists or replace it otherwise
            const putTagTranslation: AWS.DynamoDB.DocumentClient.TransactWriteItem = {
                Put:{
                    TableName: this.translationsTable,
                    Item:{
                        id: `${request.id}#${tag.slug}`,
                        translatedType: TranslableType.TAG,
                        tagName: tag.name,
                        locale: request.locale
                    }
                }
            }
            transactItems.push(putTagTranslation)
        }
        let transation: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
            TransactItems: transactItems
        }
        try{
            logger.info('Save collection transaction begins')
            await this.documentClient.transactWrite(transation).promise()
            logger.info('Save collection transation successfully finished')
        }catch(error){
            logger.error(error)
            throw error
        }
    }
}



const parseTags = (items: AWS.DynamoDB.DocumentClient.ItemList):Tag[]=>{
    let tags: Tag[] = []
    for(const item of items){
        const tag = parseTag(item)
        tags.push(tag)
    }
    return tags
}

const parseTag = (item: AWS.DynamoDB.DocumentClient.AttributeMap): Tag =>{
    if(!item) return null
    const id = item.id
        const parts = id.split('#')
        const slug = parts[1]
    return {
        slug,
        name: item.tagName
    }
}


