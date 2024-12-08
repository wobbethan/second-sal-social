"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DividendData {
  date: string;
  amount: number;
  timeline?: "most recent" | "predicted";
}

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
${sortedData.map((d) => `Date: ${d.date}, Amount: $${d.amount}`).join("\n")}

analyze the data to identify patterns in the dividend payout schedule and amounts. Consider factors such as the frequency of payouts (e.g., quarterly, semi-annually, annually), specific dates within each period, and any trends or consistencies in the payout amounts. Use these insights to predict the next dividend date and amount, ensuring your prediction aligns with the identified historical patterns and rationalizing the consistency or deviation based on the observed data. Do not include any explanatory text in your response; return only a JSON object in this exact format: {"date": "YYYY-MM-DD", "amount": X.XX}.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    // Parse the response
    const prediction = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Validate the prediction
    if (!prediction.date || !prediction.amount) {
      throw new Error("Invalid prediction format received");
    }

    // Create new dividend data array with updated timeline fields
    const newDividendData = [
      {
        date: prediction.date,
        amount: prediction.amount,
        timeline: "predicted" as const,
      },
      ...sortedData.map((dividend, index) => ({
        ...dividend,
        timeline: index === 0 ? ("most recent" as const) : undefined,
      })),
    ];

    return newDividendData;
  } catch (error) {
    console.error("Error predicting next dividend:", error);
    throw error;
  }
}
