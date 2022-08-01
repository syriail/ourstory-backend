import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'employees/{employeeId}',
                authorizer: 'authorize',
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
                'Fn::GetAtt':['EmployeesTable', 'Arn']
            }
        }
    ]
}