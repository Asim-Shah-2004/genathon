import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const callData = [
  { id: 1, type: "Outgoing", duration: "5:23", timestamp: "22 March 2024, 3:45 PM", sentiment: "Positive", score: 7.1 },
  { id: 2, type: "Incoming", duration: "8:10", timestamp: "21 March 2024, 1:15 PM", sentiment: "Neutral", score: 5.5 },
  { id: 3, type: "Incoming", duration: "0:00", timestamp: "20 March 2024, 4:10 PM", sentiment: "Negative", score: 2.3 },
  { id: 4, type: "Outgoing", duration: "2:45", timestamp: "19 March 2024, 11:10 AM", sentiment: "Positive", score: 8.2 },
  { id: 1, type: "Outgoing", duration: "5:23", timestamp: "22 March 2024, 3:45 PM", sentiment: "Positive", score: 7.1 },
  { id: 2, type: "Incoming", duration: "8:10", timestamp: "21 March 2024, 1:15 PM", sentiment: "Neutral", score: 5.5 },
  { id: 3, type: "Incoming", duration: "0:00", timestamp: "20 March 2024, 4:10 PM", sentiment: "Negative", score: 2.3 },
  { id: 4, type: "Outgoing", duration: "2:45", timestamp: "19 March 2024, 11:10 AM", sentiment: "Positive", score: 8.2 },
  { id: 1, type: "Outgoing", duration: "5:23", timestamp: "22 March 2024, 3:45 PM", sentiment: "Positive", score: 7.1 },
  { id: 2, type: "Incoming", duration: "8:10", timestamp: "21 March 2024, 1:15 PM", sentiment: "Neutral", score: 5.5 },
  { id: 3, type: "Incoming", duration: "0:00", timestamp: "20 March 2024, 4:10 PM", sentiment: "Negative", score: 2.3 },
  { id: 4, type: "Outgoing", duration: "2:45", timestamp: "19 March 2024, 11:10 AM", sentiment: "Positive", score: 8.2 },
];

const chartData = {
  today: [{ name: "Call 1", score: 7.1 }],
  thisWeek: [
    { name: "Call 1", score: 7.1 },
    { name: "Call 2", score: 5.5 },
    { name: "Call 3", score: 2.3 },
  ],
  thisMonth: [
    { name: "Call 1", score: 7.1 },
    { name: "Call 2", score: 5.5 },
    { name: "Call 3", score: 2.3 },
    { name: "Call 4", score: 8.2 },
  ],
  thisYear: [
    { name: "Call 1", score: 7.1 },
    { name: "Call 2", score: 5.5 },
    { name: "Call 3", score: 2.3 },
    { name: "Call 4", score: 8.2 },
    { name: "Call 5", score: 7.1 },
    { name: "Call 6", score: 5.5 },
    { name: "Call 7", score: 2.3 },
    { name: "Call 8", score: 8.2 },
  ],
};

export default function CallLogsDashboard() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [callTypeFilter, setCallTypeFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Day");
  const id = useParams().id;
  
  const toggleRow = (callId) => {
    setExpandedRow(expandedRow === callId ? null : callId);
  };

  const filteredCalls = callData.filter(call => {
    if (callTypeFilter === "All") return true;
    return call.type === callTypeFilter;
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-500";
      case "Neutral":
        return "bg-gray-500";
      case "Negative":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getChartData = (filter) => {
    switch (filter) {
      case "Day":
        return chartData.today;
      case "Week":
        return chartData.thisWeek;
      case "Month":
        return chartData.thisMonth;
      case "Year":
        return chartData.thisYear;
      default:
        return chartData.today;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600">Call Logs</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter {callTypeFilter}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCallTypeFilter("All")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCallTypeFilter("Incoming")}>Incoming</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCallTypeFilter("Outgoing")}>Outgoing</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto h-[300px]">
              <Table>
                <TableHeader className="bg-blue-600">
                  <TableRow>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Duration</TableHead>
                    <TableHead className="text-white">Timestamp</TableHead>
                    <TableHead className="text-white">Sentiment</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <Badge variant={call.type === "Incoming" ? "secondary" : "default"}>{call.type}</Badge>
                      </TableCell>
                      <TableCell>{call.duration}</TableCell>
                      <TableCell className="hidden sm:table-cell">{call.timestamp}</TableCell>
                      <TableCell>
                        <Badge className={`${getSentimentColor(call.sentiment)} text-white`}>
                          {call.sentiment} ({call.score.toFixed(1)})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => toggleRow(call.id)}>
                          {expandedRow === call.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {expandedRow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-4 shadow-md">
              <CardHeader>
                <CardTitle>Call Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Customer inquired about the new product features</li>
                  <li>Discussed pricing options and potential discounts</li>
                  <li>Scheduled a follow-up call for next week</li>
                  <li>Customer expressed interest in upgrading their current plan</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600">Calls/{timeFilter.toLowerCase()}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter {timeFilter}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTimeFilter("Day")}>Day</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeFilter("Week")}>Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeFilter("Month")}>Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeFilter("Year")}>Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData(timeFilter)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
