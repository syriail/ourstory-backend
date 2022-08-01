import { handlerPath } from "@libs/handler-resolver";
import schema from "./schema";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'PATCH',
                path: 'story/{storyId}',
                authorizer: 'authorize',
                cors: true,
                request:{
                    schemas: {
                        'application/json': schema
                    }
                }
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem', 'dynamodb:GetItem', 'dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['StoriesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem', 'dynamodb:GetItem', 'dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:PutItem', 'dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TagValuesTable', 'Arn']
            }
        }
    ]
}