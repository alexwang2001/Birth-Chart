
import math

class PlanetData:
    def __init__(self, name, date, positions):
        self.name = name
        self.date = date
        self.positions = positions  # Expected output {planet: longitude}

# NASA JPL Horizons Data (Downloaded via astroquery 2026-01-29)
# Coordinates: Geocentric [500] Ecliptic J2000 (quantities='31')
TEST_DATA = [
    {
        'date': '1950-01-01', 'time': '12:00',
        'planets': {
            'Sun': 280.51,
            'Mercury': 299.97,
            'Venus': 317.15,
            'Mars': 182.39,
            'Jupiter': 306.62,
            'Saturn': 169.44,
            'Uranus': 92.66,
            'Neptune': 197.27,
            'Pluto': 137.79,
        }
    },
    {
        'date': '1980-01-01', 'time': '12:00',
        'planets': {
            'Sun': 280.22,
            'Mercury': 268.72,
            'Venus': 312.01,
            'Mars': 164.06,
            'Jupiter': 160.19,
            'Saturn': 176.99,
            'Uranus': 234.07,
            'Neptune': 260.94,
            'Pluto': 201.61,
        }
    },
    {
        'date': '2000-01-01', 'time': '12:00',
        'planets': {
            'Sun': 280.37,
            'Mercury': 271.89,
            'Venus': 241.57,
            'Mars': 327.96,
            'Jupiter': 25.25,
            'Saturn': 40.4,
            'Uranus': 314.81,
            'Neptune': 303.19,
            'Pluto': 251.45,
        }
    },
    {
        'date': '2020-01-01', 'time': '12:00',
        'planets': {
            'Sun': 280.52,
            'Mercury': 275.17,
            'Venus': 315.02,
            'Mars': 238.72,
            'Jupiter': 276.79,
            'Saturn': 291.45,
            'Uranus': 32.69,
            'Neptune': 346.27,
            'Pluto': 292.4,
        }
    },
]

def normalize(angle):
    angle = angle % 360
    if angle < 0:
        angle += 360
    return angle

def get_diff(lon1, lon2):
    d = abs(lon1 - lon2)
    return 360 - d if d > 180 else d
