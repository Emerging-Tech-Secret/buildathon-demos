"""
Parser module for extracting object specifications from natural language descriptions.
Uses regex and heuristics - no external ML models required.
"""

import re
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass
class ObjectSpec:
    """Specification extracted from natural language description."""
    object_type: str = "box"
    width: float = 50.0  # mm
    depth: float = 50.0  # mm
    height: float = 30.0  # mm
    style: str = "default"
    
    # Functional attributes
    has_lid: bool = False
    has_dividers: bool = False
    divider_count: int = 0
    has_hole: bool = False
    has_hook: bool = False
    
    # Specific parameters
    angle: float = 45.0  # for supports
    wall_thickness: float = 2.0  # mm
    
    # Raw description for reference
    raw_description: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "object_type": self.object_type,
            "width": self.width,
            "depth": self.depth,
            "height": self.height,
            "style": self.style,
            "has_lid": self.has_lid,
            "has_dividers": self.has_dividers,
            "divider_count": self.divider_count,
            "has_hole": self.has_hole,
            "has_hook": self.has_hook,
            "angle": self.angle,
            "wall_thickness": self.wall_thickness,
        }


class DescriptionParser:
    """Parser for natural language 3D object descriptions."""
    
    # Object type mappings (Portuguese and English)
    OBJECT_TYPES = {
        "box": ["caixa", "box", "cubo", "cube", "container", "recipiente"],
        "support": ["suporte", "support", "stand", "apoio", "holder", "porta-celular", "phone holder"],
        "cylinder": ["cilindro", "cylinder", "copo", "cup", "tubo", "tube", "porta-lápis", "pencil holder", "porta-caneta", "pen holder"],
        "tray": ["bandeja", "tray", "organizador", "organizer", "gaveta", "drawer"],
        "hook": ["gancho", "hook", "cabide", "hanger", "pendurador"],
    }
    
    # Style keywords
    STYLES = {
        "minimalist": ["minimalista", "minimalist", "simples", "simple", "clean", "limpo"],
        "organic": ["orgânico", "organic", "natural", "suave", "smooth"],
        "futuristic": ["futurista", "futuristic", "moderno", "modern", "tech", "tecnológico"],
        "robust": ["robusto", "robust", "forte", "strong", "resistente", "sturdy", "reforçado"],
        "elegant": ["elegante", "elegant", "sofisticado", "sophisticated"],
    }
    
    # Functional attributes keywords
    FUNCTIONAL_ATTRS = {
        "has_lid": ["tampa", "lid", "cover", "coberta", "fechamento"],
        "has_dividers": ["divisória", "divisórias", "divider", "dividers", "compartimento", "compartimentos", "separador", "separadores"],
        "has_hole": ["furo", "furos", "hole", "holes", "abertura", "aberturas"],
        "has_hook": ["gancho", "ganchos", "hook", "hooks"],
    }
    
    def __init__(self):
        # Compile regex patterns
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for dimension extraction."""
        # Pattern for dimensions like "10x5x3 cm" or "100x50x30 mm"
        self.dim_pattern = re.compile(
            r'(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)?',
            re.IGNORECASE
        )
        
        # Pattern for single dimension with unit
        self.single_dim_pattern = re.compile(
            r'(\d+(?:[.,]\d+)?)\s*(cm|mm|m|centímetros?|milímetros?|metros?)',
            re.IGNORECASE
        )
        
        # Pattern for angle
        self.angle_pattern = re.compile(
            r'(\d+(?:[.,]\d+)?)\s*(graus?|degrees?|°)',
            re.IGNORECASE
        )
        
        # Pattern for count (e.g., "3 divisórias", "duas divisórias")
        self.count_pattern = re.compile(
            r'(uma?|dois|duas|três|tres|quatro|cinco|seis|\d+)\s+(divisórias?|compartimentos?|separador(?:es)?|furos?)',
            re.IGNORECASE
        )
        
        # Number word mapping
        self.number_words = {
            "um": 1, "uma": 1,
            "dois": 2, "duas": 2,
            "três": 3, "tres": 3,
            "quatro": 4,
            "cinco": 5,
            "seis": 6,
        }
    
    def parse(self, description: str) -> ObjectSpec:
        """Parse a natural language description into an ObjectSpec."""
        spec = ObjectSpec(raw_description=description)
        desc_lower = description.lower()
        
        # Extract object type
        spec.object_type = self._extract_object_type(desc_lower)
        
        # Extract dimensions
        self._extract_dimensions(description, spec)
        
        # Extract style
        spec.style = self._extract_style(desc_lower)
        
        # Extract functional attributes
        self._extract_functional_attrs(desc_lower, spec)
        
        # Extract angle if present
        angle = self._extract_angle(description)
        if angle is not None:
            spec.angle = angle
        
        # Extract divider count if present
        divider_count = self._extract_count(description)
        if divider_count > 0:
            spec.has_dividers = True
            spec.divider_count = divider_count
        
        # Apply style-based modifications
        self._apply_style_modifications(spec)
        
        # Set default dimensions based on object type if not specified
        self._apply_type_defaults(spec, description)
        
        return spec
    
    def _extract_object_type(self, desc_lower: str) -> str:
        """Extract the object type from description."""
        for obj_type, keywords in self.OBJECT_TYPES.items():
            for keyword in keywords:
                if keyword in desc_lower:
                    return obj_type
        return "box"  # Default
    
    def _extract_dimensions(self, description: str, spec: ObjectSpec):
        """Extract dimensions from description."""
        # Try to find 3D dimensions (WxDxH)
        match = self.dim_pattern.search(description)
        if match:
            w = float(match.group(1).replace(',', '.'))
            d = float(match.group(2).replace(',', '.'))
            h = float(match.group(3).replace(',', '.'))
            unit = match.group(4)
            
            # Convert to mm
            multiplier = self._get_unit_multiplier(unit)
            spec.width = w * multiplier
            spec.depth = d * multiplier
            spec.height = h * multiplier
            return
        
        # Try to find individual dimensions
        matches = self.single_dim_pattern.findall(description)
        if matches:
            # Use first dimension found as a reference
            value = float(matches[0][0].replace(',', '.'))
            unit = matches[0][1]
            multiplier = self._get_unit_multiplier(unit)
            base_size = value * multiplier
            
            # Apply to all dimensions proportionally
            spec.width = base_size
            spec.depth = base_size
            spec.height = base_size * 0.6
    
    def _get_unit_multiplier(self, unit: Optional[str]) -> float:
        """Get multiplier to convert to mm."""
        if unit is None:
            return 10.0  # Assume cm
        unit = unit.lower()
        if unit in ['cm', 'centímetro', 'centímetros']:
            return 10.0
        elif unit in ['m', 'metro', 'metros']:
            return 1000.0
        elif unit in ['mm', 'milímetro', 'milímetros']:
            return 1.0
        return 10.0  # Default to cm
    
    def _extract_style(self, desc_lower: str) -> str:
        """Extract style from description."""
        for style, keywords in self.STYLES.items():
            for keyword in keywords:
                if keyword in desc_lower:
                    return style
        return "default"
    
    def _extract_functional_attrs(self, desc_lower: str, spec: ObjectSpec):
        """Extract functional attributes from description."""
        for attr, keywords in self.FUNCTIONAL_ATTRS.items():
            for keyword in keywords:
                if keyword in desc_lower:
                    setattr(spec, attr, True)
                    break
    
    def _extract_angle(self, description: str) -> Optional[float]:
        """Extract angle from description."""
        match = self.angle_pattern.search(description)
        if match:
            return float(match.group(1).replace(',', '.'))
        
        # Check for descriptive angles
        desc_lower = description.lower()
        if "inclinado" in desc_lower or "inclinada" in desc_lower:
            return 30.0
        if "vertical" in desc_lower:
            return 90.0
        if "horizontal" in desc_lower:
            return 0.0
        
        return None
    
    def _extract_count(self, description: str) -> int:
        """Extract count for dividers/compartments."""
        match = self.count_pattern.search(description.lower())
        if match:
            count_str = match.group(1)
            if count_str.isdigit():
                return int(count_str)
            return self.number_words.get(count_str, 0)
        
        # Check for "três divisórias" without explicit pattern
        desc_lower = description.lower()
        if "divisória" in desc_lower or "compartimento" in desc_lower:
            for word, num in self.number_words.items():
                if word in desc_lower:
                    return num
            return 2  # Default to 2 dividers
        
        return 0
    
    def _apply_style_modifications(self, spec: ObjectSpec):
        """Apply modifications based on style."""
        if spec.style == "robust":
            spec.wall_thickness = 3.0
        elif spec.style == "minimalist":
            spec.wall_thickness = 1.5
        elif spec.style == "futuristic":
            spec.wall_thickness = 2.0
    
    def _apply_type_defaults(self, spec: ObjectSpec, description: str):
        """Apply default dimensions based on object type if not specified."""
        # Check if dimensions were explicitly specified
        has_dims = self.dim_pattern.search(description) or self.single_dim_pattern.search(description)
        
        if not has_dims:
            if spec.object_type == "box":
                spec.width = 80.0
                spec.depth = 60.0
                spec.height = 40.0
            elif spec.object_type == "support":
                spec.width = 80.0
                spec.depth = 100.0
                spec.height = 120.0
            elif spec.object_type == "cylinder":
                spec.width = 60.0  # diameter
                spec.depth = 60.0
                spec.height = 100.0
            elif spec.object_type == "tray":
                spec.width = 150.0
                spec.depth = 100.0
                spec.height = 30.0
            elif spec.object_type == "hook":
                spec.width = 30.0
                spec.depth = 50.0
                spec.height = 80.0


# Example usage and testing
if __name__ == "__main__":
    parser = DescriptionParser()
    
    examples = [
        "Uma caixa de 10x5x3 cm com tampa simples",
        "Um suporte minimalista para celular inclinado a 30 graus",
        "Um organizador com três divisórias retangulares",
        "Um gancho robusto para pendurar mochila",
        "Um porta-lápis cilíndrico, vibe futurista",
    ]
    
    for desc in examples:
        print(f"\n{'='*60}")
        print(f"Input: {desc}")
        spec = parser.parse(desc)
        print(f"Type: {spec.object_type}")
        print(f"Dimensions: {spec.width}x{spec.depth}x{spec.height} mm")
        print(f"Style: {spec.style}")
        print(f"Attributes: lid={spec.has_lid}, dividers={spec.has_dividers}({spec.divider_count}), angle={spec.angle}°")
