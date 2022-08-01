
import * as AWSXRay from "aws-xray-sdk"
import * as uuid from 'uuid'
import {reseedData} from '../../testUtils/dynamodb'
import { EmployeeRole } from '../../models'
import EmployeesAccess from "../employeesAccess"
const seededEmployees = require('../../../db-seeds/employees.json')
AWSXRay.setContextMissingStrategy("IGNORE_ERROR")
const employeesAccess = new EmployeesAccess()

const requestId = uuid.v4()


describe('Data Access getEmployees by role', ()=>{
  it('Should return 2 employees whose roles include EDITOR', async()=>{
    await reseedData()
    const seededEditors = seededEmployees.filter(e => e.roles.includes('EDITOR'))
    const employees = await employeesAccess.getEmployeesByRole(EmployeeRole.EDITOR, requestId)
    expect(employees.length).toBe(seededEditors.length)
  })
  it('Should return 2 employees whose roles include COLLECTION_MANAGER', async()=>{
    const seededManagers = seededEmployees.filter(e => e.roles.includes('COLLECTION_MANAGER'))
    const employees = await employeesAccess.getEmployeesByRole(EmployeeRole.COLLECTION_MANAGER, '123')
    expect(employees.length).toBe(seededManagers.length)
  })
  it('Should return 1 employee whose roles include ADMIN', async()=>{
    const seededAdmins = seededEmployees.filter(e => e.roles.includes('ADMIN'))
    const employees = await employeesAccess.getEmployeesByRole(EmployeeRole.ADMIN, requestId)
    expect(employees.length).toBe(seededAdmins.length)
  })
})

describe('Data Access getEmployeesByIds', ()=>{
  it('Should return two employees', async()=>{
    await reseedData()
    const ids = ['1', '2']
    const expectedEmployees = seededEmployees.filter(employee => ids.includes(employee.id) )
    const receivedEmployees = await employeesAccess.getEmployeesByIds(ids)
    expect(receivedEmployees).toStrictEqual(expectedEmployees)
  })
  it('Should return empty list', async()=>{
    const expectedEmployees = []
    const receivedEmployees = await employeesAccess.getEmployeesByIds(['9898989'])
    expect(receivedEmployees).toStrictEqual(expectedEmployees)
  })
  it('Should return empty list', async()=>{
    const expectedEmployees = []
    const receivedEmployees = await employeesAccess.getEmployeesByIds([])
    expect(receivedEmployees).toStrictEqual(expectedEmployees)
  })
})

describe("data access getEmployee", () => {
  it("Should return the employee of id: 2 which was seed while starting db", async () => {
    await reseedData()
    const employeeId = '2'
    const expectedEmployee = seededEmployees.find(employee => employee.id === employeeId)
    const receivedEmployee = await employeesAccess.getEmployee(employeeId, requestId)
    expect(receivedEmployee).toStrictEqual(expectedEmployee)
  })
  it("should return the the same employee after creating it", async () => {
    const employee = {
      id: "12345",
      firstName: "Hussein",
      lastName: "Ghrer",
      roles: [EmployeeRole.ADMIN],
      locale: "en",
    }
    await employeesAccess.createEmployee(employee, requestId)
    const item = await employeesAccess.getEmployee("12345", requestId)
    expect(item).toStrictEqual(employee)
  })
  it("should return undefined", async () => {
    const item = await employeesAccess.getEmployee("54321", requestId)
    expect(item).toBeUndefined()
  })
})
