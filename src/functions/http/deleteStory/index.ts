import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'DELETE',
                path: 'story/{storyId}',
                authorizer: 'authorize',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:DeleteItem'],
            Resource:{
                'Fn::GetAtt':['StoriesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:DeleteItem'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:DeleteItem'],
            Resource:{
                'Fn::GetAtt':['TagValuesTable', 'Arn']
            }
        }
    ]
}