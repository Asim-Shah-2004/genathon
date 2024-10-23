import { Call } from "../../models/index.js"; // Adjust the import path as necessary

const getCallStats = async (req, res) => {
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const startOfNextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  
  try {
    // Get total number of calls for all time
    const totalCalls = await Call.countDocuments();

    // Get total number of calls for the current month
    const currentMonthCalls = await Call.countDocuments({ 
      createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth } 
    });

    // Get total number of calls for the last month
    const lastMonthCalls = await Call.countDocuments({ 
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } 
    });

    // Calculate percentage increase from last month to current month
    const percentageIncrease = lastMonthCalls 
      ? ((currentMonthCalls - lastMonthCalls) / lastMonthCalls) * 100 
      : currentMonthCalls > 0 ? 100 : 0;

    // Send the response
    res.status(200).json({
      totalCalls,
      percentageIncrease,
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getCallStats;
