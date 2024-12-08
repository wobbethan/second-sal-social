"use server";

import OpenAI from "openai";
import { DividendData } from "@/types/finnhub";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function predictNextDividend(
  dividendData: DividendData[]
): Promise<DividendData[]> {
  try {
    // Sort data by date in descending order
    const sortedData = [...dividendData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Prepare the prompt for OpenAI
    const prompt = `Given the following dividend history (from most recent):
${sortedData
  .map((d) => `PayDate: ${d.payDate}, ExDate: ${d.date}, Amount: $${d.amount}`)
  .join("\n")}

Analyze the dividend payment history focusing on:
1. The quarterly/monthly pattern of PayDates (primary pattern)
2. The fixed duration between PayDates (typically 90 days for quarterly)
3. The exact number of days between each ExDate and its PayDate
4. Recent trends in dividend amounts

For the next dividend prediction:
1. First determine the next PayDate by:
   - Identifying the quarterly/monthly cycle
   - Adding the fixed duration to the most recent PayDate
   - Maintaining the same day-of-month pattern

2. Then calculate the ExDate by:
   - Measuring the exact number of days between PayDate and ExDate in recent history
   - Subtracting that same number of days from the predicted PayDate
   - No need to adjust for business days, maintain the exact gap

Return ONLY a JSON object for the next predicted dividend in this format:
{
  "payDate": "YYYY-MM-DD",   // Next payment date based on quarterly cycle
  "date": "YYYY-MM-DD",      // ExDate, using exact historical gap from PayDate
  "amount": XX.XX            // Predicted amount based on recent trends
}

Do not include any explanatory text.`;

    // Get prediction from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    // Parse the prediction
    const prediction = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Validate the prediction
    if (!prediction.date || !prediction.amount) {
      throw new Error("Invalid prediction format received");
    }

    // Create the predicted dividend entry
    const predictedDividend: DividendData = {
      symbol: sortedData[0].symbol,
      date: prediction.date,
      amount: prediction.amount,
      payDate: prediction.payDate,
      recordDate: prediction.date,
      currency: "USD",
      adjustedAmount: prediction.amount,
      timeline: "predicted",
    };

    // Return prediction + original data unchanged
    return [predictedDividend, ...dividendData];
  } catch (error) {
    console.error("Error predicting next dividend:", error);
    throw error;
  }
}

// Helper function to determine payment frequency
function getFrequency(dividends: DividendData[]): string {
  if (dividends.length < 2) return "Unknown";

  const dates = dividends.map((d) => new Date(d.date).getTime());
  const intervals = dates
    .slice(0, -1)
    .map((date, i) =>
      Math.round((date - dates[i + 1]) / (24 * 60 * 60 * 1000))
    );

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  if (avgInterval <= 32) return "Monthly";
  if (avgInterval <= 95) return "Quarterly";
  if (avgInterval <= 185) return "Semi-annually";
  return "Annually";
}

export async function analyzeDividends(
  question: string,
  dividendHistory: DividendData[],
  ticker: string,
  currentPrice: number
) {
  try {
    const systemPrompt = `You are a dividend analysis expert. You have access to historical dividend data for ${ticker}. 
    When predictions are needed, use the historical pattern to predict future dividends.
    If calculations involve share quantities or investment amounts, show your work clearly.
    Current stock price: $${currentPrice}
    
    Rules:
    1. If asked about future dividends, analyze the pattern and make predictions
    2. For investment calculations, use the most recent dividend amount as reference
    3. Always explain your reasoning
    4. If predictions are made, format them as JSON within your response
    5. Keep responses concise but informative`;

    const formattedDividends = dividendHistory.map((d) => ({
      date: d.payDate,
      amount: d.amount,
      exDate: d.date,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Historical dividend data: ${JSON.stringify(
            formattedDividends
          )}\n\nQuestion: ${question}`,
        },
      ],
      functions: [
        {
          name: "updateDividendPredictions",
          description: "Update the dividend timeline with new predictions",
          parameters: {
            type: "object",
            properties: {
              predictions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    payDate: { type: "string" },
                    amount: { type: "number" },
                    date: { type: "string" },
                    recordDate: { type: "string" },
                    currency: { type: "string" },
                    adjustedAmount: { type: "number" },
                    symbol: { type: "string" },
                  },
                },
              },
            },
            required: ["predictions"],
          },
        },
      ],
      function_call: "auto",
    });

    const responseMessage = response.choices[0].message;
    let newPredictions: DividendData[] = [];

    if (responseMessage.function_call?.name === "updateDividendPredictions") {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      newPredictions = functionArgs.predictions;
    }

    return {
      analysis: responseMessage.content,
      predictions: newPredictions,
    };
  } catch (error) {
    console.error("Error analyzing dividends:", error);
    throw error;
  }
}
