import { StaticPage } from '../models'
import { CreateStaticPage } from '../requests'
import { StaticPagesAcess } from '../dataLayer/staticPagesAcess'
import {createLogger} from '../libs/logger'
import OurstoryErrorConstructor from '../ourstoryErrors'
const pagesAccess = new StaticPagesAcess()

export const getPageContent = async(slug: string, locale: string, requestId: string): Promise<string>=>{
    const logger = createLogger(requestId, 'StaticPages Business logic', 'getPageBody')
    logger.info(`Get page body: slug: ${slug}, locale: ${locale}`)
    const page = await pagesAccess.getPage(slug, locale, requestId)
    logger.info('Return page body')
    return page.content
}

export const getPagesNames = async (locale: string, requestId: string):Promise<{slug:string, name: string, layouts: string[]}[]>=>{
    const logger = createLogger(requestId, 'StaticPages Business logic', 'getPagesNames')
    logger.info(`Get pages names for locale: ${locale}`)
    const returnedPages = await pagesAccess.getPagesOfLocale(locale, requestId)
    const pagesNames: {slug:string, name: string, layouts: string[]}[] = returnedPages.map(p=>{
        return {
            slug: p.slug,
            name: p.name,
            layouts: p.layouts
        }
    })
    logger.info(`Return ${pagesNames.length} pages`)
    return pagesNames
}

export const getPagesSummary = async(locale: string, requestId: string): Promise<StaticPage[]>=>{
    const logger = createLogger(requestId, 'StaticPages Business logic', 'getPagesSummary')
    logger.info(`Get pages summary for locale: ${locale}`)
    const returnedPages = await pagesAccess.getPagesOfLocale(locale, requestId)
    const pagesSummary: StaticPage[] = returnedPages.map(p=>{
        return {
            slug: p.slug,
            locale: p.locale,
            name: p.name,
            description: p.description,
            layouts: p.layouts
        }
    })
    logger.info(`Return ${pagesSummary.length} pages`)
    return pagesSummary
}
export const getPageDetails = async(slug: string, locale: string, requestId: string):Promise<StaticPage>=>{
    const logger = createLogger(requestId, 'StaticPages Business logic', 'getPageBody')
    logger.info(`Get page body: slug: ${slug}, locale: ${locale}`)
    let page = await pagesAccess.getPage(slug, locale, requestId)
    logger.info(`Return page details`, page)
    const translations = await pagesAccess.getAvailableTranslations(slug, requestId)
    page.availableTranslations = translations
   return page
}
export const createPage = async(page: CreateStaticPage, requestId: string)=>{
    if(!page.content) throw OurstoryErrorConstructor._400('Missing content')
    await pagesAccess.createPage(page, requestId)
}

export const updatePageTranslation = async(page: CreateStaticPage, requestId: string)=>{

    //also update all available translations to sync layouts
    await pagesAccess.updatePage(page, requestId)
    const locales = await pagesAccess.getAvailableTranslations(page.slug, requestId)
    for(const locale of locales){
        if(locale !== page.locale)
            await pagesAccess.updatePageLayouts(page.slug, locale, page.layouts, requestId)
    }

}

export const deletePage = async(slug: string, requestId: string)=>{
    const locales = await pagesAccess.getAvailableTranslations(slug, requestId)
    for(const locale of locales){
        await pagesAccess.delete(slug, locale, requestId)
    }
}