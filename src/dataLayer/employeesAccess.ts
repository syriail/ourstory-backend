import { Employee, EmployeeRole } from '../models'
import { CreateEmployeeRequest } from '../requests'
import {createDynamodbClient} from './dynamodb-infrastructure'
import {createCognitoServiceProvider} from './congnito-infrastructure'
import {createLogger} from '../libs/logger'
import OurstoryErrorConstructor from '../ourstoryErrors'



class EmployeesAccess{
    constructor (
        private readonly documentClient = createDynamodbClient(),
        private readonly cognitoProvider = createCognitoServiceProvider(),
        private readonly employeesTable = process.env.EMPLOYEES_TABLE,
        private readonly userPoolArn = process.env.COGNITO_POOL_ARN
    ){}
    async getEmployeesByIds(ids:string[]):Promise<Employee[]>{
        if(!ids.length) return []
        try{
            let requests = {}
            const keys = ids.map((id)=>{return {id}})
            requests[this.employeesTable] = {
                    Keys: keys
                }
        const batchGet: AWS.DynamoDB.DocumentClient.BatchGetItemInput = {
            RequestItems: requests
        }
        const response = await this.documentClient.batchGet(batchGet).promise()
        const items = response.Responses[this.employeesTable]
        return items as Employee[]
        }catch(error){
            throw error
        }
        
    }
    async getEmployee(id: string, requestId: string): Promise<Employee>{
        const logger = createLogger(requestId, 'Data Access', 'getEmployee')
        logger.info('Get employee: ' + id)
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.employeesTable,
            Key:{
                id
            }
        }
        const response = await this.documentClient.get(params).promise()
        return response.Item as Employee
    }
    async createEmployee(employee: Employee, requestId: string){
        const logger = createLogger(requestId, 'Data Access', 'createEmployee')
        logger.info('Create employee: ', {message: employee})
        try{
            const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.employeesTable,
                Item:employee
            }
            await this.documentClient.put(params).promise()
            logger.info('Employee created')
        }catch(error){
            logger.error(error)
            throw error
        }
        
    }

    async getEmployeesByRole(role: EmployeeRole, requestId: string): Promise<{[key:string]:any}[]>{
        const logger = createLogger(requestId, 'Data Access', 'getEmployeesByRole')
        logger.info('Get employees by role: ' + role)
        try{
            const params: AWS.DynamoDB.DocumentClient.ScanInput = {
                TableName: this.employeesTable,
                FilterExpression: 'contains(#roles, :role)',
                ExpressionAttributeNames:{
                    '#roles': 'roles'
                },
                ExpressionAttributeValues:{
                    ':role': role
                }
            }
            const response = await this.documentClient.scan(params).promise()
            const employees = response.Items
            logger.info(`Return ${employees.length} employees`)
            return employees
        }catch(error){
            logger.error(error)
            throw error
        }
    }
    async getEmployees( requestId: string): Promise<{[key:string]:any}[]>{
        const logger = createLogger(requestId, 'Data Access', 'getEmployees')
        logger.info('Get employees')
        try{
            const params: AWS.DynamoDB.DocumentClient.ScanInput = {
                TableName: this.employeesTable
   
            }
            const response = await this.documentClient.scan(params).promise()
            const employees = response.Items
            logger.info(`Return ${employees.length} employees`)
            return employees
        }catch(error){
            logger.error(error)
            throw error
        }
    }
    async createUser(request: CreateEmployeeRequest, requestId: string): Promise<Employee>{
        const logger = createLogger(requestId, 'Data Access', 'createUser')
        logger.info('Create user in userpool', {user: request})
        const arnParts = this.userPoolArn.split(':userpool/')
        const userpoolId = arnParts[1]

        const params: AWS.CognitoIdentityServiceProvider.Types.AdminCreateUserRequest = {
            UserPoolId: userpoolId,
            MessageAction: "SUPPRESS",
            Username: request.email,
            UserAttributes:[
                {
                    Name: 'email',
                    Value: request.email
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                }
            ],
            TemporaryPassword: request.password
        }
        const response = await this.cognitoProvider.adminCreateUser(params).promise()
        if(response.User){
            const attributes = response.User.Attributes
            if(attributes){
                const subAttr = attributes.find(a=> a.Name === 'sub')
                const employee: Employee = {
                    id: subAttr.Value,
                    firstName: request.firstName,
                    lastName: request.lastName,
                    locale: request.locale,
                    email: request.email,
                    roles: request.roles as EmployeeRole[]
                }
                logger.info('Create user in userpool succeeded. Will add user to groups according to roles')
                for(const role of request.roles){
                    const groupParams: AWS.CognitoIdentityServiceProvider.Types.AdminAddUserToGroupRequest = {
                        UserPoolId: userpoolId,
                        Username: request.email,
                        GroupName: role
                    }
                    await this.cognitoProvider.adminAddUserToGroup(groupParams).promise()
                }
                
                return employee
            }
        }
        throw OurstoryErrorConstructor._502('Could not create user')
        
    }
}

export default EmployeesAccess