import * as AWSXRay from "aws-xray-sdk"
import * as uuid from 'uuid'
import {reseedData} from '../../testUtils/dynamodb'
import { createCollection, getCollectionDetails } from "../collections"
import {CreateCollectionRequest} from '../../requests'
const seededCollections = require('../../../db-seeds/collections.json')
const seededTranslations = require('../../../db-seeds/translations.json')
AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const requestId = uuid.v4()
  

describe('Business Logic getCollectionDetails', ()=>{
    it('Should fetch the correct collection details', async()=>{
        await reseedData()
        const collectionId = "929e483b-9fe7-46b1-acca-516a7ab2551f"
        const expectedBaseCollection = seededCollections.find(c => c.id === collectionId)
        const expectedTranslation = seededTranslations.find(t => t.id === collectionId)
        const receivedCollection = await getCollectionDetails(collectionId, expectedBaseCollection, requestId)
        expect(receivedCollection.id).toBe(collectionId)
        expect(receivedCollection.name).toBe(expectedTranslation.collectionName)
        expect(receivedCollection.tags.length).toBe(expectedBaseCollection.tags.length)
        expect(receivedCollection.manager.id).toBe(expectedBaseCollection.managerId)
        expect(receivedCollection.editors.length).toBe(expectedBaseCollection.editors.length)
    })
})
describe('Business Logic createCollection', ()=>{
    it('Should create the collection with correct vlues', async()=>{
        await reseedData()
        const request: CreateCollectionRequest = {
            name: 'Collection 654',
            defaultLocale:'en',
            editors:['2'],
            tags:[
                {
                    slug:'super_tag',
                    name: 'Super Tag'
                }
            ],
        }
        const createdCollection = await createCollection(request, '1', requestId)
        const receivedCollection = await getCollectionDetails(createdCollection.id, 'en', requestId)
        expect(receivedCollection).toStrictEqual(createdCollection)
    })
})