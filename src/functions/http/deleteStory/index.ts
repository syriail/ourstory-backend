import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    environment:{
        MEDIA_BUCKET: '${self:custom.s3Buckets.mediaBucket}'
    },
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
            Action: ['dynamodb:GetItem', 'dynamodb:DeleteItem'],
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
            Action: ['dynamodb:DeleteItem', 'dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TagValuesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem'],
            Resource:{
                'Fn::GetAtt':['CollectionsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['s3:DeleteObject'],
            Resource:{
                'Fn::Join':[
                    '/',
                    [
                        {
                            'Fn::GetAtt':['MediaBucket', 'Arn']
                        },
                        '*'
                    ]
                ]
            }
        }
    ]
}