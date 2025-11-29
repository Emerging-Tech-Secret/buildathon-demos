// Parametric Cylinder/Cup Template
// Cylindrical container (pencil holder, cup, etc.)

$fn = 64;

// Parameters
diameter = 60;   // mm
height = 100;    // mm
wall = 2;        // mm

// Base cylinder
module cylinder_cup() {
    difference() {
        // Outer cylinder
        cylinder(h=height, d=diameter);
        
        // Inner cavity
        translate([0, 0, wall])
            cylinder(h=height, d=diameter - 2*wall);
    }
}

cylinder_cup();
