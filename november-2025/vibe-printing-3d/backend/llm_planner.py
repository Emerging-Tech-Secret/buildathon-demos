import os
import json
from typing import Optional, Dict, Any
import httpx
from pydantic import ValidationError
from cad_plan import SceneSpec


SCHEMA_HINT = {
    "type": "object",
    "properties": {
        "unit": {"enum": ["mm", "cm", "m"]},
        "model": {"$ref": "#/definitions/Node"}
    },
    "required": ["unit", "model"],
    "definitions": {
        "Node": {
            "oneOf": [
                {"type": "object", "properties": {"type": {"const": "cube"}, "width": {"type": "number"}, "depth": {"type": "number"}, "height": {"type": "number"}}, "required": ["type", "width", "depth", "height"]},
                {"type": "object", "properties": {"type": {"const": "cylinder"}, "diameter": {"type": "number"}, "height": {"type": "number"}}, "required": ["type", "diameter", "height"]},
                {"type": "object", "properties": {"type": {"const": "sphere"}, "diameter": {"type": "number"}}, "required": ["type", "diameter"]},
                {"type": "object", "properties": {"type": {"const": "translate"}, "x": {"type": "number"}, "y": {"type": "number"}, "z": {"type": "number"}, "child": {"$ref": "#/definitions/Node"}}, "required": ["type", "x", "y", "z", "child"]},
                {"type": "object", "properties": {"type": {"const": "rotate"}, "x": {"type": "number"}, "y": {"type": "number"}, "z": {"type": "number"}, "child": {"$ref": "#/definitions/Node"}}, "required": ["type", "x", "y", "z", "child"]},
                {"type": "object", "properties": {"type": {"const": "scale"}, "x": {"type": "number"}, "y": {"type": "number"}, "z": {"type": "number"}, "child": {"$ref": "#/definitions/Node"}}, "required": ["type", "x", "y", "z", "child"]},
                {"type": "object", "properties": {"type": {"const": "union"}, "children": {"type": "array", "items": {"$ref": "#/definitions/Node"}}}, "required": ["type", "children"]},
                {"type": "object", "properties": {"type": {"const": "difference"}, "children": {"type": "array", "items": {"$ref": "#/definitions/Node"}}}, "required": ["type", "children"]},
                {"type": "object", "properties": {"type": {"const": "intersection"}, "children": {"type": "array", "items": {"$ref": "#/definitions/Node"}}}, "required": ["type", "children"]}
            ]
        }
    }
}

SYSTEM_INSTRUCTIONS = (
    "Você é um planejador CAD. Converta descrições de objetos em um JSON que segue rigorosamente o schema fornecido. "
    "Só retorne JSON puro, sem comentários nem texto extra. Unidades padrão: mm. Use operações CSG simples."
)

EXAMPLE_PLAN = {
    "unit": "mm",
    "model": {
        "type": "difference",
        "children": [
            {"type": "cube", "width": 100, "depth": 50, "height": 30},
            {"type": "translate", "x": 1.5, "y": 1.5, "z": 1.5, "child": {"type": "cube", "width": 97, "depth": 47, "height": 29}}
        ]
    }
}


class PlannerError(RuntimeError):
    pass


def plan_from_description(description: str, provider: Optional[str] = None) -> SceneSpec:
    provider = (provider or os.getenv("LLM_PROVIDER") or "").strip().lower()

    if provider in ("openai", "") and os.getenv("OPENAI_API_KEY"):
        return _plan_with_openai(description)

    if provider == "ollama" or os.getenv("OLLAMA_HOST"):
        return _plan_with_ollama(description)

    raise PlannerError("No LLM provider configured. Set OPENAI_API_KEY or OLLAMA_HOST/LLM_PROVIDER.")


def _openai_headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
        "Content-Type": "application/json",
    }


def _plan_with_openai(description: str) -> SceneSpec:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    # Use Chat Completions with a JSON-only style instruction
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {
                "role": "user",
                "content": (
                    "Schema (JSON Schema minificado):\n" + json.dumps(SCHEMA_HINT) +
                    "\nExemplo:\n" + json.dumps(EXAMPLE_PLAN) +
                    "\nDescrição:\n" + description +
                    "\nResponda apenas com o JSON do plano."
                ),
            },
        ],
        "temperature": 0.2,
    }

    with httpx.Client(timeout=60) as client:
        resp = client.post("https://api.openai.com/v1/chat/completions", headers=_openai_headers(), json=payload)
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()

    try:
        parsed = json.loads(content)
        return SceneSpec.model_validate(parsed)
    except (json.JSONDecodeError, ValidationError) as e:
        raise PlannerError(f"Invalid LLM output: {e}")


def _plan_with_ollama(description: str) -> SceneSpec:
    host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.1")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_INSTRUCTIONS},
            {
                "role": "user",
                "content": (
                    "Schema (JSON Schema minificado):\n" + json.dumps(SCHEMA_HINT) +
                    "\nExemplo:\n" + json.dumps(EXAMPLE_PLAN) +
                    "\nDescrição:\n" + description +
                    "\nResponda apenas com o JSON do plano."
                ),
            },
        ],
        "options": {"temperature": 0.2},
        "stream": False,
    }

    with httpx.Client(timeout=120) as client:
        resp = client.post(f"{host}/api/chat", json=payload)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("message", {}).get("content", "").strip()

    try:
        parsed = json.loads(content)
        return SceneSpec.model_validate(parsed)
    except (json.JSONDecodeError, ValidationError) as e:
        raise PlannerError(f"Invalid LLM output: {e}")
