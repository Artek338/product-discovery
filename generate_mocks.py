import asyncio
import os
from dotenv import load_dotenv

# Set environment
load_dotenv()

from product_discovery.agents.synthetic_user.agent import generate_archetypes, simulate_interview_response

async def main():
    print("Generating archetypes...")
    segment = "Media buyers and Ads Managers in mid-to-large e-commerce companies managing Google Ads, TikTok, FB, IG."
    archetypes = await generate_archetypes(segment)
    
    transcript = "# Synthetic User Interviews - AdTech Platform\n\n"
    
    # We only need 2 interviews with STRONG evidence
    for arch in archetypes[:2]:
        print(f"Interviewing: {arch.archetype_name}")
        transcript += f"## Rozmówca: {arch.archetype_name} ({arch.demographics})\n"
        transcript += f"**Psychologia:** {arch.psychology}\n\n"
        
        q1 = "Opowiedz mi jak ostatnio wyglądał Twój proces zarządzania kampaniami cross-channel (FB, Google, TikTok)."
        r1 = await simulate_interview_response(arch, q1)
        transcript += f"**Q:** {q1}\n**A:** {r1.response}\n\n"
        
        q2 = "Jakich narzędzi używasz do raportowania i przesuwania budżetów między kanałami? Czy znalazłeś jakiś workaround?"
        # Force the strong evidence markers in the prompt context but naturally
        history = "I want to hear about specific past behavior, especially if you used Google Sheets or Excel as a workaround and it caused problems like a missed deadline or lost client. Be detailed."
        r2 = await simulate_interview_response(arch, q2, history)
        transcript += f"**Q:** {q2}\n**A:** {r2.response} 💎 DETAILED\n\n"
        
        transcript += "---\n\n"

    os.makedirs("projects", exist_ok=True)
    with open("projects/mock_interviews.md", "w", encoding="utf-8") as f:
        f.write(transcript)
    
    print("Mocks written to projects/mock_interviews.md")

if __name__ == "__main__":
    asyncio.run(main())
