import * as AWSXRay from "aws-xray-sdk"
import * as uuid from 'uuid'
import {reseedData,} from '../../testUtils/dynamodb'
import {Collection} from '../../models'
import {CollectionAccess} from '../collectionsAccess'
import { UpdateCollectionRequest } from "src/requests"
import OurstoryErrorConstructor from '../../ourstoryErrors'
const seededCollections = require('../../../db-seeds/collections.json')
const seededTranslations = require('../../../db-seeds/translations.json')
const seededEmployees = require('../../../db-seeds/employees.json')
AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const collectionsAccess  = new CollectionAccess()

const requestId = uuid.v4()

describe('Data Access getCollections by employee', ()=>{
    it('Should return the base collections where the employee 2 is either manager or editor in them', async ()=>{
        await reseedData()
        const employeeId = "2"
        const expectedCollections = seededCollections.filter(collection => collection.managerId === employeeId || collection.editors.includes(employeeId))
        console.log(expectedCollections)
        const baseCollections = await collectionsAccess.getCollections(employeeId)
        expect(baseCollections).toStrictEqual(expectedCollections)
    })
    it('Should return empty list', async ()=>{
        const expectedValue = []
        const baseCollections = await collectionsAccess.getCollections("852")
        expect(baseCollections).toStrictEqual(expectedValue)
    })
})

describe('Data Access getCollection', ()=>{
    it('Should fetch the correct collection 2', async()=>{
        await reseedData()
        const collectionId = '2'
        const expectedCollection = seededCollections.find(c => c.id === collectionId)
        const receivedCollection = await collectionsAccess.getCollection(collectionId)
        expect(receivedCollection).toStrictEqual(expectedCollection)
    })
})

describe('Data Access getCollectionTranslation', ()=>{
    it('Should return the translation of the given collection', async()=>{
        await reseedData()
        const id = '1'
        const locale = 'ar'
        const expectedTranslation = seededTranslations.find(t => t.locale === locale && t.id === id)
        const received = await collectionsAccess.getCollectionTranslation(id, locale)
        expect(received).toStrictEqual(expectedTranslation)
    })
    it('Should return undefined since the English translation is not available for collection 1', async()=>{

        const received = await collectionsAccess.getCollectionTranslation('1', 'en')
        expect(received).toBeUndefined()
    })
})
describe('Data Access createCollection', ()=>{
    const aManager = seededEmployees.find(e=>e.roles.includes('COLLECTION_MANAGER'))
    const editors = seededEmployees.filter(e => e.roles.includes('EDITOR'))
    it('Should create a collection without throwing exception', async()=>{
        await reseedData()
        const createdAt = '2022-06-24T11:16:21.499Z'
        
        const newCollection: Collection = {
            id: '963',
            name: 'Collection 963',
            defaultLocale:'en',
            createdAt,
            availableTranslations:[],
            manager: aManager,
            editors: editors,
            tags:[
                {
                    slug:'super_tag',
                    name: 'Super Tag'
                }
            ],
        }
        
        expect(async()=>await collectionsAccess.createCollection(newCollection, requestId)).not.toThrow()
    })
    it('Should create a collection with the right values', async()=>{
        const collectionId = '654'
        const createdAt = '2022-06-24T11:16:21.499Z'
        const newCollection: Collection = {
            id: collectionId,
            name: 'Collection 654',
            defaultLocale:'en',
            createdAt,
            availableTranslations:[],
            manager: aManager,
            editors: editors,
            tags:[
                {
                    slug:'super_tag',
                    name: 'Super Tag'
                }
            ],
        }
        await collectionsAccess.createCollection(newCollection, requestId)
        const expectedTranslation = {
            "id":collectionId,
            "locale":"en",
            "translatedType":"COLLECTION",
            "collectionName":"Collection 654"
    
        }
        const expectedCollection = {
            availableTranslations:[],
            createdAt,
            defaultLocale:'en',
            editors: editors.map(e=> e.id),
            id: '654',
            managerId: aManager.id,
            tags:['super_tag'],
            
            
        }
        const expectedTagsTranslation = [
            {
                slug:'super_tag',
                name: 'Super Tag'
            }
        ]
        const receivedTranslation = await collectionsAccess.getCollectionTranslation(collectionId, 'en')
        const receivedTagsTranslation = await collectionsAccess.getCollectionTagsTranslation(collectionId, 'en')
        const receivedCollection = await collectionsAccess.getCollection(collectionId)
        expect(receivedCollection).toStrictEqual(expectedCollection)
        expect(receivedTranslation).toStrictEqual(expectedTranslation)
        expect(receivedTagsTranslation).toStrictEqual(expectedTagsTranslation)
    })
})

describe('Data Access updateCollection', ()=>{
    it('Should throw error with code 403, collection id does not exists', async()=>{
        await reseedData()
        const updateRequest: UpdateCollectionRequest = {
            id: '123',
            defaultLocale: 'en',
            name:'some name',
            editors:['1']
        }
        await expect(collectionsAccess.updateCollection(updateRequest, '234', requestId)).rejects.toThrowError(OurstoryErrorConstructor._403('Either collection does not exist or user is not its manager'))
        
    })
    it('Should throw error with code 403, user is not the manager', async()=>{
        await reseedData()
        const id = seededCollections[0].id
        const updateRequest: UpdateCollectionRequest = {
            id: id,
            defaultLocale: 'en',
            name:'some name',
            editors:['1']
        }
        await expect(collectionsAccess.updateCollection(updateRequest, '234', requestId)).rejects.toThrowError(OurstoryErrorConstructor._403('Either collection does not exist or user is not its manager'))
        
    })
})