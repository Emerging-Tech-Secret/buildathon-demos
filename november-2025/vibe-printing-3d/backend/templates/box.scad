// Parametric Box Template
// Usage: Set parameters and render

$fn = 32;

// Parameters (will be replaced by generator)
width = 80;    // mm
depth = 60;    // mm
height = 40;   // mm
wall = 2;      // mm
has_lid = false;

// Main box
module box() {
    difference() {
        // Outer shell
        cube([width, depth, height]);
        
        // Inner cavity
        translate([wall, wall, wall])
            cube([width - 2*wall, depth - 2*wall, height]);
    }
}

// Lid module
module lid() {
    lid_height = wall * 2;
    lip = wall * 0.8;
    
    translate([0, 0, height + 2]) {
        // Lid top
        cube([width, depth, wall]);
        
        // Lip that fits inside
        translate([wall + 0.2, wall + 0.2, -lip])
            cube([width - 2*wall - 0.4, depth - 2*wall - 0.4, lip]);
    }
}

// Render
box();
if (has_lid) lid();
