import { Employee } from "../../models/index.js";

const getAllEmployee = async (req, res) => {
    try {
        // Fetch employees and select only the required fields
        const employees = await Employee.find().select({
            username: 1,
            totalCalls: 1,
            totalCallLength: 1,
            lastCallMade: 1,
        });

        // Map through the employees to calculate average call length
        const result = employees.map(employee => {
            const avgCallLength = employee.totalCalls > 0 
                ? employee.totalCallLength / employee.totalCalls 
                : 0; // Avoid division by zero

            return {
                name: employee.username,
                totalCalls: employee.totalCalls,
                totalCallLength: employee.totalCallLength,
                avgCallLength: avgCallLength, // Average call length
                lastCallMade: employee.lastCallMade,
            };
        });

        return res.send(result);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).send('Internal Server Error');
    }
};

export default getAllEmployee;
