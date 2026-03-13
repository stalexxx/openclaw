// Простой тест для проверки Z.AI web search provider auto-detection
import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function testZaiAutoDetection() {
  const { __testing } = require("./src/agents/tools/web-search.ts");
  const { resolveSearchProvider } = __testing;

  console.log("🧪 Тестирование Z.AI auto-detection...\n");

  // Тест 1: ZAI_API_KEY должна auto-detect как zai
  console.log("Тест 1: Auto-detection Z.AI из ZAI_API_KEY");
  process.env.ZAI_API_KEY = "test-zai-key";
  const provider1 = resolveSearchProvider({});
  console.log("   Результат:", provider1);
  console.log(provider1 === "zai" ? "   ✅ PASS" : "   ❌ FAIL");
  console.log();

  // Тест 2: Когда только ZAI_API_KEY, должен вернуть zai
  console.log("Тест 2: Только ZAI_API_KEY установлена");
  delete process.env.BRAVE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.XAI_API_KEY;
  delete process.env.KIMI_API_KEY;
  delete process.env.MOONSHOT_API_KEY;
  delete process.env.PERPLEXITY_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  process.env.ZAI_API_KEY = "test-zai-key";
  const provider2 = resolveSearchProvider({});
  console.log("   Результат:", provider2);
  console.log(provider2 === "zai" ? "   ✅ PASS" : "   ❌ FAIL");
  console.log();

  // Тест 3: Алфавитный порядок - brave должен выигрывать при наличии BRAVE_API_KEY
  console.log("Тест 3: Алфавитный порядок (brave > gemini > grok > kimi > perplexity > zai)");
  process.env.BRAVE_API_KEY = "test-brave-key";
  process.env.ZAI_API_KEY = "test-zai-key";
  process.env.GEMINI_API_KEY = "test-gemini-key";
  const provider3 = resolveSearchProvider({});
  console.log("   Результат:", provider3);
  console.log(provider3 === "brave" ? "   ✅ PASS" : "   ❌ FAIL");
  console.log();

  // Тест 4: zai должен выигрывать когда только zai и perplexity доступены
  console.log("Тест 4: Z.AI против Perplexity (алфавитный порядок: perplexity > zai)");
  delete process.env.BRAVE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.XAI_API_KEY;
  delete process.env.KIMI_API_KEY;
  delete process.env.MOONSHOT_API_KEY;
  process.env.ZAI_API_KEY = "test-zai-key";
  process.env.PERPLEXITY_API_KEY = "test-perplexity-key";
  const provider4 = resolveSearchProvider({});
  console.log("   Результат:", provider4);
  console.log(provider4 === "perplexity" ? "   ✅ PASS" : "   ❌ FAIL");
  console.log();

  // Тест 5: Явный provider всегда побеждает
  console.log('Тест 5: Явный provider="zai" должен вернуть zai независимо от ключей');
  const provider5 = resolveSearchProvider({ provider: "zai" });
  console.log("   Результат:", provider5);
  console.log(provider5 === "zai" ? "   ✅ PASS" : "   ❌ FAIL");
  console.log();

  console.log("📊 Все тесты завершены!");
}

testZaiAutoDetection().catch(console.error);
