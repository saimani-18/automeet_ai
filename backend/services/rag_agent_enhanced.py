# backend/services/rag_agent_enhanced.py
from services.embeddings import Embeddings
from services.vector_store import FaissVectorStore
from services.llm_client import generate
import os
import textwrap
import re

EMBEDDER = Embeddings()
VECTOR_STORE = FaissVectorStore(dim=EMBEDDER.model.get_sentence_embedding_dimension())
TOP_K = int(os.environ.get("TOP_K", 5))

# Enhanced system prompts
SYSTEM_PROMPT_CONTEXT_AWARE = """
You are MeetingAssist — an expert AI assistant for meetings, technical guidance, and decision support.

**CRITICAL ACCURACY RULES:**
1. ALWAYS verify facts against provided context
2. If uncertain, explicitly state limitations
3. Cite specific meeting references when available
4. Acknowledge when information is general knowledge vs specific context

**Response Types:**
- Meeting-specific: Use context with citations (meeting_id:chunk_index)
- Technical guidance: Provide step-by-step, verifiable information
- Decision support: Analyze pros/cons with reasoning
- General knowledge: Be truthful about scope

**Accuracy First:** Never hallucinate. If you don't know, say so.
"""

SYSTEM_PROMPT_TECHNICAL = """
You are an expert technical advisor with deep knowledge across:
- Software development (Flask, React, databases, APIs)
- System architecture and design patterns
- Development workflows and best practices
- Technical decision-making frameworks

**Response Guidelines:**
1. Provide actionable, step-by-step guidance
2. Include code examples where relevant
3. Explain trade-offs and considerations
4. Reference established best practices
5. Be precise and technically accurate
"""

SYSTEM_PROMPT_DECISION_ANALYSIS = """
You are a strategic decision analysis assistant. Your role is to:

1. Analyze current context and historical patterns
2. Identify key decision factors and trade-offs
3. Provide weighted recommendations with reasoning
4. Consider risks, opportunities, and alternatives
5. Reference relevant historical data when available

**Framework:**
- Problem definition
- Key factors analysis
- Options evaluation
- Recommendation with confidence level
- Implementation considerations
"""

def analyze_query_intent(query: str) -> dict:
    """
    Advanced query intent analysis with confidence scoring
    """
    query_lower = query.lower()
    intent_weights = {
        'technical_guidance': 0,
        'decision_support': 0,
        'meeting_specific': 0,
        'general_knowledge': 0,
        'hypothetical_scenario': 0
    }
    
    # Technical guidance triggers
    tech_triggers = [
        'how to', 'build', 'create', 'setup', 'configure', 'implement',
        'code', 'api', 'database', 'framework', 'architecture',
        'workflow', 'deploy', 'debug', 'fix', 'tech stack',
        'flask', 'react', 'python', 'javascript', 'sql', 'docker'
    ]
    
    # Decision support triggers
    decision_triggers = [
        'should i', 'what should', 'recommend', 'advice on',
        'decision', 'choose between', 'better option',
        'pros and cons', 'risks', 'opportunities',
        'strategy', 'planning', 'approach'
    ]
    
    # Hypothetical scenario triggers
    hypothetical_triggers = [
        'what if', 'suppose', 'scenario', 'hypothetical',
        'if we', 'assuming', 'consider if'
    ]
    
    # Meeting context triggers
    meeting_triggers = [
        'meeting', 'discussed', 'said', 'talked about',
        'action item', 'decision', 'follow up'
    ]
    
    # Score intents
    for trigger in tech_triggers:
        if trigger in query_lower:
            intent_weights['technical_guidance'] += 1
    
    for trigger in decision_triggers:
        if trigger in query_lower:
            intent_weights['decision_support'] += 1
            
    for trigger in hypothetical_triggers:
        if trigger in query_lower:
            intent_weights['hypothetical_scenario'] += 1
            
    for trigger in meeting_triggers:
        if trigger in query_lower:
            intent_weights['meeting_specific'] += 1
    
    # Default to general knowledge if no strong signals
    if sum(intent_weights.values()) == 0:
        intent_weights['general_knowledge'] = 1
    
    # FIXED: Use intent_weights.get as the key function
    primary_intent = max(intent_weights, key=intent_weights.get)
    confidence = intent_weights[primary_intent] / max(1, sum(intent_weights.values()))
    
    return {
        'primary_intent': primary_intent,
        'confidence': confidence,
        'all_weights': intent_weights
    }

