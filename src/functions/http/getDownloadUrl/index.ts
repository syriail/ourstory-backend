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
                method: 'GET',
                path: 'downloadUrl',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['s3:GetObject'],
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