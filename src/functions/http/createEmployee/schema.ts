export default{
    "$schema": "http://json-schema.org/draft-06/schema#",
    type: 'object',
    properties:{
        firstName: {type: 'string', minLength: 1},
        locale: {type: 'string', minLength: 1},
        lastName: {type: 'string', minLength: 1},
        password: {type: 'string', minLength: 1},
        email: {type: 'string', minLength: 1},
        roles:{
            type: 'array',
            items:{
                type:'string'
            }
        }
    },
    required: ['firstName', 'lastName', 'locale', 'password', 'email', 'roles']
    
} as const