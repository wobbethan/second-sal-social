"use server";

import OpenAI from "openai";
import { DividendData } from "@/types/finnhub";
import { calculateDividendTrend } from "@/utils/dividend-prediction";

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
  .map(
    (d) =>
      `PayDate: ${d.payDate}, ExDate: ${d.date}, Amount: $${d.amount}, freq: ${d.freq}`
  )
  .join("\n")}

Analyze the dividend payment history focusing on:
1. The freq field of the json data. This will help you to identify the payment frequency. here is a key for the freq values:
  freq = 0: Annually
  freq = 1: Monthly
  freq = 2: Quarterly
  freq = 3: Semi-annually
  freq = 4: Other/Unknown
  freq = 5: Bimonthly
  freq = 6: Trimesterly
  freq = 7: Weekly 
2. The exact number of days between each ExDate and its PayDate
3. Recent trends in dividend amounts

For the next dividend prediction:
1. First determine the next PayDate by:
   - Using the freq value to determine the payment cycle
   - Adding the appropriate duration based on the freq value
   - Maintaining the same day-of-month pattern

2. Then calculate the ExDate by:
   - Measuring the exact number of days between PayDate and ExDate in recent history
   - Subtracting that same number of days from the predicted PayDate
   - No need to adjust for business days, maintain the exact gap

Return ONLY a JSON object for the next predicted dividend in this format:
{
  "payDate": "YYYY-MM-DD",   // Next payment date based on freq value
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
    // If the question is about future dividends, use predictNextDividend
    const futureDividendKeywords = [
      "next dividend",
      "future dividend",
      "upcoming dividend",
      "predict",
      "when will",
    ];
    const isAskingAboutFuture = futureDividendKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword)
    );

    if (isAskingAboutFuture) {
      const predictions = await predictNextDividend(dividendHistory);
      const nextDividend = predictions[0]; // Get the predicted dividend

      return {
        analysis: `The next dividend is predicted to be $${nextDividend.amount} with an ex-dividend date of ${nextDividend.date} and payment date of ${nextDividend.payDate}.`,
        predictions: predictions,
      };
    }

    // For other questions, use the existing OpenAI analysis
    const systemPrompt = `You are a dividend analysis expert. Keep responses brief and focused.

When analyzing or predicting:
1. Limit explanations to 4-5 short sentences
2. For predictions, include dates and amounts in a clear format
3. Focus on key information:
   - Payment dates
   - Amount changes
   - Notable patterns
4. Format predictions as:
   {
     "payDate": "YYYY-MM-DD",
     "date": "YYYY-MM-DD",
     "amount": XX.XX,
     "symbol": "${ticker}",
     "recordDate": "YYYY-MM-DD",
     "currency": "USD",
     "adjustedAmount": XX.XX
   }

Current stock price: $${currentPrice}`;

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

export async function getDividendData(symbol: string) {
  try {
    const response = await finnhubClient.stockDividends(symbol);

    if (!response || response.length === 0) {
      return {
        dividends: [],
        prediction: null,
      };
    }

    // Format historical dividends for prediction
    const dividendHistory = response.map((dividend: DividendData) => ({
      date: dividend.date,
      amount: dividend.amount,
    }));

    // Calculate dividend trend and prediction
    const { prediction, trend, confidence } =
      calculateDividendTrend(dividendHistory);

    // Format the response
    const formattedDividends = response.map((dividend: DividendData) => ({
      ...dividend,
      date: new Date(dividend.date).toISOString(),
    }));

    return {
      dividends: formattedDividends,
      prediction: {
        amount: prediction,
        trend,
        confidence,
        message: `Next dividend predicted to be $${prediction} (${(
          confidence * 100
        ).toFixed(1)}% confidence)`,
      },
    };
  } catch (error) {
    console.error("Error fetching dividend data:", error);
    throw new Error("Failed to fetch dividend data");
  }
}
