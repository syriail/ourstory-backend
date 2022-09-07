import {Tag } from "./models"

export interface CreateCollectionRequest{
    defaultLocale: string
    name: string
    description?: string
    editors?:string[]
    tags?:Tag[]
}




export interface CreateEmployeeRequest{
    locale: string
    firstName: string
    lastName: string
    email: string
    password: string
    roles:string[]
}

export interface CreateStoryRequest{
    collectionId: string
    storyTitle: string
    defaultLocale: string
    storyType: string[]
    storyAbstraction?: string
    storyTranscript?: string
    storyTellerAge?: number
    storyTellerGender?: string
    storyTellerName?: string
    storyTellerPlaceOfOrigin?: string
    storyTellerResidency?:string
    storyCollectorName?:string
    tags?:TagValueRequest[]
}
export interface TagValueRequest{
    slug: string
    value: string
}
export interface UpdateCollectionRequest{
    id: string
    defaultLocale: string
    name: string
    description?: string
    editors?:string[]
    tags?:Tag[]
}

export interface TranslateCollectionRequest{
    id: string
    locale: string
    name: string
    description?: string
    tags?: Tag[]
}

export interface TranslateStoryRequest{
    id: string
    locale: string
    collectionId: string
    storyTitle: string
    storyAbstraction?: string
    storyTranscript?: string
    storyTellerName?: string
    storyTellerPlaceOfOrigin?: string
    storyTellerResidency?:string
    storyCollectorName?:string
    tags?:TagValueRequest[]
}

export interface CreateStaticPage{
    slug: string
    locale: string
    name: string
    content: string,
    description: string,
    layouts: string[]
  }