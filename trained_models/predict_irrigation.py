"""
Farm AI Irrigation Estimator - Prediction Script
Loads irrigation_model.joblib and generates daily irrigation requirements (mm/day).
Handles cross-version scikit-learn unpickling compatibility.
"""

import sys
import json
import warnings
import os

warnings.filterwarnings('ignore')

# Cross-version compatibility patch for scikit-learn (e.g. 1.6.1 saved -> 1.7+/1.9+ runtime)
try:
    import sklearn.compose._column_transformer as ct
    class _RemainderColsList(list):
        pass
    ct._RemainderColsList = _RemainderColsList
except Exception:
    pass

try:
    import sklearn.impute._base as ib
    ib.SimpleImputer._fill_dtype = property(lambda self: getattr(self, '_fit_dtype', float))
except Exception:
    pass

import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'irrigation_model.joblib')
METADATA_PATH = os.path.join(os.path.dirname(__file__), 'irrigation_metadata.json')

_model = None

def get_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict(features_dict):
    """
    Predict irrigation_target_mm for a single row or batch of features.
    """
    model = get_model()
    df = pd.DataFrame([features_dict] if isinstance(features_dict, dict) else features_dict)
    preds = model.predict(df)
    return preds.tolist()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
        try:
            data = json.loads(raw_input)
            result = predict(data)
            print(json.dumps({'status': 'success', 'irrigation_target_mm': result[0]}))
        except Exception as e:
            print(json.dumps({'status': 'error', 'message': str(e)}))
    else:
        sample = {
            'temperature_avg_c': 28.5,
            'temperature_max_c': 34.0,
            'temperature_min_c': 23.0,
            'relative_humidity_pct': 65.0,
            'rainfall_mm': 0.0,
            'wind_speed_2m_ms': 2.5,
            'solar_radiation_mj_m2_day': 18.0,
            'et0_mm_day': 4.5,
            'kc': 1.15,
            'available_water_mm_m': 150,
            'root_depth_m': 0.3,
            'allowable_depletion': 0.4,
            'crop': 'tomato',
            'growth_stage': 'mid',
            'soil_type': 'loamy'
        }
        res = predict(sample)
        print(f"Sample Prediction: {res[0]:.2f} mm/day")
