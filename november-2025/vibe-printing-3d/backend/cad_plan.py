"""
CAD Plan schema for LLM-driven 3D generation.
Defines a small, safe, extensible set of CSG operations and primitives
that can be generated from natural language via an LLM and converted
into OpenSCAD.
"""

from typing import List, Literal, Union
from pydantic import BaseModel, Field


# Primitives
class Cube(BaseModel):
    type: Literal["cube"]
    width: float
    depth: float
    height: float


class Cylinder(BaseModel):
    type: Literal["cylinder"]
    diameter: float
    height: float


class Sphere(BaseModel):
    type: Literal["sphere"]
    diameter: float


# Transforms
class Translate(BaseModel):
    type: Literal["translate"]
    x: float
    y: float
    z: float
    child: "Node"


class Rotate(BaseModel):
    type: Literal["rotate"]
    x: float
    y: float
    z: float
    child: "Node"


class Scale(BaseModel):
    type: Literal["scale"]
    x: float
    y: float
    z: float
    child: "Node"


# Boolean ops
class UnionOp(BaseModel):
    type: Literal["union"]
    children: List["Node"]


class DifferenceOp(BaseModel):
    type: Literal["difference"]
    children: List["Node"]


class IntersectionOp(BaseModel):
    type: Literal["intersection"]
    children: List["Node"]


Node = Union[
    Cube,
    Cylinder,
    Sphere,
    Translate,
    Rotate,
    Scale,
    UnionOp,
    DifferenceOp,
    IntersectionOp,
]


class SceneSpec(BaseModel):
    unit: Literal["mm", "cm", "m"] = Field(default="mm", description="Base unit for numeric dimensions")
    model: Node


# Enable forward refs for the discriminated models
Cube.model_rebuild()
Cylinder.model_rebuild()
Sphere.model_rebuild()
Translate.model_rebuild()
Rotate.model_rebuild()
Scale.model_rebuild()
UnionOp.model_rebuild()
DifferenceOp.model_rebuild()
IntersectionOp.model_rebuild()
SceneSpec.model_rebuild()
