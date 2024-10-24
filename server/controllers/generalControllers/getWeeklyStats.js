import { Call } from "../../models/index.js";

const getCallStatsForPastWeek = async (req, res) => {
  try {
    // Get current date and subtract 7 days to get the start of the week
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    // Array to store statistics for each day
    const statsPerDay = [];

    for (let i = 0; i < 7; i++) {
      const startOfDay = new Date(oneWeekAgo);
      startOfDay.setDate(oneWeekAgo.getDate() + i);
      startOfDay.setHours(0, 0, 0, 0); // Start of the day

      const endOfDay = new Date(oneWeekAgo);
      endOfDay.setDate(oneWeekAgo.getDate() + i);
      endOfDay.setHours(23, 59, 59, 999); // End of the day

      // Get total number of calls for the day
      const totalCalls = await Call.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      // Get average satisfaction for the day
      const satisfactionData = await Call.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
        { $group: { _id: null, avgSatisfaction: { $avg: "$satisfaction" } } }
      ]);

      const avgSatisfaction = satisfactionData.length ? satisfactionData[0].avgSatisfaction.toFixed(2) : 0;

      // Get total call length (in hours) for the day
      const callLengthData = await Call.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
        { $group: { _id: null, totalLength: { $sum: "$length" } } }
      ]);

      const totalHours = callLengthData.length ? (callLengthData[0].totalLength / 3600).toFixed(2) : 0;

      // Store the stats for the day
      statsPerDay.push({
        date: startOfDay.toISOString().split('T')[0], // Format the date as YYYY-MM-DD
        totalCalls,
        avgSatisfaction,
        totalHours
      });
    }

    // Send the response
    res.status(200).json({
      statsPerDay
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default getCallStatsForPastWeek;
