import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    environment:{
        COGNITO_POOL_ARN: {
            'Fn::GetAtt':['OurstoryMangerUserPool', 'Arn']
        }
    },
    events:[
        {
            http:{
                method: 'POST',
                path: 'employees',
                authorizer: 'authorize',
                cors: true,

            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:PutItem', 'dynamodb:Scan'],
            Resource:{
                'Fn::GetAtt':['EmployeesTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminAddUserToGroup'],
            Resource:{
                'Fn::GetAtt':['OurstoryMangerUserPool', 'Arn']
            }
        }
    ]
}