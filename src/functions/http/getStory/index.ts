import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'stories/details/{storyId}',
                cors: true,

            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['StoriesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TagValuesTable', 'Arn']
            }
        }
    ]
}