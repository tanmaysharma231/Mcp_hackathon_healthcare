#!/usr/bin/env python3
"""
Simple Lightweight Glucose Forecaster
=====================================

A minimal glucose forecasting system that:
- Uses your generated CSV file
- Trains in <5 minutes
- Makes accurate predictions
- Ready for Bedrock integration

Usage:
    python simple_forecaster.py realistic_30day_t1dm_glucose_data.csv
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pickle
import json
import sys
import warnings
warnings.filterwarnings('ignore')

class SimpleGlucoseForecaster:
    """Lightweight glucose forecasting model"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.stats = {}
    
    def load_csv(self, csv_path: str) -> pd.DataFrame:
        """Load and prepare CSV data"""
        print(f"📂 Loading {csv_path}...")
        
        df = pd.read_csv(csv_path)
        
        # Handle different column names
        if 'blood_glucose' in df.columns:
            df['glucose'] = df['blood_glucose']
        if 'premeal_bolus_units' in df.columns:
            df['insulin'] = df['premeal_bolus_units']
        
        # Ensure required columns exist
        if 'glucose' not in df.columns:
            raise ValueError("No glucose column found")
        
        # Fill missing columns
        for col in ['insulin', 'carbs']:
            if col not in df.columns:
                df[col] = 0
        
        # Handle timestamp
        if 'datetime' in df.columns:
            df['timestamp'] = pd.to_datetime(df['datetime'])
        elif 'date' in df.columns and 'time' in df.columns:
            df['timestamp'] = pd.to_datetime(df['date'] + ' ' + df['time'])
        else:
            # Create timestamps
            start_time = datetime(2024, 1, 1, 6, 0)
            df['timestamp'] = [start_time + timedelta(minutes=5*i) for i in range(len(df))]
        
        # Extract time features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'] >= 5
        
        # Clean data
        df = df[df['glucose'].between(40, 400)].copy()
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        print(f"✅ Loaded {len(df):,} readings")
        print(f"   Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
        print(f"   Glucose range: {df['glucose'].min():.0f}-{df['glucose'].max():.0f} mg/dL")
        
        return df
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create simple but effective features"""
        print("🔧 Creating features...")
        
        # Lag features (recent glucose history)
        for lag in [1, 2, 3, 6, 12]:  # 5min to 1hr history
            df[f'glucose_lag_{lag}'] = df['glucose'].shift(lag)
        
        # Rolling averages
        for window in [6, 12, 24]:  # 30min, 1hr, 2hr averages
            df[f'glucose_avg_{window}'] = df['glucose'].rolling(window).mean()
        
        # Glucose change rate
        df['glucose_change'] = df['glucose'].diff()
        df['glucose_trend'] = df['glucose'].rolling(6).apply(
            lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) > 1 else 0
        )
        
        # Insulin and carbs with lag
        df['insulin_lag1'] = df['insulin'].shift(1)
        df['carbs_lag1'] = df['carbs'].shift(1)
        df['insulin_sum_12'] = df['insulin'].rolling(12).sum()  # Recent insulin
        
        # Time features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['is_weekend_num'] = df['is_weekend'].astype(int)
        
        # Remove NaN rows
        df = df.dropna()
        
        print(f"✅ Created features: {len(df):,} samples ready")
        return df
    
    def train(self, csv_path: str):
        """Train the forecasting model"""
        print("🧬 Training Simple Glucose Forecaster...")
        
        # Load and prepare data
        df = self.load_csv(csv_path)
        df = self.create_features(df)
        
        # Calculate statistics
        self.stats = {
            'total_readings': len(df),
            'mean_glucose': df['glucose'].mean(),
            'std_glucose': df['glucose'].std(),
            'time_in_range': ((df['glucose'] >= 70) & (df['glucose'] <= 180)).mean() * 100,
            'time_below_70': (df['glucose'] < 70).mean() * 100,
            'time_above_180': (df['glucose'] > 180).mean() * 100
        }
        
        print(f"📊 Data Stats:")
        print(f"   Mean glucose: {self.stats['mean_glucose']:.1f} mg/dL")
        print(f"   Time in range: {self.stats['time_in_range']:.1f}%")
        
        # Prepare features for ML
        feature_cols = [col for col in df.columns if col not in 
                       ['glucose', 'timestamp', 'date', 'time', 'food', 'datetime']]
        
        X = df[feature_cols]
        y = df['glucose']
        
        # Split data (80% train, 20% test)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        # Scale features
        from sklearn.preprocessing import StandardScaler
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.metrics import mean_squared_error, r2_score
        
        print("🌲 Training model...")
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred_test = self.model.predict(X_test_scaled)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        r2 = r2_score(y_test, y_pred_test)
        
        self.stats.update({
            'test_rmse': rmse,
            'test_r2': r2,
            'feature_columns': feature_cols
        })
        
        self.is_trained = True
        
        print("✅ Training completed!")
        print(f"📈 Performance:")
        print(f"   RMSE: {rmse:.1f} mg/dL")
        print(f"   R²: {r2:.3f}")
        
        # Show important features
        importances = self.model.feature_importances_
        feature_importance = list(zip(feature_cols, importances))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        print(f"🔍 Top features:")
        for feature, importance in feature_importance[:5]:
            print(f"   {feature}: {importance:.3f}")
    
    def predict_next_hours(self, csv_path: str, hours: float = 2.0) -> dict:
        """Predict glucose for next N hours"""
        if not self.is_trained:
            raise ValueError("Model not trained!")
        
        # Load recent data
        df = self.load_csv(csv_path)
        df = self.create_features(df)
        
        # Use last row for prediction
        last_row = df[self.stats['feature_columns']].iloc[-1:].values
        last_row_scaled = self.scaler.transform(last_row)
        
        # Predict multiple steps
        periods = int(hours * 12)  # 5-minute intervals
        predictions = []
        
        current_features = last_row_scaled.copy()
        
        for _ in range(periods):
            pred = self.model.predict(current_features)[0]
            pred = max(40, min(400, pred))  # Keep realistic bounds
            predictions.append(pred)
            
            # Simple feature update (shift glucose lags)
            if len(current_features[0]) >= 5:
                for i in range(4, 0, -1):
                    current_features[0][i] = current_features[0][i-1]
                current_features[0][0] = (pred - self.stats['mean_glucose']) / self.stats['std_glucose']
        
        # Generate timestamps
        last_time = df['timestamp'].iloc[-1]
        future_times = [last_time + timedelta(minutes=5*(i+1)) for i in range(periods)]
        
        # Calculate confidence interval
        rmse = self.stats['test_rmse']
        lower_bound = [p - 1.5 * rmse for p in predictions]
        upper_bound = [p + 1.5 * rmse for p in predictions]
        
        return {
            'forecast_hours': hours,
            'predictions': predictions,
            'timestamps': [t.strftime('%Y-%m-%d %H:%M') for t in future_times],
            'confidence_lower': lower_bound,
            'confidence_upper': upper_bound,
            'next_reading': predictions[0],
            'rmse': rmse
        }
    
    def analyze_patterns(self, csv_path: str) -> dict:
        """Analyze glucose patterns"""
        df = self.load_csv(csv_path)
        
        # Hourly patterns
        hourly_avg = df.groupby('hour')['glucose'].mean()
        
        # Daily patterns
        daily_avg = df.groupby('day_of_week')['glucose'].mean()
        weekend_avg = df[df['is_weekend']]['glucose'].mean()
        weekday_avg = df[~df['is_weekend']]['glucose'].mean()
        
        return {
            'hourly_patterns': {
                'peak_hour': hourly_avg.idxmax(),
                'lowest_hour': hourly_avg.idxmin(),
                'hourly_averages': hourly_avg.to_dict()
            },
            'daily_patterns': {
                'weekend_avg': weekend_avg,
                'weekday_avg': weekday_avg,
                'difference': weekend_avg - weekday_avg
            },
            'overall_stats': {
                'mean': df['glucose'].mean(),
                'std': df['glucose'].std(),
                'min': df['glucose'].min(),
                'max': df['glucose'].max()
            }
        }
    
    def save_model(self, path: str = 'simple_glucose_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'stats': self.stats,
            'is_trained': self.is_trained
        }
        
        with open(path, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"💾 Model saved to {path}")
    
    def load_model(self, path: str):
        """Load a saved model"""
        with open(path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.stats = model_data['stats']
        self.is_trained = model_data['is_trained']
        print(f"📂 Model loaded from {path}")


def demo_forecaster(csv_file: str):
    """Demo the forecaster with a CSV file"""
    print("🧬 Simple Glucose Forecaster Demo")
    print("=" * 50)
    
    # Initialize and train
    forecaster = SimpleGlucoseForecaster()
    forecaster.train(csv_file)
    
    # Save model
    forecaster.save_model()
    
    # Test predictions
    print(f"\n🔮 Testing Predictions...")
    
    # 2-hour forecast
    forecast = forecaster.predict_next_hours(csv_file, 2.0)
    print(f"📈 Next glucose (5 min): {forecast['next_reading']:.1f} mg/dL")
    print(f"📈 2-hour trend: {forecast['predictions'][0]:.1f} → {forecast['predictions'][-1]:.1f} mg/dL")
    
    # Pattern analysis
    patterns = forecaster.analyze_patterns(csv_file)
    print(f"\n📊 Pattern Analysis:")
    print(f"   Peak glucose hour: {patterns['hourly_patterns']['peak_hour']:02d}:00")
    print(f"   Lowest glucose hour: {patterns['hourly_patterns']['lowest_hour']:02d}:00")
    print(f"   Weekend vs Weekday: {patterns['daily_patterns']['difference']:.1f} mg/dL difference")
    
    print(f"\n✅ Demo completed! Model saved as 'simple_glucose_model.pkl'")
    return forecaster


# Bedrock Integration Functions
def bedrock_forecast_query(csv_file: str, hours: float = 2.0) -> dict:
    """Bedrock-compatible glucose forecasting"""
    forecaster = SimpleGlucoseForecaster()
    
    # Try to load existing model, otherwise train new one
    try:
        forecaster.load_model('simple_glucose_model.pkl')
    except FileNotFoundError:
        forecaster.train(csv_file)
        forecaster.save_model()
    
    return forecaster.predict_next_hours(csv_file, hours)


def bedrock_pattern_query(csv_file: str, pattern_type: str = 'hourly') -> dict:
    """Bedrock-compatible pattern analysis"""
    forecaster = SimpleGlucoseForecaster()
    patterns = forecaster.analyze_patterns(csv_file)
    
    if pattern_type == 'hourly':
        return patterns['hourly_patterns']
    elif pattern_type == 'daily':
        return patterns['daily_patterns']
    else:
        return patterns['overall_stats']


# Main execution
if __name__ == "__main__":
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        if csv_file.endswith('.csv'):
            demo_forecaster(csv_file)
        else:
            print("❌ Please provide a CSV file")
    else:
        # Try to find the generated CSV file
        import os
        possible_files = [
            'realistic_30day_t1dm_glucose_data.csv',
            'glucose_data.csv',
            'blood_glucose_data.csv'
        ]
        
        found_file = None
        for filename in possible_files:
            if os.path.exists(filename):
                found_file = filename
                break
        
        if found_file:
            print(f"📂 Found {found_file}, running demo...")
            demo_forecaster(found_file)
        else:
            print("📝 Usage: python simple_forecaster.py your_glucose_data.csv")
            print("\n📋 Expected CSV columns:")
            print("  - glucose/blood_glucose (required)")
            print("  - timestamp/datetime/date+time (optional)")
            print("  - insulin/premeal_bolus_units (optional)")
            print("  - carbs (optional)")
            
            print("\n🚀 Bedrock Integration Examples:")
            print("```python")
            print("# Forecast glucose")
            print("result = bedrock_forecast_query('your_data.csv', hours=2)")
            print("print(f'Next glucose: {result[\"next_reading\"]:.1f} mg/dL')")
            print("")
            print("# Analyze patterns")
            print("patterns = bedrock_pattern_query('your_data.csv', 'hourly')")
            print("print(f'Peak hour: {patterns[\"peak_hour\"]}:00')")
            print("```")