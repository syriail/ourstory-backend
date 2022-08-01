import * as AWSXRay from "aws-xray-sdk"
import {reseedData} from '../../testUtils/dynamodb'
import {StoryAccess} from '../storiesAccess'
import {Gender, Story, StoryType, TagValue, TranslableType} from '../../models'
import * as uuid from 'uuid'
const seededStories = require('../../../db-seeds/stories.json')
const seededTranslations = require('../../../db-seeds/translations.json')

AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const storiesAccess  = new StoryAccess()
const requestId = uuid.v4()
  

describe('Data Access getStoriesByCollectionId', ()=>{
    it('Should fetch correct two base stories of the given collection', async()=>{
        await reseedData()
        const collectionId = '929e483b-9fe7-46b1-acca-516a7ab2551f'
        const expectedStories = seededStories.filter(s => s.collectionId === collectionId)
        const receivedStories = await storiesAccess.getStoriesByCollectionId(collectionId, requestId)
        expect(receivedStories.length).toBe(expectedStories.length)
    })
    it('Should return []', async()=>{
        const collectionId = '852'
        const expectedStories = []
        const receivedStories = await storiesAccess.getStoriesByCollectionId(collectionId,requestId)
        expect(receivedStories).toStrictEqual(expectedStories)
    })
})
describe('Data Access getStroyTranslation', ()=>{
    it('Should return the correct story Translation', async()=>{
        await reseedData()
        const storyId = '2ef83f35-e369-4fdc-8a3a-8d4cb3fcc18f'
        const locale = 'en'
        const expectedTranslation = seededTranslations.find(t => t.id === storyId && t.locale === locale)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, locale, requestId)
        expect(receivedTranslation).toStrictEqual(expectedTranslation)
    })
    it('Should return undefined', async()=>{
        const storyId = '21963'
        const locale = 'en'
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, locale, requestId)
        expect(receivedTranslation).toBeUndefined()
    })
})

describe('Data Access createStory', ()=>{
    
    it('Should create a story with all optional fields, translation and tags successfully', async()=>{
        await reseedData()
        const storyId = '789456'
        const collectionId = '1'
        const locale = 'ar'
        const story: Story = {
            id: storyId,
            collectionId:collectionId,
            storyTitle:'Story title in arabic',
            defaultLocale: locale,
            storyType: [StoryType.FABLE],
            storyAbstraction: 'Story abstraction in arabic',
            storyTranscript: 'Story transcript in Arabic',
            availableTranslations:[],
            storyTellerAge: 23,
            storyTellerGender: Gender.FEMALE,
            storyTellerName: 'Teller name in arabic',
            storyTellerPlaceOfOrigin: 'Place of oringin in arabic',
            storyTellerResidency: 'Place of residency in arabic',
            tags:[
                {
                    storyId: storyId,
                    collectionId,
                    locale,
                    name:'Topic in Arabic',
                    slug:'topic',
                    value:'Story value of topic in arabic'
                },
                {
                    storyId: storyId,
                    collectionId,
                    locale,
                    name:'Area in Arabic',
                    slug:'area',
                    value:'Story value of area in araic'
                }
            ]
        }
        await storiesAccess.createStory(story, requestId)
        const receivedBaseStroy = await storiesAccess.getStoryById(storyId, requestId)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, locale, requestId)
        const receivedTagValues = await storiesAccess.getStoryTagValues(storyId, locale, requestId)

        const expectedBaseStory = {
            id: storyId,
            collectionId:collectionId,
            defaultLocale: locale,
            storyType: [StoryType.FABLE],
            availableTranslations:[],
            storyTellerAge: 23,
            storyTellerGender: Gender.FEMALE
        }
        const expectedTranslation = {
            id: storyId,
            translatedType: TranslableType.STORY,
            locale,
            storyTitle:'Story title in arabic',
            storyAbstraction: 'Story abstraction in arabic',
            storyTranscript: 'Story transcript in Arabic',
            storyTellerName: 'Teller name in arabic',
            storyTellerPlaceOfOrigin: 'Place of oringin in arabic',
            storyTellerResidency: 'Place of residency in arabic',
        }
        const expectedTagValues = [
            {
                storyId: storyId,
                collectionId,
                locale,
                name:'Area in Arabic',
                slug:'area',
                value:'Story value of area in araic'
            },
            {
                storyId: storyId,
                collectionId,
                locale,
                name:'Topic in Arabic',
                slug:'topic',
                value:'Story value of topic in arabic'
            }
        ]
        expect(receivedBaseStroy).toStrictEqual(expectedBaseStory)
        expect(receivedTranslation).toStrictEqual(expectedTranslation)
        expect(receivedTagValues).toStrictEqual(expectedTagValues)
    })
    it('Should create a story with only mandatory fields, translation and no tags successfully', async()=>{
        const storyId = '789457'
        const collectionId = '1'
        const locale = 'ar'
        const type = [StoryType.FABLE]
        const story: Story = {
            id: storyId,
            collectionId:collectionId,
            storyTitle:'Story title in arabic',
            defaultLocale: locale,
            storyType: type,
            availableTranslations:[],
            tags:[]
        }
        await storiesAccess.createStory(story, requestId)
        const receivedBaseStroy = await storiesAccess.getStoryById(storyId, requestId)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, locale, requestId)

        const expectedBaseStory = {
            id: storyId,
            collectionId:collectionId,
            defaultLocale: locale,
            storyType:type,
            availableTranslations:[]
        }
        const expectedTranslation = {
            id: storyId,
            translatedType: TranslableType.STORY,
            locale,
            storyTitle:'Story title in arabic'
        }

        expect(receivedBaseStroy).toStrictEqual(expectedBaseStory)
        expect(receivedTranslation).toStrictEqual(expectedTranslation)
    })
})

