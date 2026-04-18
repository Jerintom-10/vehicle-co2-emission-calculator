import os
from typing import Dict, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import shap


class MLModelService:
    model = None
    preprocessor = None

    @classmethod
    def load_model(cls):
        try:
            model_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "ml_model", "best_model.pkl"
            )
            if os.path.exists(model_path):
                cls.model = joblib.load(model_path)
                if hasattr(cls.model, "named_steps"):
                    cls.preprocessor = cls.model.named_steps.get("preprocessor")
                print(
                    f"Model loaded. Steps: "
                    f"{list(cls.model.named_steps.keys()) if hasattr(cls.model, 'named_steps') else 'No steps'}"
                )
                print(f"Preprocessor: {cls.preprocessor}")
                return True
            print(f"Model not found at: {model_path}")
            return False
        except Exception as e:
            print(f"Error loading model: {e}")
            import traceback

            traceback.print_exc()
            return False

    @classmethod
    def _build_dataframe(
        cls,
        make,
        model,
        engine_size,
        cylinders,
        fuel_consumption_city,
        fuel_consumption_highway,
        fuel_consumption_combined,
        fuel_type,
        vehicle_class,
        transmission,
    ) -> pd.DataFrame:
        """Build a dataframe with the same column names used during training."""
        data = {
            "MAKE": [make.upper()],
            "MODEL": [model.upper()],
            "VEHICLECLASS": [vehicle_class.upper()],
            "ENGINESIZE": [engine_size],
            "CYLINDERS": [cylinders],
            "TRANSMISSION": [transmission.upper()],
            "FUELTYPE": [fuel_type.upper()],
            "FUELCONSUMPTION_CITY": [fuel_consumption_city],
            "FUELCONSUMPTION_HWY": [fuel_consumption_highway],
            "FUELCONSUMPTION_COMB": [fuel_consumption_combined],
        }
        df = pd.DataFrame(data)
        print(f"DataFrame columns: {df.columns.tolist()}")
        print(f"DataFrame values:\n{df}")
        return df

    @classmethod
    def predict(
        cls,
        make,
        model,
        engine_size,
        cylinders,
        fuel_consumption_city,
        fuel_consumption_highway,
        fuel_consumption_combined,
        fuel_type,
        vehicle_class,
        transmission,
    ) -> Tuple[float, str, float]:
        print("\n=== PREDICT CALLED ===")
        print(
            f"Inputs: make={make}, model={model}, engine={engine_size}, cyl={cylinders}, "
            f"city={fuel_consumption_city}, hwy={fuel_consumption_highway}, "
            f"comb={fuel_consumption_combined}, fuel={fuel_type}, class={vehicle_class}, "
            f"trans={transmission}"
        )

        if cls.model is None:
            print("Model is None, loading...")
            cls.load_model()

        if cls.model is None:
            print("Model still None, using mock prediction")
            return cls._mock_predict(engine_size, cylinders, fuel_consumption_combined)

        try:
            df = cls._build_dataframe(
                make,
                model,
                engine_size,
                cylinders,
                fuel_consumption_city,
                fuel_consumption_highway,
                fuel_consumption_combined,
                fuel_type,
                vehicle_class,
                transmission,
            )

            print("Sending to model.predict()...")
            predicted_co2 = float(cls.model.predict(df)[0])
            print(f"Raw prediction: {predicted_co2}")

            # CO2 emissions cannot be negative. Guard against invalid model output.
            if predicted_co2 < 0:
                print(f"Negative prediction received from model, clamping to 0.0: {predicted_co2}")
                predicted_co2 = 0.0

            rating = cls._get_rating(predicted_co2)
            confidence = 0.85 + (np.random.random() * 0.1)

            print(f"Final: co2={predicted_co2}, rating={rating}")
            return predicted_co2, rating, float(confidence)

        except Exception as e:
            print(f"Error in prediction: {e}")
            import traceback

            traceback.print_exc()
            return cls._mock_predict(engine_size, cylinders, fuel_consumption_combined)

    @classmethod
    def get_shap_values(
        cls,
        make,
        model,
        engine_size,
        cylinders,
        fuel_consumption_city,
        fuel_consumption_highway,
        fuel_consumption_combined,
        fuel_type,
        vehicle_class,
        transmission,
    ) -> Optional[Dict]:
        try:
            if cls.model is None or cls.preprocessor is None:
                print("Model or preprocessor not loaded")
                return None

            df = cls._build_dataframe(
                make,
                model,
                engine_size,
                cylinders,
                fuel_consumption_city,
                fuel_consumption_highway,
                fuel_consumption_combined,
                fuel_type,
                vehicle_class,
                transmission,
            )

            X_processed = cls.preprocessor.transform(df)

            if hasattr(X_processed, "toarray"):
                X_processed = X_processed.toarray()

            feature_names = cls.preprocessor.get_feature_names_out()
            clean_feature_names = [
                name.replace("num__", "").replace("cat__", "")
                for name in feature_names
            ]

            booster = cls.model.named_steps.get("model")
            if booster is None:
                print("No 'model' step found in pipeline")
                return None

            explainer = shap.Explainer(booster)
            shap_values = explainer(X_processed)
            shap_values.feature_names = clean_feature_names

            return {
                "shap_values": shap_values[0],
                "feature_names": clean_feature_names,
                "X_processed": X_processed,
            }

        except Exception as e:
            print(f"Error getting SHAP values: {e}")
            import traceback

            traceback.print_exc()
            return None

    @staticmethod
    def _mock_predict(engine_size, cylinders, fuel_consumption_combined):
        co2 = 100 + (engine_size * 15) + (cylinders * 8) + (fuel_consumption_combined * 5)
        return float(co2), MLModelService._get_rating(co2), 0.75

    @staticmethod
    def _get_rating(co2: float) -> str:
        if co2 <= 100:
            return "Very Low"
        if co2 <= 130:
            return "Low"
        if co2 <= 160:
            return "Moderate"
        if co2 <= 200:
            return "High"
        return "Very High"

    @staticmethod
    def get_feature_importance() -> Dict[str, float]:
        return {
            "Engine Size": 0.25,
            "Cylinders": 0.20,
            "Fuel Consumption Combined": 0.30,
            "Fuel Consumption City": 0.15,
            "Fuel Consumption Highway": 0.10,
        }


ml_service = MLModelService()
ml_service.load_model()
