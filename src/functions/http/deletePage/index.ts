import { handlerPath } from "@libs/handler-resolver";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'DELETE',
                path: 'pages/delete/{slug}',
                authorizer: 'authorize',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:DeleteItem', 'dynamodb:Scan'],
            Resource:{
                'Fn::GetAtt':['StaticPagesTable', 'Arn']
            }
        }
    ]
}