describe('Data Access updateStory', ()=>{
    const storyId = '2ef83f35-e369-4fdc-8a3a-8d4cb3fcc18f'

    it('Should update story type successfully', async()=>{
        await reseedData()
        const baseStory = await storiesAccess.getStoryById(storyId, requestId)
        const translation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const tags = await storiesAccess.getStoryTagValues(baseStory.id, baseStory.defaultLocale, requestId)
        let story: Story = buildStory(baseStory, translation, tags)

        //Update story type
        const types = [StoryType.FOLK_SONG, StoryType.MYTHS]
        story.storyType = types
        await storiesAccess.updateStory(story, requestId)
        const updatedBaseStory = await storiesAccess.getStoryById(storyId, requestId)
        expect(updatedBaseStory.storyType).toStrictEqual(types)

    })
    it('Should update story title successfully', async()=>{
        const newTitle = 'Updated title'
        const baseStory = await storiesAccess.getStoryById(storyId, requestId)
        const translation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const tags = await storiesAccess.getStoryTagValues(baseStory.id, baseStory.defaultLocale, requestId)
        let story: Story = buildStory(baseStory, translation, tags)
        story.storyTitle = newTitle
        await storiesAccess.updateStory(story, requestId)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, story.defaultLocale, requestId)
        expect(receivedTranslation.storyTitle).toEqual(newTitle)
    })

    it('Should update storyTeller age and gender, story abstraction and transcript, and add tag value', async()=>{
        
        const baseStory = await storiesAccess.getStoryById(storyId, requestId)
        const translation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const tags = await storiesAccess.getStoryTagValues(baseStory.id, baseStory.defaultLocale, requestId)
        let story: Story = buildStory(baseStory, translation, tags)

        const storyTitle = 'brand new title'
        const abstraction = 'story abstraction'
        const transcript = 'story transcript'
        const age = 34
        const gender = Gender.FEMALE
        const type = [StoryType.ALLEGORY, StoryType.EPIC]
        const expectedTagValues: TagValue[] = [
            ...tags,
            {
                collectionId: story.collectionId,
                storyId: story.id,
                slug:'topic',
                name:'Topic',
                value:'Animals',
                locale: baseStory.defaultLocale
            }
        ]
        story.storyAbstraction = abstraction
        story.storyType = type
        story.storyTranscript = transcript
        story.storyTitle = storyTitle
        story.storyTellerAge = age
        story.storyTellerGender = gender
        story.tags = expectedTagValues

        await storiesAccess.updateStory(story, requestId)
        const receivedBaseStory = await storiesAccess.getStoryById(storyId, requestId)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const receivedTags = await storiesAccess.getStoryTagValues(storyId, baseStory.defaultLocale, requestId)

        expect(receivedBaseStory.storyTellerAge).toStrictEqual(story.storyTellerAge)
        expect(receivedBaseStory.storyTellerGender).toStrictEqual(story.storyTellerGender)
        expect(receivedTranslation.storyAbstraction).toStrictEqual(story.storyAbstraction)
        expect(receivedTranslation.storyTranscript).toStrictEqual(story.storyTranscript)
        expect(receivedTags).toStrictEqual(expectedTagValues)
    })
    it('Should update tag value correctly', async()=>{
        const baseStory = await storiesAccess.getStoryById(storyId, requestId)
        const translation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const tags = await storiesAccess.getStoryTagValues(baseStory.id, baseStory.defaultLocale, requestId)
        let story: Story = buildStory(baseStory, translation, tags)

        const expectedTagValues = tags.map(tag =>{
            if(tag.slug === 'topic'){
                return {
                    collectionId: story.collectionId,
                    storyId: story.id,
                    slug:'topic',
                    name:'Topic',
                    value:'new tag value',
                    locale: story.defaultLocale
                }
            } else{
                return tag
            }
        })


        story.tags = expectedTagValues
        //Update the story
        await storiesAccess.updateStory(story, requestId)
        const receivedTags = await storiesAccess.getStoryTagValues(storyId, story.defaultLocale, requestId)
        expect(receivedTags).toStrictEqual(expectedTagValues)

    })
    it('Should update storyTellerAge and transcript and remove abstraction and storyTellerGender', async()=>{
        const baseStory = await storiesAccess.getStoryById(storyId, requestId)
        const translation = await storiesAccess.getStroyTranslation(storyId, baseStory.defaultLocale, requestId)
        const tags = await storiesAccess.getStoryTagValues(baseStory.id, baseStory.defaultLocale, requestId)
        let story: Story = buildStory(baseStory, translation, tags)

        const newTranscript = 'new transcript'
        const newAge = 92
        
        story.storyTellerAge = newAge
        story.storyTranscript = newTranscript
        story.storyAbstraction = null
        story.storyTellerGender = null

        await storiesAccess.updateStory(story, requestId)
        const receivedBaseStory = await storiesAccess.getStoryById(storyId, requestId)
        const receivedTranslation = await storiesAccess.getStroyTranslation(storyId, story.defaultLocale, requestId)

        expect(receivedBaseStory.storyTellerAge).toStrictEqual(story.storyTellerAge)
        expect(receivedBaseStory.storyTellerGender).toBeUndefined()
        expect(receivedTranslation.storyAbstraction).toBeUndefined()

    })
})

const buildStory = (baseStory, translation, tags): Story=>{
    let story: Story = {
        id: baseStory.id,
        collectionId: baseStory.collectionId,
        defaultLocale: baseStory.defaultLocale,
        storyType: baseStory.storyType,
        availableTranslations: baseStory.availableTranslations,
        storyTitle: translation.storyTitle
    }
    if(baseStory.mediaFiles) story.mediaFiles = translation.baseStory
    if(baseStory.storyTellerAge) story.storyTellerAge = translation.storyTellerAge
    if(baseStory.storyTellerGender) story.storyTellerGender = translation.storyTellerGender
    if(translation.storyAbstraction) story.storyAbstraction = translation.storyAbstraction
    if(translation.storyTranscript) story.storyTranscript = translation.storyTranscript
    if(translation.storyCollectorName) story.storyCollectorName = translation.storyCollectorName
    if(translation.storyTellerName) story.storyTellerName = translation.storyTellerName
    if(translation.storyTellerPlaceOfOrigin) story.storyTellerPlaceOfOrigin = translation.storyTellerPlaceOfOrigin
    if(translation.storyTellerResidency) story.storyTellerResidency = translation.storyTellerResidency
    if(tags) story.tags = tags
    return story
}