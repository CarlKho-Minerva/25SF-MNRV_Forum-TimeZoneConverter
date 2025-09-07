#!/usr/bin/env python3
import base64
import os

# Create a simple 16x16 PNG with a clock icon (base64 encoded)
png_16_data = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFoSURBVDiNpZM9SwNBEIafgYAWFhYWFhYWFhYWFhYW/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gD7A+wPsD/A/gAAAABJRU5ErkJggg=="

# Create PNG files from base64 data
sizes = [16, 32, 48, 128]

for size in sizes:
    # Simple colored square as placeholder
    with open(f"icon{size}.png", "wb") as f:
        # For now, just copy the 16px data for all sizes
        f.write(base64.b64decode(png_16_data))

print("Created placeholder PNG files")
