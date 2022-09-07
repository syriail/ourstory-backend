import EmployeesAccess from '../dataLayer/employeesAccess';
import { Employee, EmployeeRole } from '../models';
import {CreateEmployeeRequest} from '../requests'
import {createLogger} from '../libs/logger'



const employeesAccess = new EmployeesAccess()
export const createEmployee = async (request: CreateEmployeeRequest, requestId: string): Promise<Employee>=>{
    
    const employee = await employeesAccess.createUser(request, requestId)
    await employeesAccess.createEmployee(employee, requestId)
    return employee
}

export const getEmployee = async(id: string, requestId: string):Promise<Employee> =>{
    const logger = createLogger(requestId, 'Business Logic', 'getEmployee')
    logger.info('Get employee: ' + id)
    return await employeesAccess.getEmployee(id, requestId)
}

export const getEmployeesByRole = async(role: EmployeeRole, requestId: string):Promise<Employee[]> =>{
    const employees = await employeesAccess.getEmployeesByRole(role, requestId)
    return employees as Employee[]
}
export const getEmployees = async(requestId: string):Promise<Employee[]> =>{
    const employees = await employeesAccess.getEmployees(requestId)
    return employees as Employee[]
}