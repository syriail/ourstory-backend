import { handlerPath } from "@libs/handler-resolver";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    environment:{
        MEDIA_BUCKET: '${self:custom.s3Buckets.mediaBucket}',
        URL_EXPIRATION:'300'
    },
    events:[
        {
            http:{
                method: 'DELETE',
                path: 'media/{storyId}',
                authorizer: 'authorize',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
            Resource:{
                'Fn::GetAtt':['StoriesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
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