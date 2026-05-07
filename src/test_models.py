import asyncio
import os
from dotenv import load_dotenv
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider
from pydantic_ai import Agent

async def test():
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("No API key")
        return
    
    models_to_test = [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20240620",
        "claude-3-5-sonnet-latest",
        "claude-3-sonnet-20240229",
        "claude-sonnet-4-6"  # The one that was in the code
    ]
    
    for m in models_to_test:
        print(f"Testing {m}...")
        model = AnthropicModel(m, provider=AnthropicProvider(api_key=api_key))
        agent = Agent(model)
        try:
            result = await agent.run("Reply with OK")
            print(f"✅ {m} SUCCESS")
            open("working_model.txt", "w").write(m)
        except Exception as e:
            print(f"❌ {m} FAILED: {type(e).__name__} - {e}")

if __name__ == "__main__":
    asyncio.run(test())
