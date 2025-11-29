// Parametric Hook Template
// Wall hook for hanging items

$fn = 48;

// Parameters
width = 30;        // mm
hook_depth = 50;   // mm
height = 80;       // mm
thickness = 6;     // mm

// Mounting plate dimensions
plate_width = width * 1.5;
plate_height = height * 0.5;

// Basic hook profile
module hook_profile() {
    // Mounting section (straight up)
    square([thickness, plate_height]);
    
    // Curve outward
    translate([0, plate_height])
        difference() {
            square([hook_depth, hook_depth]);
            translate([hook_depth, 0])
                circle(r=hook_depth - thickness);
        }
    
    // Hook tip (curved up)
    translate([hook_depth - thickness, plate_height])
        square([thickness, hook_depth * 0.3]);
}

// Main hook
module hook() {
    // Mounting plate with holes
    difference() {
        translate([-plate_width/2 + thickness/2, 0, 0])
            cube([plate_width, thickness/2, plate_height]);
        
        // Screw holes
        translate([-plate_width/4 + thickness/2, -1, plate_height * 0.3])
            rotate([-90, 0, 0])
                cylinder(h=thickness, d=4);
        translate([plate_width/4 + thickness/2, -1, plate_height * 0.3])
            rotate([-90, 0, 0])
                cylinder(h=thickness, d=4);
    }
    
    // Hook arm
    linear_extrude(width)
        hook_profile();
}

hook();
