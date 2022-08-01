export enum MediaFormat {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNSPECIFIED = 'UNSPECIFIED'
}
export enum StoryType {
  MYTHS = 'MYTHS',
  FABLE = 'FABLE',
  FOLK_TALE = 'FOLK_TALE',
  WONDER_TALE = 'WONDER_TALE',
  WISDOM_TALE = 'WISDOM_TALE',
  ALLEGORY = 'ALLEGORY',
  TALL_TALE = 'TALL_TALE',
  RELIGIOUS_TALE = 'RELIGIOUS_TALE',
  PROVERBS = 'PROVERBS',
  PERSONAL_EXPERIENCE = 'PERSONAL_EXPERIENCE',
  EPIC = 'EPIC',
  FOLK_SONG = 'FOLK_SONG',
}
export enum EmployeeRole {
  ADMIN = 'ADMIN',
  COLLECTION_MANAGER = 'COLLECTION_MANAGER',
  EDITOR = 'EDITOR'
}
export enum TranslableType{
  COLLECTION = 'COLLECTION',
  STORY = 'STORY',
  TAG = 'TAG'
}
export interface MediaFile {
  format: MediaFormat,
  mediaPath: string
}

export interface Tag{
  slug: string,
  name: string
}
export interface Employee{
  id: string,
  firstName?: string,
  lastName?: string,
  locale: string,
  roles: EmployeeRole[]
}
export interface Collection{
  id: string
  name: string
  description?: string
  createdAt: string
  manager: Employee
  availableTranslations: string[]
  defaultLocale: string
  editors?: Employee[]
  tags?: Tag[]
}
export interface Story{
  id: string
  collectionId: string
  defaultLocale: string
  availableTranslations: string[]
  storyTitle: string
  storyAbstraction?: string
  storyTranscript?: string
  storyTellerName?: string
  storyTellerPlaceOfOrigin?: string
  storyTellerResidency?: string
  storyCollectorName?: string
  mediaFiles?: MediaFile[]
  storyType: string[]
  storyTellerAge?: number
  storyTellerGender?: string
  tags?: TagValue[]
}
export interface TagValue{
  storyId: string
  collectionId: string
  locale: string
  slug: string
  name: string
  value: string
}

export interface UploadAttachmentData{
uploadUrl: string
attachmentUrl: string
}

export const languages = ['en', 'ar']