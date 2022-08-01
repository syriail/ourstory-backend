import * as uuid from 'uuid'
export const getArabicArticleSynonyms = (text: string)=>{
    let synonyms = []
    if(!text) return synonyms
    const words = text.split(' ')
    
    for(const word of words){
        if(word.startsWith('ال') || word.startsWith('لل')){
            synonyms.push({
                objectID: uuid.v4(),
                type: 'synonym',
                synonyms:[word, word.substring(2)]
            })
        }
        if(word.startsWith('بال')){
            synonyms.push({
                objectID: uuid.v4(),
                type: 'synonym',
                synonyms:[word, word.substring(3)]
            })
        }
    }
    return synonyms
}