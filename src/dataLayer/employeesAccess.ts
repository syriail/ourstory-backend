import { Employee, EmployeeRole } from 'src/models';
import {createDynamodbClient} from './dynamodb-infrastructure'
import {createLogger} from '../libs/logger'

class EmployeesAccess{
    constructor (
        private readonly documentClient = createDynamodbClient(),
        private readonly employeesTable = process.env.EMPLOYEES_TABLE,
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
}

export default EmployeesAccess