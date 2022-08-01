import { handlerPath } from "@libs/handler-resolver";
import schema from "./schema";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'POST',
                path: 'collections/translate',
                authorizer: 'authorize',
                cors: true,
                request:{
                    schemas:{
                        'application/json': schema,
                    }
                }
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:UpdateItem'],
            Resource:{
                'Fn::GetAtt':['CollectionsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        }
    ]
}