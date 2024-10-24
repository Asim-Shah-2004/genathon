import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, LineChart, PhoneCall, Search, Users, TrendingUp, Timer, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, LineChart as RechartsLineChart, Line, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, Scatter, ScatterChart, ZAxis } from 'recharts';

const callVolData = [
  { date: '2024-01', calls: 45, hours: 28, avgDuration: 35, satisfaction: 4.2 },
  { date: '2024-02', calls: 52, hours: 31, avgDuration: 38, satisfaction: 4.3 },
  { date: '2024-03', calls: 48, hours: 29, avgDuration: 36, satisfaction: 4.1 },
  { date: '2024-04', calls: 55, hours: 32, avgDuration: 37, satisfaction: 4.4 },
  { date: '2024-05', calls: 60, hours: 35, avgDuration: 40, satisfaction: 4.5 },
  { date: '2024-06', calls: 58, hours: 34, avgDuration: 39, satisfaction: 4.3 },
  { date: '2024-07', calls: 49, hours: 30, avgDuration: 34, satisfaction: 4.2 },
  { date: '2024-08', calls: 51, hours: 31, avgDuration: 35, satisfaction: 4.4 },
  { date: '2024-09', calls: 57, hours: 33, avgDuration: 36, satisfaction: 4.3 },
  { date: '2024-10', calls: 64, hours: 36, avgDuration: 38, satisfaction: 4.6 },
  { date: '2024-11', calls: 53, hours: 32, avgDuration: 37, satisfaction: 4.4 },
  { date: '2024-12', calls: 60, hours: 34, avgDuration: 39, satisfaction: 4.5 },
  { date: '2025-01', calls: 62, hours: 35, avgDuration: 41, satisfaction: 4.7 }
];

const employees = [
  { id: 1, name: 'John Doe', totalCalls: 150, totalCallLength: 450, averageCallLength: 3, lastCallMade: '2024-10-01', satisfaction: 4.5, callsPerHour: 8 },
  { id: 2, name: 'Jane Smith', totalCalls: 200, totalCallLength: 600, averageCallLength: 3, lastCallMade: '2024-10-02', satisfaction: 4.8, callsPerHour: 10 },
  { id: 3, name: 'Bob Johnson', totalCalls: 100, totalCallLength: 400, averageCallLength: 4, lastCallMade: '2024-10-03', satisfaction: 4.2, callsPerHour: 6 },
  { id: 4, name: 'Alice Williams', totalCalls: 180, totalCallLength: 540, averageCallLength: 3, lastCallMade: '2024-10-04', satisfaction: 4.6, callsPerHour: 9 },
  { id: 5, name: 'Charlie Brown', totalCalls: 120, totalCallLength: 360, averageCallLength: 3, lastCallMade: '2024-10-05', satisfaction: 4.4, callsPerHour: 7 },
  { id: 1, name: 'John Doe', totalCalls: 150, totalCallLength: 450, averageCallLength: 3, lastCallMade: '2024-10-01', satisfaction: 4.5, callsPerHour: 8 },
  { id: 2, name: 'Jane Smith', totalCalls: 200, totalCallLength: 600, averageCallLength: 3, lastCallMade: '2024-10-02', satisfaction: 4.8, callsPerHour: 10 },
  { id: 3, name: 'Bob Johnson', totalCalls: 100, totalCallLength: 400, averageCallLength: 4, lastCallMade: '2024-10-03', satisfaction: 4.2, callsPerHour: 6 },
  { id: 4, name: 'Alice Williams', totalCalls: 180, totalCallLength: 540, averageCallLength: 3, lastCallMade: '2024-10-04', satisfaction: 4.6, callsPerHour: 9 },
  { id: 5, name: 'Charlie Brown', totalCalls: 120, totalCallLength: 360, averageCallLength: 3, lastCallMade: '2024-10-05', satisfaction: 4.4, callsPerHour: 7 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const calculateTrendline = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  data.forEach((point, i) => {
    sumX += i;
    sumY += point.totalCalls;
    sumXY += i * point.totalCalls;
    sumXX += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((_, i) => ({
    name: data[i].name,
    trendline: slope * i + intercept
  }));
};


export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const trendlineData = calculateTrendline(employees);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (id) => {
    navigate(`/employee?id=${id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        <motion.h1
          className="mb-8 text-4xl font-bold text-blue-600 text-center md:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Employee Stats Dashboard
        </motion.h1>

        <motion.div
          className="mb-5 relative"
          variants={itemVariants}
        >
          <Input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-3 w-full border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={24} />
        </motion.div>

        <motion.div
          className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg mb-5 bg-white"
          variants={itemVariants}
        >
          <div className="max-h-[23rem] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-lg">
                  <TableHead className="text-white text-center">Employee ID</TableHead>
                  <TableHead className="text-white text-center">Name</TableHead>
                  <TableHead className="text-white text-center">Total Calls</TableHead>
                  <TableHead className="text-white text-center">Total Call Length</TableHead>
                  <TableHead className="text-white text-center">Avg Call Length</TableHead>
                  <TableHead className="text-white text-center">Last Call Made</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredEmployees.map((employee) => (
                    <motion.tr
                      key={employee.id}
                      className={cn(
                        "cursor-pointer hover:bg-blue-50 transition-all text-gray-700 text-base"
                      )}
                      onClick={() => handleRowClick(employee.id)}
                      variants={itemVariants}
                    >
                      <TableCell className="text-center">{employee.id}</TableCell>
                      <TableCell className="text-center font-bold">{employee.name}</TableCell>
                      <TableCell className="text-center">{employee.totalCalls}</TableCell>
                      <TableCell className="text-center">{employee.totalCallLength} mins</TableCell>
                      <TableCell className="text-center">{employee.averageCallLength} mins</TableCell>
                      <TableCell className="text-center">{employee.lastCallMade}</TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          {[
            { title: 'Total Calls', value: '1,450', change: '+12% from last month', icon: PhoneCall },
            { title: 'Total Hours', value: '885', change: '+8% from last month', icon: Clock },
            { title: 'Active Agents', value: '24', change: 'Currently online', icon: Users },
            { title: 'Avg Satisfaction', value: '4.5', change: '+0.3 this month', icon: UserCheck }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                  <stat.icon className="text-blue-300" size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-blue-200">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="col-span-1"
          >
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Call Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={callVolData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="calls" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="hours" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="satisfaction" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-1"
          >
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Employee Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employees}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalCalls" fill="#8884d8" />
                      <Bar dataKey="totalCallLength" fill="#82ca9d" />
                      <Line
                        type="monotone"
                        dataKey="trendline"
                        data={trendlineData}
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={false}
                        name="Trend"
                      />
                    </BarChart> 
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}