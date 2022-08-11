import { middyfy } from "@libs/lambda";
import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { Story } from '../../../models'
import { getStoryDetails} from '../../../businessLogic/stories'
import { getCollectionTranslation } from "../../../businessLogic/collections";
import { getArabicArticleSynonyms } from "../../../businessLogic/indexing";
import algoliasearch from "algoliasearch"


const indexNamePrefix = process.env.ALGOLIA_INDEX_NAME_PREFIX
const algoliaClien = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
  )
const syncSearchIndex: DynamoDBStreamHandler = async(event: DynamoDBStreamEvent)=>{
    let localeTagsMap: Map<string, string[]> = new Map()
    for(const record of event.Records){
        console.log(record)
        if(record.eventName === 'REMOVE'){
            //REMOVE story content in the index
            const objectID = record.dynamodb.Keys.id?.S
            const locale = record.dynamodb.Keys.locale?.S
            const indexName = `${indexNamePrefix}${locale}`
            const index = algoliaClien.initIndex(indexName)
            await index.deleteObject(objectID)
        }else{
            if(record.dynamodb.NewImage?.translatedType?.S === 'STORY'){
                try{
                    //INSERT or MODIFY story content in the index
                    const storyId = record.dynamodb.Keys.id.S
                    const locale = record.dynamodb.Keys.locale.S
                    const story = await getStoryDetails(storyId, locale, record.eventID)
                    const objectToIndex = await buildStoryIndexObject(story, locale)
                    const indexName = `${indexNamePrefix}${locale}`
                    console.log(indexName)
                    console.log(objectToIndex)
                    const index = algoliaClien.initIndex(indexName)
                    await index.saveObject(objectToIndex)
                    await processLanguageSpecificSetttings(objectToIndex, locale)
                }catch(error){
                    console.log(error)
                    console.log(error.errorMessage)
                }
            }
            if(record.dynamodb.NewImage?.translatedType?.S === 'TAG' && record.eventName === 'INSERT'){
                //ADD new tag as searchable field in the index
                if(record.eventName === 'INSERT'){
                    const idParts = record.dynamodb.Keys.id.S.split('#')
                    const slug = idParts[1]
                    console.log('Slug to add: ' + slug)
                    const locale = record.dynamodb.Keys.locale.S
                    let tags = localeTagsMap.get(locale)
                    if(!tags) {
                        tags = []
                    }
                    tags.push(`unordered(${slug})`)
                    localeTagsMap.set(locale, tags)
                }
            }
        }
        
        
    }
    if(localeTagsMap.size > 0){
        console.log('Add tags as searchable attributes')
        for(const locale of localeTagsMap.keys()){
            const indexName = `${indexNamePrefix}${locale}`
            const index = algoliaClien.initIndex(indexName)
            const indexSettings = await index.getSettings()
            const searchableAttributes = indexSettings.searchableAttributes
            let newSearchableAttributes = []
            if (searchableAttributes) newSearchableAttributes.push(...searchableAttributes)
            const tagsToAdd = localeTagsMap.get(locale)
            newSearchableAttributes.push(...tagsToAdd)
            console.log('set searchableAttributes')
            console.log(searchableAttributes)
            await index.setSettings({
                searchableAttributes: newSearchableAttributes
            })
        }
    }
}

export const main = middyfy(syncSearchIndex)

const buildStoryIndexObject = async (story: Story, locale: string)=>{
    let o = {
        objectID: story.id,
        collectionId: story.collectionId,
        storyTitle: story.storyTitle,
        storyType: story.storyType
    }
    if(story.storyAbstraction) o['storyAbstraction'] = story.storyAbstraction
    if(story.storyTranscript) o['storyTranscript'] = story.storyTranscript
    if(story.storyTellerName) o['storyTellerName'] = story.storyTellerName
    if(story.storyTellerPlaceOfOrigin) o['storyTellerPlaceOfOrigin'] = story.storyTellerPlaceOfOrigin
    if(story.storyTellerResidency) o['storyTellerResidency'] = story.storyTellerResidency
    if(story.storyCollectorName) o['storyCollectorName'] = story.storyCollectorName
    if(story.mediaFiles) o['mediaFiles'] = story.mediaFiles
    if(story.storyTellerAge) o['storyTellerAge'] = story.storyTellerAge
    if(story.storyTellerGender) o['storyTellerGender'] = story.storyTellerGender
    for(const tag of story.tags){
        o[tag.slug] = tag.value
    }
    const collectionTranslation = await getCollectionTranslation(story.collectionId, locale)
    o['collectionName'] = collectionTranslation.collectionName
    return o
}
const processLanguageSpecificSetttings = async(object: {[key:string]: any}, locale: string)=>{
    
    
    let synonyms = []
    if(locale === 'ar'){
        const titleSynonyms = getArabicArticleSynonyms(object.storyTitle)
        synonyms.push(...titleSynonyms)
        const abstractionSynonyms = getArabicArticleSynonyms(object.storyAbstraction)
        synonyms.push(...abstractionSynonyms)
        const transcriptSynonyms = getArabicArticleSynonyms(object.storyTranscript)
        synonyms.push(...transcriptSynonyms)
    }
    console.log(synonyms)
    if(synonyms.length){
        const indexName = `${indexNamePrefix}${locale}`
        console.log(indexName)
        const index = algoliaClien.initIndex(indexName)
        await index.saveSynonyms(synonyms)
    }
}
