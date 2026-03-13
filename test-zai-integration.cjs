// Простой тест для проверки Z.AI web search интеграции
// Запуск: node test-zai-integration.js

const https = require("https");

async function testZaiSearch() {
  const ZAI_API_KEY = process.env.ZAI_API_KEY;
  if (!ZAI_API_KEY) {
    console.error("❌ ZAI_API_KEY не установлена");
    console.log("Установите: export ZAI_API_KEY=your-key");
    process.exit(1);
  }

  const BASE_URL = "https://api.z.ai/api/paas/v4";
  const MODEL = "glm-4.7";

  console.log("🔍 Тестирование Z.AI web search...");
  console.log("   URL:", BASE_URL);
  console.log("   Model:", MODEL);
  console.log("   API Key:", ZAI_API_KEY.substring(0, 10) + "...");

  try {
    const payload = {
      model: MODEL,
      messages: [
        {
          role: "user",
          content: "Что такое OpenClaw?",
        },
      ],
      tools: [
        {
          type: "builtin_function",
          function: { name: "$web_search" },
        },
      ],
      stream: false,
    };

    await new Promise((resolve, reject) => {
      const req = https
        .request(
          `${BASE_URL}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ZAI_API_KEY}`,
            },
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              console.log("\n📡 Raw Response:", data.substring(0, 500));

              let result;
              try {
                result = JSON.parse(data);
              } catch (e) {
                console.error("\n❌ Ошибка парсинга JSON:", e.message);
                reject(e);
                return;
              }

              console.log("\n✅ Успешный запрос!");
              console.log("   Status:", res.statusCode);
              console.log("   Headers:", JSON.stringify(res.headers));

              if (res.statusCode !== 200) {
                console.error("\n❌ HTTP статус:", res.statusCode);
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
              }

              if (result.error) {
                console.error("\n❌ Ошибка API:", JSON.stringify(result.error));
                reject(new Error(result.error.message || "API Error"));
                return;
              }

              const choices = result.choices || [];
              const choice = choices[0];
              const message = choice?.message;

              console.log("\n📊 Ответ:");
              if (message?.content) {
                console.log("   Content:", message.content.substring(0, 200) + "...");
              }

              if (message?.tool_calls && message.tool_calls.length > 0) {
                console.log("\n🔧 Tool Calls:", message.tool_calls.length);
                message.tool_calls.forEach((call, i) => {
                  console.log(`   ${i + 1}. ${call.function?.name}`);
                  if (call.function?.arguments) {
                    const args = JSON.parse(call.function.arguments);
                    console.log(`      Args:`, JSON.stringify(args).substring(0, 150));
                  }
                });
              }

              if (result.search_results && result.search_results.length > 0) {
                console.log("\n🔗 Search Results:", result.search_results.length);
                result.search_results.slice(0, 3).forEach((result, i) => {
                  console.log(`   ${i + 1}. ${result.title || "No title"}`);
                  console.log(`      URL: ${result.url}`);
                });
              }
              resolve(result);
            });
          },
        )
        .on("error", (error) => {
          console.error("\n❌ Ошибка запроса:", error.message);
          reject(error);
        });

      req.write(JSON.stringify(payload));
      req.end();
    });
  } catch (error) {
    console.error("\n❌ Ошибка:", error.message);
    process.exit(1);
  }
}

void testZaiSearch();
