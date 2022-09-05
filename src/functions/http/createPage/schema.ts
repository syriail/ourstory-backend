export default{
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: 'object',
    properties:{
        slug: {type: 'string', minLength: 1},
        locale: {type: 'string', minLength: 1},
        name: {type: 'string', minLength: 1},
        description: {type: 'string', minLength: 1},
        content: {type: 'string', minLength: 1},
        layouts:{
            type: 'array',
            items:{
                type:'string'
            }
        }
    },
    required: ['slug', 'locale', 'name', 'description', 'layouts', 'content']
    
} as const