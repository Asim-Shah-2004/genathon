import {Call} from "../../models/index.js"

// Controller function to get total call hours of all time and percentage increase from last month
const getTotalCallHoursAndIncrease = async (req, res) => {
  // Define the start dates of the current and last months
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  try {
    // 1. Aggregate the total call length (in seconds) for all time
    const totalCallLength = await Call.aggregate([
      {
        $group: {
          _id: null,
          totalLength: { $sum: "$length" } // Sum up the lengths of all calls
        }
      }
    ]);

    // Convert total length from seconds to hours
    const totalHours = totalCallLength.length > 0 ? totalCallLength[0].totalLength / 3600 : 0;

    // 2. Get the total call length for the current month
    const currentMonthCallLength = await Call.aggregate([
      {
        $match: { createdAt: { $gte: startOfCurrentMonth } }
      },
      {
        $group: {
          _id: null,
          totalLength: { $sum: "$length" }
        }
      }
    ]);

    const currentMonthHours = currentMonthCallLength.length > 0 ? currentMonthCallLength[0].totalLength / 3600 : 0;

    // 3. Get the total call length for the last month
    const lastMonthCallLength = await Call.aggregate([
      {
        $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } }
      },
      {
        $group: {
          _id: null,
          totalLength: { $sum: "$length" }
        }
      }
    ]);

    const lastMonthHours = lastMonthCallLength.length > 0 ? lastMonthCallLength[0].totalLength / 3600 : 0;

    // 4. Calculate the percentage increase or decrease from last month to this month
    const percentageIncrease = lastMonthHours
      ? ((currentMonthHours - lastMonthHours) / lastMonthHours) * 100
      : currentMonthHours > 0 ? 100 : 0;

    // Send the response
    res.status(200).json({
      totalHours: totalHours.toFixed(2),        // Total hours all time
      percentageIncrease: percentageIncrease.toFixed(2),  // Percent increase/decrease from last month
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getTotalCallHoursAndIncrease;
