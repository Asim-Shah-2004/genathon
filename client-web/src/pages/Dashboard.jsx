import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, LineChart, PhoneCall, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, LineChart as RechartsLineChart, Line, Tooltip, Legend, BarChart, Bar } from 'recharts';

const callVolData = [
  { date: '2024-01', calls: 45, hours: 28, avgDuration: 35 },
  { date: '2024-02', calls: 52, hours: 31, avgDuration: 38 },
  { date: '2024-03', calls: 48, hours: 29, avgDuration: 36 },
  { date: '2024-04', calls: 55, hours: 32, avgDuration: 37 },
  { date: '2024-05', calls: 60, hours: 35, avgDuration: 40 },
  { date: '2024-06', calls: 58, hours: 34, avgDuration: 39 },
  { date: '2024-07', calls: 49, hours: 30, avgDuration: 34 },
  { date: '2024-08', calls: 51, hours: 31, avgDuration: 35 },
  { date: '2024-09', calls: 57, hours: 33, avgDuration: 36 },
  { date: '2024-10', calls: 64, hours: 36, avgDuration: 38 },
  { date: '2024-11', calls: 53, hours: 32, avgDuration: 37 },
  { date: '2024-12', calls: 60, hours: 34, avgDuration: 39 },
  { date: '2025-01', calls: 62, hours: 35, avgDuration: 41 }
];

// Mock data for employees
const employees = [
  { id: 1, name: 'John Doe', totalCalls: 150, totalCallLength: 450, averageCallLength: 3, lastCallMade: '2024-10-01' },
  { id: 2, name: 'Jane Smith', totalCalls: 200, totalCallLength: 600, averageCallLength: 3, lastCallMade: '2024-10-02' },
  { id: 3, name: 'Bob Johnson', totalCalls: 100, totalCallLength: 400, averageCallLength: 4, lastCallMade: '2024-10-03' },
  { id: 4, name: 'Alice Williams', totalCalls: 180, totalCallLength: 540, averageCallLength: 3, lastCallMade: '2024-10-04' },
  { id: 5, name: 'Charlie Brown', totalCalls: 120, totalCallLength: 360, averageCallLength: 3, lastCallMade: '2024-10-05' },
  { id: 1, name: 'John Doe', totalCalls: 150, totalCallLength: 450, averageCallLength: 3, lastCallMade: '2024-10-01' },
  { id: 2, name: 'Jane Smith', totalCalls: 200, totalCallLength: 600, averageCallLength: 3, lastCallMade: '2024-10-02' },
  { id: 3, name: 'Bob Johnson', totalCalls: 100, totalCallLength: 400, averageCallLength: 4, lastCallMade: '2024-10-03' },
  { id: 4, name: 'Alice Williams', totalCalls: 180, totalCallLength: 540, averageCallLength: 3, lastCallMade: '2024-10-04' },
  { id: 5, name: 'Charlie Brown', totalCalls: 120, totalCallLength: 360, averageCallLength: 3, lastCallMade: '2024-10-05' },
];

// Sort employees by last call made date
const sortedEmployees = employees.sort((a, b) => new Date(b.lastCallMade) - new Date(a.lastCallMade));

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredEmployees = sortedEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id) => {
    navigate(`/employee/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-blue-600">Employee Dashboard</h1>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-3 w-full border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md mb-8">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500 text-lg">
                  <TableHead className="text-white text-center">Employee ID</TableHead>
                  <TableHead className="text-white text-center">Name</TableHead>
                  <TableHead className="text-white text-center">Total Calls</TableHead>
                  <TableHead className="text-white text-center">Total Call Length</TableHead>
                  <TableHead className="text-white text-center">Avg Call Length</TableHead>
                  <TableHead className="text-white text-center">Last Call Made</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <motion.tr
                    key={employee.id}
                    className={cn(
                      "cursor-pointer hover:bg-blue-50 transition-all text-lg",
                      "focus:bg-blue-100 focus:outline-none"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRowClick(employee.id)}
                  >
                    <TableCell className="text-center">{employee.id}</TableCell>
                    <TableCell className="font-medium text-center">{employee.name}</TableCell>
                    <TableCell className="text-center">{employee.totalCalls}</TableCell>
                    <TableCell className="text-center">{employee.totalCallLength}</TableCell>
                    <TableCell className="text-center">{employee.averageCallLength}</TableCell>
                    <TableCell className="text-center">{new Date(employee.lastCallMade).toLocaleDateString()}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredEmployees.length === 0 && (
          <p className="mt-4 text-center text-gray-500 text-lg">No employees found.</p>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Calls</CardTitle>
              <PhoneCall className="text-blue-300" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,450</div>
              <p className="text-sm text-blue-200">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Hours</CardTitle>
              <Clock className="text-blue-300" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">885</div>
              <p className="text-sm text-blue-200">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Active Agents</CardTitle>
              <Users className="text-blue-300" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-blue-200">Currently online</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Card className="mb-8 bg-white border-blue-600">
          <CardHeader>
            <CardTitle className="text-blue-600">Call Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={callVolData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calls" stroke="#8884d8" name="Calls made" />
                  <Line type="monotone" dataKey="hours" stroke="#82ca9d" name="Hours" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance Chart */}
        <Card className="mb-8 bg-white border-blue-600">
          <CardHeader>
            <CardTitle className="text-blue-600">Employee Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedEmployees}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCalls" fill="#8884d8" name="Total Calls" />
                  <Bar dataKey="totalCallLength" fill="#82ca9d" name="Total Call Length" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}