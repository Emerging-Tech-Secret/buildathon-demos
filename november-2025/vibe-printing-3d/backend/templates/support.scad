// Parametric Phone/Tablet Support Template
// L-shaped stand with adjustable angle

$fn = 48;

// Parameters
width = 80;      // mm
depth = 100;     // mm
height = 120;    // mm
wall = 4;        // mm
angle = 30;      // degrees
lip_height = 15; // mm

// L-shaped support
module support() {
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
    hull() {
        cube([wall, depth, wall]);
        translate([0, depth - wall, 0])
            rotate([90 - angle, 0, 0])
                cube([wall, height * 0.3, wall]);
    }
    
    translate([width - wall, 0, 0])
    hull() {
        cube([wall, depth, wall]);
        translate([0, depth - wall, 0])
            rotate([90 - angle, 0, 0])
                cube([wall, height * 0.3, wall]);
    }
}

support();
