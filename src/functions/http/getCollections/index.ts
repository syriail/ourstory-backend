import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'collections',
                authorizer: 'authorize',
                cors: true,

            }
        }
    ],
    iamRoleStatementsInherit: true,
    iamRoleStatements:[
        {
            Effect: 'Allow',
            Action: ['dynamodb:Scan'],
            Resource:{
                'Fn::GetAtt':['CollectionsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem', 'dynamodb:Query'],
            Resource:{
                'Fn::GetAtt':['TranslationsTable', 'Arn']
            }
        },
        {
            Effect: 'Allow',
            Action: ['dynamodb:GetItem', 'dynamodb:BatchGetItem'],
            Resource:{
                'Fn::GetAtt':['EmployeesTable', 'Arn']
            }
        }
    ]
}