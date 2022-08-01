import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    environment:{
        ALGOLIA_INDEX_NAME_PREFIX: '${self:provider.stage}_ourstory_'
    },
    events:[
        {
            stream:{
                type: "dynamodb",
                arn:{
                    "Fn::GetAtt":["TranslationsTable", "StreamArn"]
                }
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem'],
            Resource:{
                'Fn::GetAtt':['CollectionsTable', 'Arn']
            }
        },
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