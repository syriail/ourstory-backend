import { handlerPath } from "@libs/handler-resolver";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'page/{slug}/{locale}',
                authorizer: 'authorize',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
            Resource:{
                'Fn::GetAtt':['StaticPagesTable', 'Arn']
            }
        }
    ]
}