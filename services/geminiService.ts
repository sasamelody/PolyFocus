import { GoogleGenAI } from "@google/genai";
import { TimeLog } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTimeLogs = async (logs: TimeLog[]): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "错误：缺少 API Key。请检查您的配置。";

  if (logs.length === 0) return "暂无记录可供分析。请先完成几个番茄钟。";

  // Format logs for the prompt
  const logSummary = logs.map(log => ({
    type: log.mode === 'WORK' ? '工作' : '休息',
    duration: Math.round(log.durationSeconds / 60) + " 分钟",
    tags: log.tags.join(", "),
    time: new Date(log.endTime).toLocaleTimeString('zh-CN')
  }));

  const prompt = `
    你是一位精通柳比歇夫时间统计法的专家。
    以下是我近期的具体时间记录数据：
    ${JSON.stringify(logSummary, null, 2)}

    请根据柳比歇夫的方法，用中文为我分析这些数据：
    1. 计算“基本时间”（创造性/深度工作）与“标准时间”（例行/休息）的效率对比。
    2. 根据标签识别我的时间花费模式或存在的干扰项。
    3. 给出3条简短、严格且可执行的建议，帮助我提高时间利用率。
    
    请保持回答简洁，并使用 Markdown 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "无法生成分析结果。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "分析日志失败，请稍后再试。";
  }
};