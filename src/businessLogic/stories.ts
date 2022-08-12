import { StoryAccess } from "../dataLayer/storiesAccess";
import {CollectionAccess} from '../dataLayer/collectionsAccess'
import {Story, TagValue, UploadAttachmentData, MediaFormat } from "../models";
import * as uuid from 'uuid'
import {CreateStoryRequest} from '../requests';
import BucketAccess from "../dataLayer/bucketAcess";
import {createLogger} from '../libs/logger'

const storyAccess = new StoryAccess()
const collectionAccess = new CollectionAccess()
const bucketAcess = new BucketAccess()

export const getStoriesByCollection = async(collectionId:string, locale:string, requestId: string, pageSize: number, lastEvaluatedId?: string):Promise<{lastId: string | undefined, stories: Story[]}> =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'getStoriesByCollection')
    let stories: Story[] = []
    //Get base stories
    const baseStories = await storyAccess.getStoriesByCollectionId(collectionId, requestId, pageSize, lastEvaluatedId)
    //For each base story, get it's translation of the given locale to build full story
    for(const baseStory of baseStories.stories){
        const targetLocale = baseStory.availableTranslations.includes(locale) ? locale : baseStory.defaultLocale
        const translation = await storyAccess.getStroyTranslation(baseStory.id, targetLocale, requestId)
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
    logger.info(`Return ${stories.length} story`)
    return {
        stories,
        lastId: baseStories.lastId
    }
}

export const getStoryDetails = async(storyId: string, locale: string, requestId: string): Promise<Story> =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'getStoryDetails')
    logger.info(`Fetch and build full story id: ${storyId}`)
    //Get base story
    const baseStory = await storyAccess.getStoryById(storyId, requestId)
    //If the story does not have a translation for the given locale then use the default locale
    const targetLocale = baseStory.availableTranslations.includes(locale) ? locale : baseStory.defaultLocale
    //Get story translation
    const translation = await storyAccess.getStroyTranslation(storyId, targetLocale, requestId)
    //Get tags values
    const tags = await storyAccess.getStoryTagValues(storyId, targetLocale, requestId)
    let story: Story = {
        id: baseStory.id,
        collectionId: baseStory.collectionId,
        defaultLocale: baseStory.defaultLocale,
        availableTranslations: baseStory.availableTranslations,
        storyTitle: translation.storyTitle,
        storyType: baseStory.storyType,
        tags
    }
    //Build the full story
    if(baseStory.storyTellerAge) story.storyTellerAge = baseStory.storyTellerAge
    if(baseStory.storyTellerGender) story.storyTellerGender = baseStory.storyTellerGender
    if(baseStory.mediaFiles) story.mediaFiles = baseStory.mediaFiles
    if(translation.storyAbstraction) story.storyAbstraction = translation.storyAbstraction
    if(translation.storyTranscript) story.storyTranscript = translation.storyTranscript
    if(translation.storyTellerName) story.storyTellerName = translation.storyTellerName
    if(translation.storyTellerPlaceOfOrigin) story.storyTellerPlaceOfOrigin = translation.storyTellerPlaceOfOrigin
    if(translation.storyTellerResidency) story.storyTellerResidency = translation.storyTellerResidency
    if(translation.storyCollectorName) story.storyCollectorName = translation.storyCollectorName

    return story
}
export const createStory = async(request: CreateStoryRequest, requestId: string): Promise<Story>=>{
    const logger = createLogger(requestId, 'businessLogic', 'createStory')
    const id = uuid.v4()
    logger.info('Build tag values')
    const story = await buildStoryFromRequest(id, request, requestId)
    logger.info('Create the story in DB')
    await storyAccess.createStory(story, requestId)
    return story
}

export const updateStory = async(storyId: string, request: CreateStoryRequest, requestId: string): Promise<Story> =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'updateStory')
    logger.info(`Update story ${storyId}`)
    const story = await buildStoryFromRequest(storyId, request, requestId)
    await storyAccess.updateStory(story, requestId)
    return getStoryDetails(storyId, story.defaultLocale, requestId)

}

export const deleteStory = async(storyId: string, requestId: string) =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'deleteStory')
    logger.info(`Delete story ${storyId}`)
    //Get base story to know how many translations available, to be deleted also
    const baseStory = await storyAccess.getStoryById(storyId, requestId)
    await storyAccess.deleteStory(baseStory, requestId)
    //Delete all media from storage
    if(baseStory.mediaFiles){
        for(const media of baseStory.mediaFiles){
            await bucketAcess.deleteMediaFile(media.mediaPath, requestId)
        }
    }
}

const buildStoryFromRequest = async(storyId:string, request: CreateStoryRequest, requestId: string): Promise<Story> =>{
    const logger = createLogger(requestId, 'BusinessLogic', 'buildStoryFromRequest')
    let tags: TagValue[] = []
    if(request.tags){
        for(const tag  of request.tags){
            logger.info(`Get tag translation: ${request.collectionId}#${tag.slug} in ${request.defaultLocale}`)
            const tagTranslation = await collectionAccess.getTagTranslation(request.collectionId, tag.slug, request.defaultLocale)
            tags.push({
                storyId,
                collectionId: request.collectionId,
                locale: request.defaultLocale,
                name: tagTranslation.name,
                slug: tag.slug,
                value: tag.value
            })
        }
    }
    let story: Story = {
        id: storyId,
        ...request,
        availableTranslations: [],
        tags
    }
    return story
}

/**
 * Get signed upload url for TODO image
 * @param storyId The story id to which the media belog
 * @param mediaFromat The format of the media, VIDEO, AUDIO or IMAGE
 * @param fileExtension The extension of the file to be uploaded like mp4, png ..etc
 *
 * @returns singned url as string and the path in the bucket
 */
 export const getUploadUrls = async(storyId: string, mediaFromat: MediaFormat, fileExtension: string, requestId: string): Promise<UploadAttachmentData>=>{
    const logger = createLogger(requestId, 'BusinessLogic', 'getUploadUrls')
    
    const randomNumber = Math.floor(Math.random() * 100);
    let key = `${storyId}_${randomNumber}.${fileExtension}`
    switch(mediaFromat){
        case MediaFormat.AUDIO:
            key = 'audio/' + key
            break
        case MediaFormat.VIDEO:
            key = 'video/' + key
            break
        case MediaFormat.IMAGE:
        key = 'image/' + key
        break
    }
    logger.info(`Get upload url of key: ${key}`)
    const urls: UploadAttachmentData = bucketAcess.getMediaUploadUrls(key)
    await storyAccess.addMediaToStory(storyId,urls.attachmentUrl, mediaFromat)

    return urls
}

export const getDownloadUrls = async(path: string, requestId: string):Promise<string> =>{
    return bucketAcess.getMediaDownloadUrl(path, requestId)
    
}
export const deleteMedia = async(storyId: string, path: string, requestId: string)=>{
    const logger = createLogger(requestId, 'BusinessLogic', 'deleteMedia')
    logger.info('Delete mediaFile from the story in DB')
    await storyAccess.deleteMedia(storyId, path, requestId)
    logger.info('Delete file from storage')
    await bucketAcess.deleteMediaFile(path, requestId)
}

