from __future__ import annotations

from typing import List
from cad_plan import SceneSpec, Node, Cube, Cylinder, Sphere, Translate, Rotate, Scale, UnionOp, DifferenceOp, IntersectionOp


def _indent(s: str, level: int) -> str:
    pad = "    " * level
    return "\n".join(pad + line if line else line for line in s.splitlines())


def _render_node(node: Node, level: int = 0) -> str:
    t = getattr(node, "type", None)
    if t == "cube":
        n: Cube = node  # type: ignore
        return _indent(f"cube([{n.width}, {n.depth}, {n.height}]);", level)
    if t == "cylinder":
        n: Cylinder = node  # type: ignore
        return _indent(f"cylinder(h={n.height}, d={n.diameter});", level)
    if t == "sphere":
        n: Sphere = node  # type: ignore
        return _indent(f"sphere(d={n.diameter});", level)
    if t == "translate":
        n: Translate = node  # type: ignore
        return _indent(
            "translate([%s, %s, %s]) {\n%s\n}" % (
                n.x, n.y, n.z, _render_node(n.child, level + 1)
            ),
            level,
        )
    if t == "rotate":
        n: Rotate = node  # type: ignore
        return _indent(
            "rotate([%s, %s, %s]) {\n%s\n}" % (
                n.x, n.y, n.z, _render_node(n.child, level + 1)
            ),
            level,
        )
    if t == "scale":
        n: Scale = node  # type: ignore
        return _indent(
            "scale([%s, %s, %s]) {\n%s\n}" % (
                n.x, n.y, n.z, _render_node(n.child, level + 1)
            ),
            level,
        )
    if t == "union":
        n: UnionOp = node  # type: ignore
        children = "\n".join(_render_node(c, level + 1) for c in n.children)
        return _indent("union() {\n%s\n}" % children, level)
    if t == "difference":
        n: DifferenceOp = node  # type: ignore
        children = "\n".join(_render_node(c, level + 1) for c in n.children)
        return _indent("difference() {\n%s\n}" % children, level)
    if t == "intersection":
        n: IntersectionOp = node  # type: ignore
        children = "\n".join(_render_node(c, level + 1) for c in n.children)
        return _indent("intersection() {\n%s\n}" % children, level)

    raise ValueError(f"Unsupported node type: {t}")


def render_scene(scene: SceneSpec) -> str:
    # Unit scaling: cm->10, m->1000 applied on the whole model
    scale_factor = 1.0
    if scene.unit == "cm":
        scale_factor = 10.0
    elif scene.unit == "m":
        scale_factor = 1000.0

    body = _render_node(scene.model, 0)
    header = "$fn = 64;"  # smoother geometry

    if scale_factor != 1.0:
        body = f"scale([{scale_factor}, {scale_factor}, {scale_factor}]) {{\n{_indent(body, 1)}\n}}"

    return f"{header}\n\n{body}\n"
