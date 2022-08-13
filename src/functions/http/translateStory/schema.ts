export default {
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: 'object',
    properties:{
        id: {type: 'string', minLength: 1},
        storyTitle: {type: 'string', minLength: 1},
        collectionId: {type: 'string', minLength: 1},
        locale: {type: 'string'},
        storyAbstraction: {type: 'string', minLength: 1},
        storyTranscript: {type: 'string', minLength: 1},
        storyTellerName: {type: 'string', minLength: 1},
        storyTellerPlaceOfOrigin: {type: 'string', minLength: 1},
        storyTellerResidency: {type: 'string', minLength: 1},
        storyCollectorName: {type: 'string', minLength: 1},
        tags:{
            type: 'array',
            items:{
                type: 'object',
                properties:{
                    slug:{type: 'string', minLength: 1},
                    value:{type: 'string', minLength: 1}
                },
                required: ['slug', 'value']
            }
        }
    },
    required: ['id', 'storyTitle', 'storyTranscript', 'locale', 'collectionId']

} as const 