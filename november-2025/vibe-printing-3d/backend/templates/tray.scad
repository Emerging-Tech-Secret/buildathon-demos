// Parametric Tray/Organizer Template
// Tray with optional dividers

$fn = 32;

// Parameters
width = 150;       // mm
depth = 100;       // mm
height = 30;       // mm
wall = 2;          // mm
divider_count = 2; // number of dividers

// Base tray
module tray() {
    difference() {
        // Outer shell
        cube([width, depth, height]);
        
        // Inner cavity
        translate([wall, wall, wall])
            cube([width - 2*wall, depth - 2*wall, height]);
    }
}

// Dividers
module dividers() {
    if (divider_count > 0) {
        compartment_width = (width - wall) / (divider_count + 1);
        
        for (i = [1:divider_count]) {
            translate([i * compartment_width, wall, wall])
                cube([wall, depth - 2*wall, height - wall]);
        }
    }
}

// Render
tray();
dividers();