def verify_answer_against_context(answer: str, retrieved_chunks: list, query: str) -> dict:
    """
    Enhanced verification system to ensure accuracy
    """
    verification_prompt = f"""
    QUERY: {query}
    
    PROPOSED ANSWER: {answer}
    
    AVAILABLE CONTEXT:
    {chr(10).join([chunk.get('metadata', {}).get('text_snippet', '')[:200] for chunk in retrieved_chunks[:3]])}
    
    VERIFICATION TASKS:
    1. Does the answer directly address the query?
    2. Are any factual claims supported by the context?
    3. Are there any unsupported assumptions or hallucinations?
    4. Is the answer technically accurate (if technical)?
    5. Are limitations properly acknowledged?
    
    Provide verification result as:
    - ACCURATE: Fully supported and appropriate
    - PARTIAL: Some parts need qualification
    - UNCERTAIN: Significant unsupported claims
    - INACCURATE: Contradicts context or facts
    """
    
    verification_result = generate(
        verification_prompt, 
        system_prompt="You are a strict fact-checker. Be brutally honest about accuracy.",
        max_tokens=300,
        temperature=0.1
    )
    
    return {
        'verification_result': verification_result,
        'needs_correction': 'INACCURATE' in verification_result or 'UNCERTAIN' in verification_result
    }

def build_technical_guidance_prompt(query: str, context_chunks: list = None):
    """Build prompt for technical guidance with accuracy checks"""
    
    context_block = "No specific technical context available."
    if context_chunks:
        context_texts = []
        for chunk in context_chunks:
            snippet = chunk.get('metadata', {}).get('text_snippet', '')[:300]
            if any(tech_term in snippet.lower() for tech_term in ['technical', 'code', 'system', 'develop', 'build']):
                context_texts.append(snippet)
        
        if context_texts:
            context_block = "\n\n".join(context_texts[:3])
    
    prompt = textwrap.dedent(f"""
    TECHNICAL QUERY: {query}
    
    AVAILABLE CONTEXT:
    {context_block}
    
    REQUIREMENTS:
    1. Provide step-by-step, actionable guidance
    2. Include specific examples or code snippets where relevant
    3. Explain the "why" behind recommendations
    4. Mention alternatives and trade-offs
    5. Highlight potential pitfalls and how to avoid them
    6. If context exists, reference it appropriately
    7. Acknowledge limitations or areas needing more information
    
    Focus on accuracy and practical implementation.
    """)
    
    return prompt

def build_decision_analysis_prompt(query: str, context_chunks: list):
    """Build prompt for decision support with historical context"""
    
    # Extract relevant decision context
    decision_contexts = []
    for chunk in context_chunks:
        snippet = chunk.get('metadata', {}).get('text_snippet', '')
        # Prioritize chunks with decision-related content
        if any(term in snippet.lower() for term in ['decide', 'choose', 'option', 'recommend', 'should', 'better']):
            decision_contexts.append(snippet)
    
    context_block = "\n\n---\n\n".join(decision_contexts[:5]) if decision_contexts else "No specific decision history available."
    
    prompt = textwrap.dedent(f"""
    DECISION QUERY: {query}
    
    HISTORICAL CONTEXT (Previous discussions/decisions):
    {context_block}
    
    ANALYTICAL FRAMEWORK:
    1. **Problem Definition**: Clearly state the decision to be made
    2. **Key Factors**: Identify critical decision criteria
    3. **Options Analysis**: Evaluate available choices
    4. **Risk Assessment**: Identify potential risks and mitigations
    5. **Recommendation**: Provide clear, reasoned recommendation
    6. **Confidence Level**: Indicate confidence based on available information
    
    Base your analysis on available context where possible.
    Acknowledge information gaps explicitly.
    """)
    
    return prompt

def build_hypothetical_analysis_prompt(query: str, context_chunks: list = None):
    """Build prompt for hypothetical scenario analysis"""
    
    context_block = "No specific context for this hypothetical scenario."
    if context_chunks:
        relevant_context = [chunk.get('metadata', {}).get('text_snippet', '')[:200] 
                          for chunk in context_chunks[:3]]
        context_block = "\n\n".join(relevant_context)
    
    prompt = textwrap.dedent(f"""
    HYPOTHETICAL SCENARIO: {query}
    
    RELEVANT CONTEXT:
    {context_block}
    
    ANALYSIS REQUIREMENTS:
    1. **Scenario Understanding**: Restate the hypothetical clearly
    2. **Key Variables**: Identify what factors would change
    3. **Impact Analysis**: What would be the consequences?
    4. **Probability Assessment**: How likely is this scenario?
    5. **Preparedness Recommendations**: How to prepare or respond
    6. **Alternative Scenarios**: Related possibilities to consider
    
    Differentiate between:
    - High probability vs speculative scenarios
    - Direct vs indirect consequences
    - Short-term vs long-term impacts
    """)
    
    return prompt

