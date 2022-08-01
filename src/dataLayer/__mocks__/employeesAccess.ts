// Import this named export into your test file:
export const mockGetEmployee = jest.fn();
export const mockGetEmployeesByIds = jest.fn();
const mock = jest.fn().mockImplementation(() => {
  return {
    getEmployee: mockGetEmployee,
    getEmployeesByIds: mockGetEmployeesByIds
  };
});

export default mock;