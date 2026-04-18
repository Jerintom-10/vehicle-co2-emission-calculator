import pandas as pd
import json

# Read CSV
df = pd.read_csv(r'c:\Users\Asus\Desktop\Main_Project - draft 1\data\FuelConsumptionCo2.csv')

# Get unique makes
makes = sorted(df['MAKE'].unique().tolist())

# Create make->models mapping
vehicles = {}
for make in makes:
    models = sorted(df[df['MAKE'] == make]['MODEL'].unique().tolist())
    vehicles[make] = models

# Write to JSON
with open(r'd:\Final-Project\frontend\src\data\vehicles.json', 'w') as f:
    json.dump(vehicles, f, indent=2)

print(f"✓ Extracted {len(vehicles)} makes")
print(f"✓ Total models: {sum(len(m) for m in vehicles.values())}")
print(f"✓ Saved to frontend/src/data/vehicles.json")

# Print sample
import itertools
sample = dict(itertools.islice(vehicles.items(), 3))
print(f"\nSample:\n{json.dumps(sample, indent=2)}")
