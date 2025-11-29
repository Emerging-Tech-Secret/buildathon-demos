"""
Generator module for creating 3D models from ObjectSpec using OpenSCAD.
"""

import os
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Optional
from string import Template

from parser import ObjectSpec


class OpenSCADGenerator:
    """Generates STL files from ObjectSpec using OpenSCAD templates."""
    
    def __init__(self, templates_dir: Optional[str] = None, output_dir: Optional[str] = None):
        self.base_dir = Path(__file__).parent
        self.templates_dir = Path(templates_dir) if templates_dir else self.base_dir / "templates"
        self.output_dir = Path(output_dir) if output_dir else self.base_dir.parent / "output"
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate(self, spec: ObjectSpec) -> str:
        """
        Generate STL file from ObjectSpec.
        Returns the path to the generated STL file.
        """
        # Generate unique filename
        file_id = str(uuid.uuid4())[:8]
        scad_path = self.output_dir / f"{spec.object_type}_{file_id}.scad"
        stl_path = self.output_dir / f"{spec.object_type}_{file_id}.stl"
        
        # Generate OpenSCAD code
        scad_code = self._generate_scad_code(spec)
        
        # Write SCAD file
        with open(scad_path, 'w') as f:
            f.write(scad_code)
        
        # Compile to STL
        self._compile_to_stl(scad_path, stl_path)
        
        return str(stl_path)
    
    def _generate_scad_code(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code based on object type and spec."""
        generators = {
            "box": self._generate_box,
            "support": self._generate_support,
            "cylinder": self._generate_cylinder,
            "tray": self._generate_tray,
            "hook": self._generate_hook,
        }
        
        generator = generators.get(spec.object_type, self._generate_box)
        return generator(spec)
    
    def _generate_box(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code for a box."""
        code = f"""// Generated Box - {spec.style} style
// Dimensions: {spec.width}x{spec.depth}x{spec.height} mm

$fn = 32;

// Parameters
width = {spec.width};
depth = {spec.depth};
height = {spec.height};
wall = {spec.wall_thickness};
has_lid = {"true" if spec.has_lid else "false"};

// Main box
module box() {{
    difference() {{
        // Outer shell
        cube([width, depth, height]);
        
        // Inner cavity
        translate([wall, wall, wall])
            cube([width - 2*wall, depth - 2*wall, height]);
    }}
}}

// Lid module
module lid() {{
    lid_height = wall * 2;
    lip = wall * 0.8;
    
    translate([0, 0, height + 2]) {{
        // Lid top
        cube([width, depth, wall]);
        
        // Lip that fits inside
        translate([wall + 0.2, wall + 0.2, -lip])
            cube([width - 2*wall - 0.4, depth - 2*wall - 0.4, lip]);
    }}
}}

// Render
box();
if (has_lid) lid();
"""
        return code
    
    def _generate_support(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code for a phone/tablet support (L-shape)."""
        code = f"""// Generated Support - {spec.style} style
// Angle: {spec.angle} degrees

$fn = 48;

// Parameters
width = {spec.width};
depth = {spec.depth};
height = {spec.height};
wall = {spec.wall_thickness * 2};
angle = {spec.angle};
lip_height = 15;

// L-shaped support
module support() {{
    // Base
    cube([width, depth, wall]);
    
    // Back support (angled)
    translate([0, depth - wall, 0])
        rotate([90 - angle, 0, 0])
            cube([width, height, wall]);
    
    // Front lip to hold device
    translate([0, wall, 0])
        cube([width, wall, lip_height]);
    
    // Side supports for stability
    hull() {{
        cube([wall, depth, wall]);
        translate([0, depth - wall, 0])
            rotate([90 - angle, 0, 0])
                cube([wall, height * 0.3, wall]);
    }}
    
    translate([width - wall, 0, 0])
    hull() {{
        cube([wall, depth, wall]);
        translate([0, depth - wall, 0])
            rotate([90 - angle, 0, 0])
                cube([wall, height * 0.3, wall]);
    }}
}}

// Apply style modifications
module styled_support() {{
    if ("{spec.style}" == "minimalist") {{
        // Thinner, cleaner lines
        scale([1, 1, 0.8]) support();
    }} else if ("{spec.style}" == "robust") {{
        // Thicker, more solid
        support();
        // Add reinforcement
        translate([width/4, depth/2, 0])
            cylinder(h=wall, r=wall);
        translate([3*width/4, depth/2, 0])
            cylinder(h=wall, r=wall);
    }} else {{
        support();
    }}
}}

styled_support();
"""
        return code
    
    def _generate_cylinder(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code for a cylindrical container."""
        diameter = spec.width
        
        code = f"""// Generated Cylinder/Cup - {spec.style} style
// Diameter: {diameter} mm, Height: {spec.height} mm

$fn = 64;

// Parameters
diameter = {diameter};
height = {spec.height};
wall = {spec.wall_thickness};

// Base cylinder
module cylinder_cup() {{
    difference() {{
        // Outer cylinder
        cylinder(h=height, d=diameter);
        
        // Inner cavity
        translate([0, 0, wall])
            cylinder(h=height, d=diameter - 2*wall);
    }}
}}

// Futuristic style with ridges
module futuristic_cylinder() {{
    difference() {{
        union() {{
            cylinder_cup();
            
            // Add decorative ridges
            for (i = [0:5]) {{
                translate([0, 0, height * 0.2 + i * height * 0.12])
                    difference() {{
                        cylinder(h=2, d=diameter + 2);
                        cylinder(h=3, d=diameter - 1);
                    }}
            }}
        }}
        
        // Inner cavity (ensure it's hollow)
        translate([0, 0, wall])
            cylinder(h=height + 10, d=diameter - 2*wall);
    }}
}}

// Organic style with curved base
module organic_cylinder() {{
    difference() {{
        union() {{
            // Curved base
            scale([1, 1, 0.3])
                sphere(d=diameter);
            
            translate([0, 0, diameter * 0.1])
                cylinder_cup();
        }}
        
        // Inner cavity
        translate([0, 0, wall])
            cylinder(h=height + diameter, d=diameter - 2*wall);
    }}
}}

// Render based on style
if ("{spec.style}" == "futuristic") {{
    futuristic_cylinder();
}} else if ("{spec.style}" == "organic") {{
    organic_cylinder();
}} else {{
    cylinder_cup();
}}
"""
        return code
    
    def _generate_tray(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code for a tray with optional dividers."""
        divider_count = spec.divider_count if spec.has_dividers else 0
        
        code = f"""// Generated Tray/Organizer - {spec.style} style
// Dimensions: {spec.width}x{spec.depth}x{spec.height} mm
// Dividers: {divider_count}

$fn = 32;

// Parameters
width = {spec.width};
depth = {spec.depth};
height = {spec.height};
wall = {spec.wall_thickness};
divider_count = {divider_count};

// Base tray
module tray() {{
    difference() {{
        // Outer shell
        cube([width, depth, height]);
        
        // Inner cavity
        translate([wall, wall, wall])
            cube([width - 2*wall, depth - 2*wall, height]);
    }}
}}

// Dividers
module dividers() {{
    if (divider_count > 0) {{
        compartment_width = (width - wall) / (divider_count + 1);
        
        for (i = [1:divider_count]) {{
            translate([i * compartment_width, wall, wall])
                cube([wall, depth - 2*wall, height - wall]);
        }}
    }}
}}

// Rounded tray for organic style
module organic_tray() {{
    minkowski() {{
        difference() {{
            cube([width - 4, depth - 4, height - 2]);
            translate([wall, wall, wall])
                cube([width - 2*wall - 4, depth - 2*wall - 4, height]);
        }}
        sphere(r=2);
    }}
}}

// Render
if ("{spec.style}" == "organic") {{
    organic_tray();
    translate([2, 2, 1]) dividers();
}} else {{
    tray();
    dividers();
}}
"""
        return code
    
    def _generate_hook(self, spec: ObjectSpec) -> str:
        """Generate OpenSCAD code for a wall hook."""
        code = f"""// Generated Hook - {spec.style} style
// Size: {spec.width}x{spec.depth}x{spec.height} mm

$fn = 48;

// Parameters
width = {spec.width};
hook_depth = {spec.depth};
height = {spec.height};
thickness = {spec.wall_thickness * 3};

// Mounting plate dimensions
plate_width = width * 1.5;
plate_height = height * 0.5;

// Basic hook profile
module hook_profile() {{
    // Mounting section (straight up)
    square([thickness, plate_height]);
    
    // Curve outward
    translate([0, plate_height])
        difference() {{
            square([hook_depth, hook_depth]);
            translate([hook_depth, 0])
                circle(r=hook_depth - thickness);
        }}
    
    // Hook tip (curved up)
    translate([hook_depth - thickness, plate_height])
        square([thickness, hook_depth * 0.3]);
}}

// Main hook
module hook() {{
    // Mounting plate with holes
    difference() {{
        translate([-plate_width/2 + thickness/2, 0, 0])
            cube([plate_width, thickness/2, plate_height]);
        
        // Screw holes
        translate([-plate_width/4 + thickness/2, -1, plate_height * 0.3])
            rotate([-90, 0, 0])
                cylinder(h=thickness, d=4);
        translate([plate_width/4 + thickness/2, -1, plate_height * 0.3])
            rotate([-90, 0, 0])
                cylinder(h=thickness, d=4);
    }}
    
    // Hook arm
    linear_extrude(width)
        hook_profile();
}}

// Robust version with reinforcement
module robust_hook() {{
    hook();
    
    // Side reinforcement
    translate([0, thickness/2, 0])
        rotate([90, 0, 0])
            linear_extrude(thickness/2)
                polygon([[0, 0], [hook_depth * 0.7, 0], [0, width]]);
    
    translate([0, thickness/2, width])
        rotate([90, 0, 0])
            linear_extrude(thickness/2)
                polygon([[0, 0], [hook_depth * 0.7, 0], [0, -width]]);
}}

// Minimalist version
module minimalist_hook() {{
    // Simpler mounting
    translate([-width/2 + thickness/2, 0, 0])
        cube([width, thickness/2, plate_height * 0.5]);
    
    // Clean hook
    scale([0.8, 0.8, 1])
        linear_extrude(width)
            hook_profile();
}}

// Render based on style
if ("{spec.style}" == "robust") {{
    robust_hook();
}} else if ("{spec.style}" == "minimalist") {{
    minimalist_hook();
}} else {{
    hook();
}}
"""
        return code
    
    def _compile_to_stl(self, scad_path: Path, stl_path: Path) -> None:
        """Compile OpenSCAD file to STL."""
        # Try common OpenSCAD paths
        openscad_paths = [
            "openscad",  # If in PATH
            "/opt/homebrew/bin/openscad",  # macOS Homebrew (Apple Silicon)
            "/usr/local/bin/openscad",  # macOS Homebrew (Intel)
            "/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD",  # macOS App
            "/usr/bin/openscad",  # Linux
            "C:\\Program Files\\OpenSCAD\\openscad.exe",  # Windows
        ]
        
        openscad_cmd = None
        for path in openscad_paths:
            try:
                result = subprocess.run(
                    [path, "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    openscad_cmd = path
                    break
            except (subprocess.SubprocessError, FileNotFoundError):
                continue
        
        if openscad_cmd is None:
            raise RuntimeError(
                "OpenSCAD not found. Please install OpenSCAD from https://openscad.org/downloads.html"
            )
        
        # Run OpenSCAD to generate STL
        result = subprocess.run(
            [openscad_cmd, "-o", str(stl_path), str(scad_path)],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"OpenSCAD error: {result.stderr}")
        
        if not stl_path.exists():
            raise RuntimeError("STL file was not generated")


# Example usage
if __name__ == "__main__":
    from parser import DescriptionParser
    
    parser = DescriptionParser()
    generator = OpenSCADGenerator()
    
    # Test with a simple box
    spec = parser.parse("Uma caixa de 10x5x3 cm com tampa simples")
    print(f"Generating {spec.object_type}...")
    
    try:
        stl_path = generator.generate(spec)
        print(f"Generated: {stl_path}")
    except RuntimeError as e:
        print(f"Error: {e}")
        # Still show the generated code
        print("\nGenerated OpenSCAD code:")
        print(generator._generate_scad_code(spec))
