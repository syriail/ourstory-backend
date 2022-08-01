import EmployeesAccess from '../dataLayer/employeesAccess';
import { Employee, EmployeeRole } from '../models';
import {createLogger} from '../libs/logger'

const employeesAccess = new EmployeesAccess()
export const createEmployee = async (request: Employee, requestId: string)=>{
    
    await employeesAccess.createEmployee(request, requestId)
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