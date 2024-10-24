import { Call } from "../../models/index.js";

const getOverallAvgSatisfaction = async (req, res) => {
  try {
    // Use aggregation to calculate the overall average satisfaction
    const satisfactionData = await Call.aggregate([
      {
        $group: {
          _id: null, // Grouping by null to get a single result
          avgSatisfaction: { $avg: "$satisfaction" }
        }
      }
    ]);

    // If satisfactionData has results, extract the average satisfaction
    const overallAvgSatisfaction = satisfactionData.length ? satisfactionData[0].avgSatisfaction.toFixed(2) : 0;

    // Send the response
    res.status(200).json({
      overallAvgSatisfaction
    });
  } catch (error) {
    console.error('Error fetching overall average satisfaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getOverallAvgSatisfaction;