def retrieve_and_generate_enhanced(query: str, top_k: int = TOP_K):
    """Enhanced RAG with multi-capability support and accuracy verification"""
    
    try:
        # Step 1: Analyze query intent
        intent_analysis = analyze_query_intent(query)
        print(f"🎯 Detected intent: {intent_analysis['primary_intent']} (confidence: {intent_analysis['confidence']:.2f})")
        
        # Step 2: Retrieve relevant context
        q_emb = EMBEDDER.embed_text(query).reshape(1, -1)
        retrieved_chunks = VECTOR_STORE.search(q_emb, top_k=top_k)
        
        # Step 3: Route to appropriate handler
        primary_intent = intent_analysis['primary_intent']
        
        if primary_intent == 'technical_guidance':
            print("🔧 Providing technical guidance...")
            prompt = build_technical_guidance_prompt(query, retrieved_chunks)
            system_prompt = SYSTEM_PROMPT_TECHNICAL
            assistance_type = "technical_guidance"
            
        elif primary_intent == 'decision_support':
            print("🤔 Providing decision analysis...")
            prompt = build_decision_analysis_prompt(query, retrieved_chunks)
            system_prompt = SYSTEM_PROMPT_DECISION_ANALYSIS
            assistance_type = "decision_support"
            
        elif primary_intent == 'hypothetical_scenario':
            print("🔮 Analyzing hypothetical scenario...")
            prompt = build_hypothetical_analysis_prompt(query, retrieved_chunks)
            system_prompt = SYSTEM_PROMPT_CONTEXT_AWARE
            assistance_type = "hypothetical_analysis"
            
        else:
            # Context-aware general response
            print("🔍 Using context-aware response...")
            context_texts = []
            for chunk in retrieved_chunks:
                meta = chunk.get("metadata", {})
                snippet = meta.get("text_snippet", "")
                m_id = meta.get("meeting_id")
                cidx = meta.get("chunk_index")
                header = f"[meeting:{m_id} chunk:{cidx}]" if m_id else "[general]"
                context_texts.append(f"{header}\n{snippet}")
            
            context_block = "\n\n---\n\n".join(context_texts) if context_texts else "No specific context available."
            
            prompt = textwrap.dedent(f"""
            QUERY: {query}
            
            AVAILABLE CONTEXT:
            {context_block}
            
            RESPONSE REQUIREMENTS:
            - Address the query directly and accurately
            - Use context when relevant, cite sources
            - Acknowledge limitations and uncertainties
            - Be helpful and informative
            - Maintain professional tone
            """)
            system_prompt = SYSTEM_PROMPT_CONTEXT_AWARE
            assistance_type = "context_aware"
        
        # Step 4: Generate initial answer
        initial_answer = generate(prompt, system_prompt=system_prompt, 
                                max_tokens=1000, temperature=0.3)
        
        # Step 5: Verify accuracy (for non-hypothetical queries)
        if primary_intent != 'hypothetical_scenario':
            verification = verify_answer_against_context(initial_answer, retrieved_chunks, query)
            
            if verification['needs_correction']:
                print("⚠️ Accuracy verification triggered correction")
                # Generate corrected answer with verification feedback
                correction_prompt = f"""
                ORIGINAL QUERY: {query}
                
                INITIAL ANSWER: {initial_answer}
                
                ACCURACY FEEDBACK: {verification['verification_result']}
                
                Please provide a corrected answer that addresses the accuracy concerns while still being helpful.
                """
                
                final_answer = generate(correction_prompt, 
                                      system_prompt="Provide a more accurate and carefully qualified version of the previous answer.",
                                      max_tokens=800, temperature=0.2)
            else:
                final_answer = initial_answer
        else:
            final_answer = initial_answer
            verification = {'verification_result': 'Hypothetical scenario - accuracy check waived'}
        
        return {
            "answer": final_answer,
            "sources": retrieved_chunks,
            "context_used": bool(retrieved_chunks),
            "assistance_type": assistance_type,
            "intent_analysis": intent_analysis,
            "accuracy_verification": verification['verification_result'][:200] + "..." if len(verification['verification_result']) > 200 else verification['verification_result']
        }
    
    except Exception as e:
        print(f"❌ Error in retrieve_and_generate_enhanced: {str(e)}")
        return {
            "answer": f"I encountered an error while processing your request: {str(e)}. Please try again.",
            "sources": [],
            "context_used": False,
            "assistance_type": "error",
            "intent_analysis": {},
            "accuracy_verification": "Error occurred during processing"
        }