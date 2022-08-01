import { CollectionAccess } from "../dataLayer/collectionsAccess";
import { Collection, Employee, Tag } from "../models";
import EmployeesAccess from "../dataLayer/employeesAccess";
import * as uuid from 'uuid'
import { CreateCollectionRequest, TranslateCollectionRequest, UpdateCollectionRequest } from "../requests";
import {createLogger} from '../libs/logger'
const collectionAccess = new CollectionAccess()
const employeesAccess = new EmployeesAccess()



export const getCollectionsByEmployee = async(userId: string, locale: string, requestId: string): Promise<Collection[]>=>{
    const logger = createLogger(requestId, 'Business Logic', 'getCollectionsByEmployee')
    logger.info('Get collections by employee: ' + userId)
    const collections: Collection[] = []
    try{
        logger.info('Get base collections')
        const baseCollections = await collectionAccess.getCollections(userId)
        for(const baseCollection of baseCollections){
            logger.info('Get collection details: ' + baseCollection.id)
            //If the required locale is not available as translation, the default locale will be fetched
            let targetLocale = locale
            if(!baseCollection.availableTranslations.includes(locale)) targetLocale = baseCollection.defaultLocale
            logger.info(`Get collection translation locale: ${targetLocale}`)
            const translation = await collectionAccess.getCollectionTranslation(baseCollection.id, targetLocale)
            logger.info('Get editorys')
            const editors = await employeesAccess.getEmployeesByIds(baseCollection.editors)
            logger.info('Get manager')
            const manager = await employeesAccess.getEmployee(baseCollection.managerId, requestId)
            let collection: Collection = {
                id: baseCollection.id,
                defaultLocale: baseCollection.defaultLocale,
                name: translation.collectionName,
                createdAt: baseCollection.createdAt,
                manager,
                availableTranslations: baseCollection.availableTranslations,
                editors
    
            }
            if(translation.collectionDescription) collection.description = translation.collectionDescription
            collections.push(collection)
    
        }
        return collections
    }catch(error){
        throw error
    }
    
}

export const getCollectionDetails = async(collectionId: string, locale: string, requestId: string):Promise<Collection>=>{
    const logger = createLogger(requestId, 'Business Logic', 'getCollectionDetails')
    logger.info('Get collection details: ' + collectionId)
    const baseCollection = await collectionAccess.getCollection(collectionId)
    let targetLocale = locale
    if(!baseCollection.availableTranslations.includes(locale)) targetLocale = baseCollection.defaultLocale
    logger.info(`Get collection translation locale: ${targetLocale}`)
    const translation = await collectionAccess.getCollectionTranslation(baseCollection.id, targetLocale)
    logger.info('Get editorys')
    const editors = await employeesAccess.getEmployeesByIds(baseCollection.editors)
    logger.info('Get manager')
    const manager = await employeesAccess.getEmployee(baseCollection.managerId, requestId)
    logger.info('Get tags')
    const tags = await collectionAccess.getCollectionCurrentTagsTranslation(collectionId, baseCollection.tags, targetLocale)
    let collection: Collection = {
        id: baseCollection.id,
        defaultLocale: baseCollection.defaultLocale,
        name: translation.collectionName,
        createdAt: baseCollection.createdAt,
        manager,
        availableTranslations: baseCollection.availableTranslations,
        editors,
        tags

    }
    if(translation.collectionDescription) collection.description = translation.collectionDescription
    return collection

}

export const createCollection = async(request: CreateCollectionRequest, userId: string, requestId: string):Promise<Collection> =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'createCollection')
    const id = uuid.v4()
    const createdAt = new Date().toISOString()
    //Stupid to get employees since we only need ids. but leave it now
    //No it's not stupid, since we'll need the full employee objects anyway to return the full collection!
    const editors: Employee[] = await employeesAccess.getEmployeesByIds(request.editors)
    const manager: Employee = await employeesAccess.getEmployee(userId, requestId)
    let collection: Collection = {
        id,
        createdAt,
        manager,
        defaultLocale: request.defaultLocale,
        availableTranslations: [],
        tags: request.tags ? request.tags : [],
        name: request.name,
        editors
    }
    logger.info('Create Collection: ', {message: collection})
    if(request.description) collection.description = request.description
    await collectionAccess.createCollection(collection, requestId)
    logger.info('Return the created collection')
    return collection
}

export const updateCollection = async(request: UpdateCollectionRequest, requestId: string)=>{
    await collectionAccess.updateCollection(request, requestId)
}

export const saveCollectionTranslation = async(request: TranslateCollectionRequest, requestId: string)=>{
    await collectionAccess.saveTranslation(request, requestId)
}

export const getCollectionTranslation = async(collectionId: string, locale: string)=>{
    const collectionTranslation = await collectionAccess.getCollectionTranslation(collectionId, locale)
    return collectionTranslation
}

export const getAllTags = async(locale: string): Promise<Tag[]> =>{
    const tags = await collectionAccess.getAllTagsTranslations(locale)
    return tags
}
