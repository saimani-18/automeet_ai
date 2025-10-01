# backend/interactive_tester.py
import requests
import json
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

BASE_URL = "http://localhost:5000/api/ai"

def test_single_query(query):
    """Test a single query and show detailed results"""
    payload = {"query": query, "top_k": 5}
    
    try:
        response = requests.post(f"{BASE_URL}/query", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"\n{'='*80}")
            print(f"🔍 QUERY: {query}")
            print(f"{'='*80}")
            
            # Show answer
            print(f"📝 ANSWER:")
            print(result.get('answer', 'No answer'))
            
            # Show context usage
            context_used = result.get('context_used', True)
            print(f"\n🔮 CONTEXT: {'📚 Used meeting context' if context_used else '🧠 Used general knowledge'}")
            
            # Show sources
            sources = result.get('sources', [])
            if sources:
                print(f"\n📚 SOURCES ({len(sources)} found):")
                for i, source in enumerate(sources):
                    metadata = source.get('metadata', {})
                    print(f"   {i+1}. Meeting {metadata.get('meeting_id')}, Chunk {metadata.get('chunk_index')}")
                    print(f"      Score: {source.get('score', 0):.4f}")
                    snippet = metadata.get('text_snippet', '')[:100]
                    if snippet:
                        print(f"      Text: {snippet}...")
            else:
                print(f"\n📚 SOURCES: No relevant meeting context found")
                
            return True
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def interactive_mode():
    """Interactive command-line tester"""
    print("🤖 AutoMeet RAG Interactive Tester")
    print("="*50)
    print("Type your questions about meetings, projects, or anything else!")
    print("Type 'quit' or 'exit' to stop")
    print("Type 'sample' for sample questions")
    print("="*50)
    
    sample_questions = [
        "What are the action items from the Q3 planning meeting?",
        "What is Sarah responsible for?",
        "How much budget is needed for marketing?",
        "What are good meeting facilitation techniques?",
        "Tell me about agile project management",
        "What was discussed about customer satisfaction?",
        "When is the next follow-up meeting?",
        "What are the sales targets for Q3?"
    ]
    
    while True:
        try:
            query = input("\n💬 Your question: ").strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
                
            elif query.lower() == 'sample':
                print("\n📋 Sample questions:")
                for i, q in enumerate(sample_questions, 1):
                    print(f"   {i}. {q}")
                print("   (Type the number or copy the question)")
                continue
                
            elif query.isdigit() and 1 <= int(query) <= len(sample_questions):
                query = sample_questions[int(query) - 1]
                print(f"🔍 Using: {query}")
                
            if query:
                test_single_query(query)
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    # Test if server is running
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running!")
            interactive_mode()
        else:
            print("❌ Server returned error. Make sure Flask app is running on port 5000")
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the Flask app first:")
        print("   cd backend && python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")