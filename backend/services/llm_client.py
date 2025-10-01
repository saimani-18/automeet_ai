import os
from dotenv import load_dotenv
import requests
import json
from typing import Dict


load_dotenv()

class LLMClient:
    def __init__(self):
        self.providers = ["gemini", "openai", "ollama", "groq", "dummy"]
        self.current_provider = os.environ.get("LLM_PROVIDER", "gemini")
        
    def call_gemini(self, prompt: str, system_prompt: str = "", **kwargs) -> Dict:
        """Try Gemini API with fallback"""
        api_key = os.environ.get("GEMINI_API_KEY")
        endpoint = os.environ.get(
            "GEMINI_ENDPOINT",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        )
        
        if not api_key:
            return {"error": "GEMINI_API_KEY not configured", "text": ""}
            
        url = f"{endpoint}?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        contents = [{"parts": [{"text": system_prompt + "\n\n" + prompt}]}]
        payload = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": kwargs.get("max_tokens", 512),
                "temperature": kwargs.get("temperature", 0.2)
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if "candidates" in data and data["candidates"]:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    text = candidate["content"]["parts"][0].get("text", "")
                    return {"text": text, "provider": "gemini"}
                    
            return {"error": "Unexpected response format", "text": ""}
            
        except requests.exceptions.RequestException as e:
            return {"error": f"Gemini API error: {str(e)}", "text": ""}

    def call_openai_compatible(self, prompt: str, system_prompt: str = "", **kwargs) -> Dict:
        """Fallback to OpenAI-compatible API - Optimized for OpenRouter"""
        api_key = os.environ.get("OPENAI_API_KEY")
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        
        if not api_key:
            return {"error": "OPENAI_API_KEY not configured", "text": ""}
        
        # OpenRouter configuration
        if "openrouter" in base_url:
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": os.environ.get("SITE_URL", "https://localhost:5000"),
                "X-Title": os.environ.get("APP_NAME", "AutoMeet")
            }
            # Use the model from environment or fallback to a working free model
            model = os.environ.get("OPENAI_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
        else:
            # Standard OpenAI
            url = f"{base_url}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            model = os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")
            
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": kwargs.get("max_tokens", 512),
            "temperature": kwargs.get("temperature", 0.2)
        }
        
        try:
            print(f"🔧 Using model: {model}")
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            if response.status_code == 404:
                # Model not found - suggest working models
                suggested_models = [
                    "meta-llama/llama-3.1-8b-instruct:free",
                    "anthropic/claude-3.5-sonnet:free", 
                    "microsoft/wizardlm-2-8x22b:free"
                ]
                return {"error": f"Model '{model}' not found. Try: {', '.join(suggested_models)}", "text": ""}
            elif response.status_code == 401:
                return {"error": "Invalid API key", "text": ""}
            elif response.status_code != 200:
                return {"error": f"HTTP {response.status_code}: {response.text[:100]}", "text": ""}
                
            response.raise_for_status()
            data = response.json()
            
            text = data["choices"][0]["message"]["content"]
            return {"text": text, "provider": "openai"}
            
        except requests.exceptions.Timeout:
            return {"error": "API timeout", "text": ""}
        except Exception as e:
            return {"error": f"API error: {str(e)}", "text": ""}

    def call_ollama(self, prompt: str, system_prompt: str = "", **kwargs) -> Dict:
        """Local fallback using Ollama"""
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.environ.get("OLLAMA_MODEL", "llama2")
        
        url = f"{base_url}/api/generate"
        payload = {
            "model": model,
            "prompt": system_prompt + "\n\n" + prompt,
            "stream": False,
            "options": {
                "temperature": kwargs.get("temperature", 0.2),
                "num_predict": kwargs.get("max_tokens", 512)
            }
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            return {"text": data.get("response", ""), "provider": "ollama"}
            
        except requests.exceptions.RequestException:
            return {"error": "Ollama not available", "text": ""}

    def call_groq(self, prompt: str, system_prompt: str = "", **kwargs) -> Dict:
        """Call Groq's OpenAI-compatible API"""
        api_key = os.environ.get("GROQ_API_KEY")
        base_url = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        
        if not api_key:
            return {"error": "GROQ_API_KEY not configured", "text": ""}
        
        url = f"{base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": os.environ.get("GROQ_MODEL", "llama3-8b-8192"),  # Groq default model
            "messages": messages,
            "max_tokens": kwargs.get("max_tokens", 512),
            "temperature": kwargs.get("temperature", 0.2)
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            text = data["choices"][0]["message"]["content"]
            return {"text": text, "provider": "groq"}
            
        except requests.exceptions.RequestException as e:
            return {"error": f"Groq API error: {str(e)}", "text": ""}

    def call_dummy(self, prompt: str, system_prompt: str = "", **kwargs) -> Dict:
        """Local dummy response for testing"""
        return {
            "text": f"[LLM Simulation] Response to: {prompt[:100]}...\n\nI understand you need assistance. This is a simulated response since the LLM service is currently unavailable. In a production environment, this would be a real AI response.",
            "provider": "dummy"
        }

    def generate(self, prompt: str, system_prompt: str = "", **kwargs) -> str:
        """Try multiple providers in order"""
        providers_to_try = []
        
        # Determine which providers to try based on configuration
        if os.environ.get("GEMINI_API_KEY"):
            providers_to_try.append(self.call_gemini)
        if os.environ.get("OPENAI_API_KEY"):
            providers_to_try.append(self.call_openai_compatible)
        if os.environ.get("OLLAMA_BASE_URL"):
            providers_to_try.append(self.call_ollama)
        if os.environ.get("GROQ_API_KEY"):
            providers_to_try.append(self.call_groq)
            
        # Always include dummy as last resort
        providers_to_try.append(self.call_dummy)
        
        # Try providers in order
        for provider_func in providers_to_try:
            result = provider_func(prompt, system_prompt, **kwargs)
            if result.get("text") and not result.get("error"):
                print(f"✅ LLM response from {result.get('provider', 'unknown')}")
                return result["text"]
            else:
                print(f"⚠️ {provider_func.__name__} failed: {result.get('error', 'Unknown error')}")
                continue
                
        return "Sorry, I couldn't generate a response at this time."

# Singleton instance
llm_client = LLMClient()

def generate(prompt: str, system_prompt: str = "", **kwargs) -> str:
    return llm_client.generate(prompt, system_prompt, **kwargs)

