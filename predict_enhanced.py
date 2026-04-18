"""
Enhanced CO2 emission prediction script with visualization.

This script now uses the same backend ML service as the API so local predictions
and API predictions stay consistent.
"""

import sys
from pathlib import Path

import pandas as pd

# Add backend directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.services.ml_model_service import ml_service
from app.services.visualization_service import VisualizationService


def main():
    """Run a local prediction using the same service as the API."""
    print("\n" + "=" * 60)
    print("Vehicle CO2 Emission Prediction System")
    print("=" * 60 + "\n")

    print("Please enter vehicle specifications:\n")

    try:
        make = input("Make (e.g., ACURA): ").strip().upper() or "ACURA"
        model = input("Model (e.g., ILX): ").strip().upper() or "ILX"
        engine_size = float(input("Engine Size (L, e.g., 2.0): "))
        cylinders = int(input("Number of Cylinders (e.g., 4): "))
        city = float(input("Fuel Consumption City (L/100km, e.g., 9.0): "))
        highway = float(input("Fuel Consumption Highway (L/100km, e.g., 7.0): "))
        combined = float(input("Fuel Consumption Combined (L/100km, e.g., 8.0): "))
        fuel_type = input("Fuel Type (X, Z, D, E, N): ").strip().upper()
        vehicle_class = input("Vehicle Class (e.g., COMPACT): ").strip().upper()
        transmission = input("Transmission (AS6, M5, A6, etc.): ").strip().upper()
    except ValueError as e:
        print(f"\nError: Invalid input - {e}")
        return

    input_data = {
        "make": make,
        "model": model,
        "engine_size": engine_size,
        "cylinders": cylinders,
        "fuel_consumption_city": city,
        "fuel_consumption_highway": highway,
        "fuel_consumption_combined": combined,
        "fuel_type": fuel_type,
        "vehicle_class": vehicle_class,
        "transmission": transmission,
    }

    df = pd.DataFrame([input_data])

    print("\n" + "-" * 60)
    print("Input Data Summary:")
    print("-" * 60)
    print(df.to_string(index=False))

    print("\nLoading model...")

    try:
        predicted_co2, rating, confidence = ml_service.predict(
            make,
            model,
            engine_size,
            cylinders,
            city,
            highway,
            combined,
            fuel_type,
            vehicle_class,
            transmission,
        )
    except Exception as e:
        print(f"Error running prediction: {e}")
        return

    print("\n" + "=" * 60)
    print("PREDICTION RESULTS")
    print("=" * 60)
    print(f"Predicted CO2 Emission: {predicted_co2:.2f} g/km")
    print(f"Emission Rating:       {rating}")
    print(f"Confidence:            {confidence * 100:.1f}%")
    print("=" * 60 + "\n")

    print("Emission Rating Scale:")
    print("  Very Low:  <= 100 g/km")
    print("  Low:       101-130 g/km")
    print("  Moderate:  131-160 g/km")
    print("  High:      161-200 g/km")
    print("  Very High: > 200 g/km\n")

    print("Generating prediction diagram...")

    input_data_with_results = {
        **input_data,
        "predicted_co2": predicted_co2,
        "rating": rating,
        "created_at": pd.Timestamp.now(),
    }

    try:
        file_path, _ = VisualizationService.create_dataframe_diagram(
            input_data_with_results
        )

        if file_path:
            print(f"Diagram saved to: {file_path}\n")
        else:
            print("Failed to generate diagram\n")

    except Exception as e:
        print(f"Error generating diagram: {e}\n")

    try:
        records_path = Path(__file__).parent / "reports" / "predictions.csv"
        records_path.parent.mkdir(exist_ok=True)

        record_df = pd.DataFrame(
            [
                {
                    "timestamp": pd.Timestamp.now(),
                    "make": make,
                    "model": model,
                    "engine_size": engine_size,
                    "cylinders": cylinders,
                    "fuel_consumption_city": city,
                    "fuel_consumption_highway": highway,
                    "fuel_consumption_combined": combined,
                    "fuel_type": fuel_type,
                    "vehicle_class": vehicle_class,
                    "transmission": transmission,
                    "predicted_co2": predicted_co2,
                    "rating": rating,
                    "confidence": confidence,
                }
            ]
        )

        if records_path.exists():
            existing_df = pd.read_csv(records_path)
            record_df = pd.concat([existing_df, record_df], ignore_index=True)

        record_df.to_csv(records_path, index=False)
        print(f"Prediction record saved to: {records_path}\n")

    except Exception as e:
        print(f"Error saving record: {e}\n")

    print("=" * 60)
    print("Prediction complete!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
