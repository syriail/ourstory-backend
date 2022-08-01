import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'stories/{collectionId}',
                authorizer: 'authorize',
                cors: true,

            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['StoriesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['TagValuesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query'],
            Resource:{
                'Fn::Join':[
                    '/',
                    [
                        {
                            'Fn::GetAtt':['StoriesTable', 'Arn']
                        },
                        'index',
                        '*'
                    ]
                ]
            }
        }
    ]
}