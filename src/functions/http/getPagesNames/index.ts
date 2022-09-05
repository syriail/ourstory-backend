import { handlerPath } from "@libs/handler-resolver";

export default{
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'staticPages/{locale}',
                cors: true
            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['StaticPagesTable', 'Arn']
            }
        }
    ]
}