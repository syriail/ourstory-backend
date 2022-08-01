import * as AWSXRay from "aws-xray-sdk"
import * as uuid from 'uuid'
import {reseedData} from '../../testUtils/dynamodb'
import {getStoriesByCollection, getStoryDetails, createStory, updateStory} from '../stories'
import {Story, StoryType} from '../../models'
import CreateStoryRequest from '../../requests'
const seededStories = require('../../../db-seeds/stories.json')
const seededTranslations = require('../../../db-seeds/translations.json')
const seededTagValues = require('../../../db-seeds/tag-values.json')
AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const requestId = uuid.v4()

  

describe('Business Logic getStoriesByCollection', ()=>{
    it('Should return the correct stories of a collection', async()=>{
        await reseedData()
        const collectionId = '929e483b-9fe7-46b1-acca-516a7ab2551f'
        const locale = 'en'
        const seededStories = buildSeededStories(locale)
        const expectedStories = seededStories.filter(s => s.collectionId === collectionId)
        const receivedStories = await getStoriesByCollection(collectionId, locale, requestId)
        console.log(expectedStories)
        console.log(receivedStories)
        expect(receivedStories.length).toBe(expectedStories.length)
    })
    it('Should return empty list', async()=>{
        const collectionId = '274112'
        const locale = 'en'
        const expectedStories = []
        const receivedStories = await getStoriesByCollection(collectionId, locale, requestId)
        expect(receivedStories).toStrictEqual(expectedStories)
    })
})

describe('Business Logic getStoryDetails', ()=>{
    it('Should return the correct seeded story details', async()=>{
        const storyId = '2ef83f35-e369-4fdc-8a3a-8d4cb3fcc18f'
        const locale = 'en'
        const expectedStory = buildSeededStoryDetails(storyId, locale)
        const receivedStory = await getStoryDetails(storyId, locale, requestId)
        expect(receivedStory).toStrictEqual(expectedStory)
    })
})

describe('Business Logic createStory', ()=>{
    it('Should create a story with only required fields and return correct values', async()=>{
        await reseedData()
        const locale = 'en'
        const request: CreateStoryRequest = {
            collectionId: '70a17da6-5610-4cee-8c68-52d0d1bceba6',
            defaultLocale: locale,
            storyType: [StoryType.FABLE],
            storyTitle: 'New Collection title'
        }
        const expectedStory = await createStory(request, requestId)
        
        const receivedStory = await getStoryDetails(expectedStory.id, locale, requestId)
        expect(receivedStory).toStrictEqual(expectedStory)
    })
})

describe('Business Logic update story', ()=>{
    it('Should update storyType, title, tellerAge and transcript correctly', async()=>{
        await reseedData()
        const storyId = '2ef83f35-e369-4fdc-8a3a-8d4cb3fcc18f'
        const locale = 'en'
        let story = buildSeededStoryDetails(storyId, locale)
        
        story.storyType = [StoryType.FABLE]
        story.storyTitle = 'brand new title'
        story.storyTellerAge = 100
        story.storyTranscript = 'Brand new transcript'

        const updateRequest: CreateStoryRequest = story

        await updateStory(storyId, updateRequest, requestId)

        const receivedStory = await getStoryDetails(storyId, locale, requestId)

        expect(receivedStory).toStrictEqual(story)

    })
})

//Build list of the seeded stories with only base stories and the translation
// of default locale. It does not add any tags information
const buildSeededStories = (locale: string):Story[]=>{
    let stories: Story[] = []
    for(const baseStory of seededStories){
        const targetLocale = baseStory.availableTranslations.includes(locale) ? locale : baseStory.defaultLocale
        const translation = seededTranslations.find(t => t.id === baseStory.id && t.locale === targetLocale)
        let story: Story = {
            id: baseStory.id,
            collectionId: baseStory.collectionId,
            defaultLocale: baseStory.defaultLocale,
            availableTranslations: baseStory.availableTranslations,
            storyTitle: translation.storyTitle,
            storyType: baseStory.storyType
        }
        if(baseStory.storyTellerAge) story.storyTellerAge = baseStory.storyTellerAge
        if(baseStory.storyTellerGender) story.storyTellerGender = baseStory.storyTellerGender
        if(baseStory.mediaFiles) story.mediaFiles = baseStory.mediaFiles
        if(translation.storyAbstraction) story.storyAbstraction = translation.storyAbstraction
        if(translation.storyTranscript) story.storyTranscript = translation.storyTranscript
        if(translation.storyTellerName) story.storyTellerName = translation.storyTellerName
        if(translation.storyTellerPlaceOfOrigin) story.storyTellerPlaceOfOrigin = translation.storyTellerPlaceOfOrigin
        if(translation.storyTellerResidency) story.storyTellerResidency = translation.storyTellerResidency
        if(translation.storyCollectorName) story.storyCollectorName = translation.storyCollectorName
        stories.push(story)
    }
    return stories
    
}
//Build the full details of a seeded story
const buildSeededStoryDetails = (storyId: string, locale: string):Story=>{
    let baseStory = seededStories.find(ss => ss.id === storyId)
    const targetLocale = baseStory.availableTranslations.includes(locale) ? locale : baseStory.defaultLocale
    const translation = seededTranslations.find(t => t.id === baseStory.id && t.locale === targetLocale)
    let story: Story = {
        id: baseStory.id,
        collectionId: baseStory.collectionId,
        defaultLocale: baseStory.defaultLocale,
        availableTranslations: baseStory.availableTranslations,
        storyTitle: translation.storyTitle,
        storyType: baseStory.storyType
    }
    if(baseStory.storyTellerAge) story.storyTellerAge = baseStory.storyTellerAge
    if(baseStory.storyTellerGender) story.storyTellerGender = baseStory.storyTellerGender
    if(baseStory.mediaFiles) story.mediaFiles = baseStory.mediaFiles
    if(translation.storyAbstraction) story.storyAbstraction = translation.storyAbstraction
    if(translation.storyTranscript) story.storyTranscript = translation.storyTranscript
    if(translation.storyTellerName) story.storyTellerName = translation.storyTellerName
    if(translation.storyTellerPlaceOfOrigin) story.storyTellerPlaceOfOrigin = translation.storyTellerPlaceOfOrigin
    if(translation.storyTellerResidency) story.storyTellerResidency = translation.storyTellerResidency
    if(translation.storyCollectorName) story.storyCollectorName = translation.storyCollectorName

    const filteredTags = seededTagValues.filter(s => s.storyId === storyId && s.locale === targetLocale)
    const tags = filteredTags.map((s)=>{
        
        const tagIdParts = s.tagId.split('#')
            return {
                storyId,
                collectionId: tagIdParts[0],
                slug: tagIdParts[1],
                locale,
                name: s.name,
                value: s.value
            }
    })
    story.tags = tags
    return story
    
}



