import { StaticPage } from '../models'
import { CreateStaticPage } from '../requests'
import {createDynamodbClient} from './dynamodb-infrastructure'
import {createLogger} from '../libs/logger'
import OurstoryErrorConstructor from '../ourstoryErrors'


export class StaticPagesAcess{
    constructor (
        private readonly documentClient = createDynamodbClient(),
        private readonly pagesTable = process.env.STATIC_PAGES_TABLE,
    ){}


    async getPage(slug: string, locale: string, requestId: string):Promise<StaticPage>{
        const logger = createLogger(requestId, 'StaticPagesAcess', 'getPageDetails')
        logger.info(`Get page details: slug: ${slug}, locale: ${locale}`)
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.pagesTable,
            Key:{
                slug: slug,
                locale: locale
            }
        }
        const response = await this.documentClient.get(params).promise()
        const page = response.Item 
        if(!page){
            logger.info('Page not found')
            throw OurstoryErrorConstructor._404('Page not found')
        }
        logger.info('Page found and returned')
        return page as StaticPage
        
    }
    async getPagesOfLocale(locale: string, requestId):Promise<StaticPage[]>{
        const logger = createLogger(requestId, 'StaticPagesAcess', 'getPagesOfLocale')
        logger.info(`Get pages for locale: ${locale}`)
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: this.pagesTable,
            KeyConditionExpression: 'locale = :locale',
            ExpressionAttributeValues:{
                ':locale': locale
            }
        }
        const response = await this.documentClient.query(params).promise()

        if(response.Items){
            logger.info(`Found ${response.Items.length} pages`)
            return response.Items as StaticPage[]
        }else{
            logger.info('Not pages found')
            return []
        }
        
    }
    async getAvailableTranslations(slug: string, requestId):Promise<string[]>{
        const logger = createLogger(requestId, 'StaticPagesAcess', 'getAvailableTranslations')
        logger.info(`Get pages for slug: ${slug}`)
        
        const params: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: this.pagesTable,
            FilterExpression: 'slug = :slug',
            ExpressionAttributeValues:{
                ':slug': slug
            },
            ProjectionExpression:"locale"
        }
        const response = await this.documentClient.scan(params).promise()
        const pages = response.Items
        if(pages){
            logger.info(`Found ${pages.length} pages`)
            const locales: string[] = pages.map(p=> p.locale)
            return locales
        }else{
            logger.info('Not pages found')
            return []
        }
        
    }
    async createPage(page: CreateStaticPage, requestId: string){
        const logger = createLogger(requestId, 'StaticPagesAcess', 'createPage')
        logger.info('Create page', page)
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.pagesTable,
            Item: page
        }
        await this.documentClient.put(params).promise()
        logger.info('Page created successfully')
    }
    async updatePage(page: CreateStaticPage, requestId: string){
        const logger = createLogger(requestId, 'StaticPagesAcess', 'updatePage')
        logger.info('Update page', page)
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.pagesTable,
            Key:{
                locale: page.locale,
                slug: page.slug
            },
            UpdateExpression: 'SET content = :content, layouts = :layouts, description = :description, #name = :name',
            ExpressionAttributeNames:{
                '#name': 'name'
            },
            ExpressionAttributeValues:{
                ':content': page.content,
                ':layouts': page.layouts,
                ':description': page.description,
                ':name': page.name
            }
        }
        await this.documentClient.update(params).promise()
        logger.info('Page updated successfully')
    }
    async updatePageLayouts(slug: string, locale: string, layouts: string[], requestId: string){
        const logger = createLogger(requestId, 'StaticPagesAcess', 'updatePageLayouts')
        logger.info('Update page', {slug, locale, layouts})
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: this.pagesTable,
            Key:{
                locale: locale,
                slug: slug
            },
            UpdateExpression: 'SET layouts = :layouts',
            ExpressionAttributeValues:{
                ':layouts': layouts
            }
        }
        await this.documentClient.update(params).promise()
        logger.info('Page updated successfully')
    }
    async delete(slug: string, locale: string, requestId: string){
        const logger = createLogger(requestId, 'StaticPagesAcess', 'delete')
        logger.info('Delete page', {slug, locale})
        const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: this.pagesTable,
            Key:{
                locale,
                slug
            }
        }
        await this.documentClient.delete(params).promise()
        logger.info('Page deleted successfully')
    }
}