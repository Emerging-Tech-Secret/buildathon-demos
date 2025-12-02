"""
Vibe Printing 3D - FastAPI Backend
Generates 3D printable STL files from natural language descriptions.
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from uuid import uuid4
from dotenv import load_dotenv

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables from .env if present
load_dotenv()

from parser import DescriptionParser
from generator import OpenSCADGenerator
from cad_plan import SceneSpec
from scad_renderer import render_scene
from llm_planner import plan_from_description, PlannerError


# Pydantic models
class GenerateRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language description of the 3D object to generate",
        examples=[
            "Uma caixa de 10x5x3 cm com tampa simples",
            "Um suporte minimalista para celular inclinado a 30 graus",
            "Um organizador com três divisórias retangulares",
            "Um gancho robusto para pendurar mochila",
            "Um porta-lápis cilíndrico, vibe futurista",
        ]
    )


class GenerateResponse(BaseModel):
    success: bool
    message: str
    download_url: Optional[str] = None
    filename: Optional[str] = None
    object_spec: Optional[dict] = None
    scad_code: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str


class ParseResponse(BaseModel):
    success: bool
    message: str
    object_spec: Optional[dict] = None
    scad_code: Optional[str] = None


class CADPlanRequest(BaseModel):
    scene: dict = Field(..., description="SceneSpec JSON describing the CAD plan")


class LLMGenerateRequest(BaseModel):
    description: str = Field(..., min_length=3, max_length=800)
    provider: Optional[str] = Field(default=None, description="LLM provider id, e.g., openai, ollama")


# Initialize FastAPI app
app = FastAPI(
    title="Vibe Printing 3D",
    description="Generate 3D printable STL files from natural language descriptions",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize parser and generator
parser = DescriptionParser()
generator = OpenSCADGenerator()


# Example descriptions for documentation
EXAMPLES = [
    {
        "description": "Uma caixa de 10x5x3 cm com tampa simples",
        "translation": "A 10x5x3 cm box with a simple lid"
    },
    {
        "description": "Um suporte minimalista para celular inclinado a 30 graus",
        "translation": "A minimalist phone stand angled at 30 degrees"
    },
    {
        "description": "Um organizador com três divisórias retangulares",
        "translation": "An organizer with three rectangular dividers"
    },
    {
        "description": "Um gancho robusto para pendurar mochila",
        "translation": "A robust hook for hanging a backpack"
    },
    {
        "description": "Um porta-lápis cilíndrico, vibe futurista",
        "translation": "A cylindrical pencil holder with futuristic vibe"
    },
]


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check endpoint to verify the server is running.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )


@app.get("/examples", tags=["Examples"])
async def get_examples():
    """
    Get example descriptions that can be used with the /generate endpoint.
    """
    return {"examples": EXAMPLES}


@app.post("/parse", response_model=ParseResponse, tags=["Parsing"])
async def parse_description(request: GenerateRequest):
    """
    Parse a natural language description and return the inferred object spec
    and the generated OpenSCAD code, without compiling to STL.
    """
    try:
        spec = parser.parse(request.description)
        scad_code = generator._generate_scad_code(spec)
        return ParseResponse(
            success=True,
            message="Descrição parseada com sucesso.",
            object_spec=spec.to_dict(),
            scad_code=scad_code,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-plan", response_model=GenerateResponse, tags=["Generation"])
async def generate_from_plan(request: CADPlanRequest):
    """
    Generate STL from a CAD plan (SceneSpec JSON) produced by a planner/LLM or client.
    """
    try:
        scene = SceneSpec.model_validate(request.scene)
        scad_code = render_scene(scene)

        # Write SCAD file
        file_id = str(uuid4())[:8]
        scad_path = generator.output_dir / f"plan_{file_id}.scad"
        stl_path = generator.output_dir / f"plan_{file_id}.stl"
        with open(scad_path, "w", encoding="utf-8") as f:
            f.write(scad_code)

        # Try to compile to STL
        try:
            generator._compile_to_stl(scad_path, stl_path)
            filename = stl_path.name
            return GenerateResponse(
                success=True,
                message="Modelo gerado a partir do plano CAD.",
                download_url=f"/download/{filename}",
                filename=filename,
                object_spec=None,
                scad_code=scad_code,
            )
        except RuntimeError as e:
            # Return SCAD code even if OpenSCAD is missing
            error_msg = str(e)
            if "OpenSCAD not found" in error_msg:
                return GenerateResponse(
                    success=False,
                    message="OpenSCAD não instalado. Código SCAD gerado mas STL não compilado.",
                    object_spec=None,
                    scad_code=scad_code,
                )
            raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-llm", response_model=GenerateResponse, tags=["Generation"])
async def generate_with_llm(request: LLMGenerateRequest):
    """
    Stub endpoint for LLM-driven generation. It will parse the description via an external
    LLM to a CAD plan (SceneSpec) and render to SCAD/STL. Currently returns 501 when the
    provider is not configured. This keeps the API stable while allowing future integration.
    """
    try:
        # Use LLM to produce a CAD plan (SceneSpec)
        scene = plan_from_description(request.description, provider=request.provider)
        scad_code = render_scene(scene)
        
        # Write SCAD and try to compile
        file_id = str(uuid4())[:8]
        scad_path = generator.output_dir / f"llm_{file_id}.scad"
        stl_path = generator.output_dir / f"llm_{file_id}.stl"
        with open(scad_path, "w", encoding="utf-8") as f:
            f.write(scad_code)
        
        try:
            generator._compile_to_stl(scad_path, stl_path)
            filename = stl_path.name
            return GenerateResponse(
                success=True,
                message="Modelo gerado via LLM.",
                download_url=f"/download/{filename}",
                filename=filename,
                object_spec=None,
                scad_code=scad_code,
            )
        except RuntimeError as e:
            error_msg = str(e)
            if "OpenSCAD not found" in error_msg:
                return GenerateResponse(
                    success=False,
                    message="OpenSCAD não instalado. Código SCAD gerado mas STL não compilado.",
                    object_spec=None,
                    scad_code=scad_code,
                )
            raise
    except PlannerError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate", response_model=GenerateResponse, tags=["Generation"])
async def generate_stl(request: GenerateRequest):
    """
    Generate a 3D STL file from a natural language description.
    
    The description should include:
    - Object type (caixa/box, suporte/support, cilindro/cylinder, bandeja/tray, gancho/hook)
    - Dimensions (optional, e.g., "10x5x3 cm")
    - Style keywords (minimalista, robusto, futurista, orgânico)
    - Functional attributes (com tampa, com divisórias, com furo)
    
    Returns the generated STL file path and object specifications.
    """
    try:
        # Parse description
        spec = parser.parse(request.description)
        
        # Generate SCAD code (for preview)
        scad_code = generator._generate_scad_code(spec)
        
        # Try to generate STL
        try:
            stl_path = generator.generate(spec)
            filename = Path(stl_path).name
            
            return GenerateResponse(
                success=True,
                message=f"Modelo {spec.object_type} gerado com sucesso!",
                download_url=f"/download/{filename}",
                filename=filename,
                object_spec=spec.to_dict(),
                scad_code=scad_code
            )
        except RuntimeError as e:
            # OpenSCAD not available - return code only
            error_msg = str(e)
            if "OpenSCAD not found" in error_msg:
                return GenerateResponse(
                    success=False,
                    message="OpenSCAD não instalado. Código SCAD gerado mas STL não compilado.",
                    object_spec=spec.to_dict(),
                    scad_code=scad_code
                )
            raise
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{filename}", tags=["Download"])
async def download_stl(filename: str):
    """
    Download a generated STL file.
    """
    file_path = generator.output_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if not filename.endswith('.stl'):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/sla"
    )


@app.get("/download-scad/{filename}", tags=["Download"])
async def download_scad(filename: str):
    """
    Download the OpenSCAD source file.
    """
    file_path = generator.output_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if not filename.endswith('.scad'):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="text/plain"
    )


@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": "Vibe Printing 3D",
        "description": "Generate 3D printable STL files from natural language descriptions",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "generate": "/generate",
            "parse": "/parse",
            "examples": "/examples",
            "download": "/download/{filename}",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
