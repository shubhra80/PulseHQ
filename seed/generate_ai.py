import os
import json
import anthropic
from dotenv import load_dotenv
from _supabase_client import get_client as get_supabase
from datetime import date

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
supabase = get_supabase()

def generate_client_insight(client_data):
    prompt = f"""You are a B2B SaaS customer success analyst. 
    
Client: {client_data['name']}
Industry: {client_data['industry']}
Health Score: {client_data['health_score']}/100
Health Status: {client_data['health_status']}
Usage Breadth Score: {client_data['usage_breadth_score']}/100
Usage Depth Score: {client_data['usage_depth_score']}/100
User Reach Score: {client_data['user_reach_score']}/100

Write a 2-3 sentence insight about this client's health and a 1 sentence recommended action for the CS team.
Format as JSON: {{"insight": "...", "recommendation": "..."}}
Be specific and actionable. No generic statements."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

def generate_strategy_memo(clients):
    healthy = len([c for c in clients if c['health_status'] == 'healthy'])
    at_risk = len([c for c in clients if c['health_status'] == 'at_risk'])
    watch = len([c for c in clients if c['health_status'] == 'watch'])
    avg_health = sum(c['health_score'] for c in clients) / len(clients)
    
    prompt = f"""You are a VP of Customer Success writing a weekly strategy memo.

Portfolio Summary:
- Total Clients: {len(clients)}
- Healthy: {healthy} ({healthy/len(clients)*100:.0f}%)
- At Risk: {at_risk} ({at_risk/len(clients)*100:.0f}%)
- Watch: {watch} ({watch/len(clients)*100:.0f}%)
- Average Health Score: {avg_health:.1f}/100

Write a professional weekly strategy memo with these sections:
1. Executive Summary (2-3 sentences)
2. Portfolio Health Overview (3-4 sentences)
3. Key Risks (3 bullet points)
4. Adoption Opportunities (3 bullet points)
5. Recommended Priorities (3 bullet points)

Format as JSON with keys: executive_summary, portfolio_health, key_risks, adoption_opportunities, recommended_priorities
Each section should be a string. Bullet points separated by |"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

def main():
    print("Fetching clients from Supabase...")
    response = supabase.table("clients").select("*").execute()
    clients = response.data
    print(f"Found {len(clients)} clients")
    
    print("\nGenerating AI insights for each client...")
    for i, c in enumerate(clients):
        print(f"  Processing {i+1}/{len(clients)}: {c['name']}")
        try:
            result = generate_client_insight(c)
            supabase.table("clients").update({
                "ai_insight": result["insight"],
                "ai_recommendation": result["recommendation"]
            }).eq("id", c["id"]).execute()
        except Exception as e:
            print(f"    Error: {e}")
            continue
    
    print("\nGenerating weekly strategy memo...")
    try:
        memo = generate_strategy_memo(clients)
        supabase.table("strategy_memos").insert({
            "memo_date": str(date.today()),
            "executive_summary": memo["executive_summary"],
            "portfolio_health_section": memo["portfolio_health"],
            "key_risks_section": memo["key_risks"],
            "adoption_opportunities_section": memo["adoption_opportunities"],
            "recommended_priorities_section": memo["recommended_priorities"],
        }).execute()
        print("Strategy memo generated successfully!")
    except Exception as e:
        print(f"Error generating memo: {e}")
    
    print("\nAll AI content generated successfully!")

if __name__ == "__main__":
    main()