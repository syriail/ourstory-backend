import { handlerPath } from "@libs/handler-resolver";
import schema from "./schema";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'PATCH',
                path: 'pages',
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
            Action: ['dynamodb:UpdateItem', 'dynamodb:Scan'],
            Resource:{
                'Fn::GetAtt':['StaticPagesTable', 'Arn']
            }
        }
    ]
}