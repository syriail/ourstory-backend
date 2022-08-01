import { handlerPath } from "@libs/handler-resolver";
export default {
    handler:`${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    events:[
        {
            http:{
                method: 'GET',
                path: 'employees/role/{role}',
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
                'Fn::GetAtt':['EmployeesTable', 'Arn']
            }
        }
    ]
}