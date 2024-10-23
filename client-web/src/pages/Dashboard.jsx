import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PhoneCall, 
  Clock, 
  Users, 
  Download, 
  Play,
  Filter,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  // Sample data - replace with real data from your backend
  const [callData] = useState([
    { date: '2024-01', calls: 450, hours: 280, avgDuration: 35 },
    { date: '2024-02', calls: 520, hours: 310, avgDuration: 38 },
    { date: '2024-03', calls: 480, hours: 295, avgDuration: 36 },
    { date: '2024-04', calls: 550, hours: 320, avgDuration: 37 },
    { date: '2024-05', calls: 600, hours: 350, avgDuration: 40 },
    { date: '2024-06', calls: 580, hours: 345, avgDuration: 39 },
    { date: '2024-07', calls: 490, hours: 300, avgDuration: 34 },
    { date: '2024-08', calls: 510, hours: 310, avgDuration: 35 },
    { date: '2024-09', calls: 570, hours: 330, avgDuration: 36 },
    { date: '2024-10', calls: 640, hours: 360, avgDuration: 38 },
    { date: '2024-11', calls: 530, hours: 320, avgDuration: 37 },
    { date: '2024-12', calls: 600, hours: 340, avgDuration: 39 },
    { date: '2025-01', calls: 620, hours: 350, avgDuration: 41 }
  ]);

  const [callLogs] = useState([
    { id: 1, agent: "John Doe", type: "Incoming", duration: "15:23", date: "2024-03-23", recording: "call1.mp3" },
    { id: 2, agent: "Jane Smith", type: "Outgoing", duration: "08:45", date: "2024-03-23", recording: "call2.mp3" },
    { id: 3, agent: "Mike Johnson", type: "Incoming", duration: "12:10", date: "2024-03-22", recording: "call3.mp3" },
  
      { id: 4, agent: "Alice Brown", type: "Incoming", duration: "10:15", date: "2024-03-24", recording: "call4.mp3" },
      { id: 5, agent: "Tom Wilson", type: "Outgoing", duration: "09:30", date: "2024-03-24", recording: "call5.mp3" },
      { id: 6, agent: "Emily Davis", type: "Incoming", duration: "07:45", date: "2024-03-23", recording: "call6.mp3" },
      { id: 7, agent: "David Martinez", type: "Outgoing", duration: "14:00", date: "2024-03-23", recording: "call7.mp3" },
      { id: 8, agent: "Sarah Johnson", type: "Incoming", duration: "11:50", date: "2024-03-22", recording: "call8.mp3" },
      { id: 9, agent: "Chris Lee", type: "Outgoing", duration: "06:30", date: "2024-03-21", recording: "call9.mp3" },
      { id: 10, agent: "Jessica White", type: "Incoming", duration: "13:05", date: "2024-03-20", recording: "call10.mp3" },
      { id: 11, agent: "Daniel Green", type: "Outgoing", duration: "15:45", date: "2024-03-20", recording: "call11.mp3" },
      { id: 12, agent: "Laura Adams", type: "Incoming", duration: "09:20", date: "2024-03-19", recording: "call12.mp3" },
      { id: 13, agent: "James Taylor", type: "Outgoing", duration: "12:55", date: "2024-03-19", recording: "call13.mp3" },
      { id: 14, agent: "Anna Thomas", type: "Incoming", duration: "08:10", date: "2024-03-18", recording: "call14.mp3" },
      { id: 15, agent: "Mark Lewis", type: "Outgoing", duration: "11:35", date: "2024-03-18", recording: "call15.mp3" },
      { id: 16, agent: "Karen Walker", type: "Incoming", duration: "14:20", date: "2024-03-17", recording: "call16.mp3" },
      { id: 17, agent: "Steven Hall", type: "Outgoing", duration: "10:00", date: "2024-03-17", recording: "call17.mp3" },
      { id: 18, agent: "Michelle Allen", type: "Incoming", duration: "13:30", date: "2024-03-16", recording: "call18.mp3" },
      { id: 19, agent: "Robert Young", type: "Outgoing", duration: "05:50", date: "2024-03-16", recording: "call19.mp3" },
      { id: 20, agent: "Patricia Hernandez", type: "Incoming", duration: "12:40", date: "2024-03-15", recording: "call20.mp3" },
      { id: 21, agent: "Paul King", type: "Outgoing", duration: "09:15", date: "2024-03-15", recording: "call21.mp3" },
      { id: 22, agent: "Susan Wright", type: "Incoming", duration: "11:05", date: "2024-03-14", recording: "call22.mp3" },
      { id: 23, agent: "Kevin Scott", type: "Outgoing", duration: "14:35", date: "2024-03-14", recording: "call23.mp3" },
      { id: 24, agent: "Nancy Green", type: "Incoming", duration: "10:50", date: "2024-03-13", recording: "call24.mp3" },
      { id: 25, agent: "Charles Nelson", type: "Outgoing", duration: "12:05", date: "2024-03-13", recording: "call25.mp3" },
      { id: 26, agent: "Linda Carter", type: "Incoming", duration: "09:40", date: "2024-03-12", recording: "call26.mp3" },
      { id: 27, agent: "Edward Mitchell", type: "Outgoing", duration: "13:25", date: "2024-03-12", recording: "call27.mp3" },
      { id: 28, agent: "Barbara Perez", type: "Incoming", duration: "11:15", date: "2024-03-11", recording: "call28.mp3" },
      { id: 29, agent: "George Roberts", type: "Outgoing", duration: "07:05", date: "2024-03-11", recording: "call29.mp3" },
      { id: 30, agent: "Rebecca Turner", type: "Incoming", duration: "14:10", date: "2024-03-10", recording: "call30.mp3" },
  
  ]);

  return (
    <div className="min-h-screen bg-background text-text p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Call Center Dashboard</h1>
        <p className="text-text/80">Real-time monitoring and analysis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Calls</CardTitle>
            <PhoneCall className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,450</div>
            <p className="text-sm text-text/70">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total Hours</CardTitle>
            <Clock className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">885</div>
            <p className="text-sm text-text/70">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Active Agents</CardTitle>
            <Users className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-text/70">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Call Volume Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={callData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calls" stroke="#8884d8" />
                <Line type="monotone" dataKey="hours" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Call Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Call Logs</CardTitle>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-secondary rounded-lg">
              <Filter size={20} />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg">
              <Calendar size={20} />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg">
              <Download size={20} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary">
                  <th className="text-left p-4">Agent</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Duration</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {callLogs.map((log) => (
                  <tr key={log.id} className="border-b border-secondary">
                    <td className="p-4">{log.agent}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        log.type === "Incoming" ? "bg-primary/20" : "bg-accent/20"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4">{log.duration}</td>
                    <td className="p-4">{log.date}</td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-secondary rounded-lg">
                        <Play size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;