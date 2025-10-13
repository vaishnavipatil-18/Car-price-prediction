from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import Lasso
from sklearn import metrics
import joblib
import os

app = Flask(__name__)
CORS(app)  # This handles all CORS issues automatically

# Load and train model (same as your original ML code)
def load_and_train_model():
    try:
        # Load your dataset
        car_dataset = pd.read_csv('car data.csv')
        
        # inspecting the first 5 rows of the dataframe
        print("Dataset shape:", car_dataset.shape)
        print("First 5 rows:")
        print(car_dataset.head())
        
        # checking the number of missing values
        print("Missing values:", car_dataset.isnull().sum())
        
        # checking the distribution of categorical data
        print("Fuel Type distribution:", car_dataset.Fuel_Type.value_counts())
        print("Seller Type distribution:", car_dataset.Seller_Type.value_counts())
        print("Transmission distribution:", car_dataset.Transmission.value_counts())
        
        # encoding "Fuel_Type" Column
        car_dataset.replace({'Fuel_Type':{'Petrol':0,'Diesel':1,'CNG':2}},inplace=True)
        
        # encoding "Seller_Type" Column
        car_dataset.replace({'Seller_Type':{'Dealer':0,'Individual':1}},inplace=True)
        
        # encoding "Transmission" Column
        car_dataset.replace({'Transmission':{'Manual':0,'Automatic':1}},inplace=True)
        
        print("Dataset after encoding:")
        print(car_dataset.head())
        
        X = car_dataset.drop(['Car_Name','Selling_Price'],axis=1)
        Y = car_dataset['Selling_Price']
        
        print("Features (X):", X.shape)
        print("Target (Y):", Y.shape)
        
        # Train Linear Regression model (using your preferred model)
        model = LinearRegression()
        model.fit(X, Y)
        
        # Calculate training accuracy
        training_prediction = model.predict(X)
        error_score = metrics.r2_score(Y, training_prediction)
        print(f"Model R-squared Error: {error_score}")
        
        # Save the model
        joblib.dump(model, 'car_price_model.pkl')
        print("✅ Model trained and saved successfully")
        
        return model
        
    except Exception as e:
        print(f"❌ Error in model training: {e}")
        return None

# Try to load existing model or train new one
model = None
try:
    model = joblib.load('car_price_model.pkl')
    print("✅ Loaded pre-trained model")
except Exception as e:
    print(f"🔄 Training new model... Error: {e}")
    model = load_and_train_model()

@app.route('/predict', methods=['POST'])
def predict_price():
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'message': 'Prediction model is not available'
            }), 500
            
        # Get data from request
        data = request.json
        print("📥 Received prediction request:", data)
        
        # Prepare features in the same order as training
        # Order: Year, Present_Price, Kms_Driven, Fuel_Type, Seller_Type, Transmission, Owner
        features = np.array([[
            data['year'],           # Year
            data['present_price'],  # Present_Price
            data['kms_driven'],     # Kms_Driven
            data['fuel_type'],      # Fuel_Type
            data['seller_type'],    # Seller_Type
            data['transmission'],   # Transmission
            data['owner']           # Owner
        ]])
        
        print("🔧 Features prepared:", features)
        
        # Make prediction
        prediction = model.predict(features)
        predicted_price = round(prediction[0], 2)
        
        print(f"🎯 Prediction made: {predicted_price}")
        
        return jsonify({
            'success': True,
            'predicted_price': predicted_price,
            'message': 'Price prediction successful'
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error in prediction'
        }), 400

@app.route('/features', methods=['GET'])
def get_features():
    """Return available options for categorical features"""
    return jsonify({
        'fuel_types': [
            {'value': 0, 'label': 'Petrol'},
            {'value': 1, 'label': 'Diesel'},
            {'value': 2, 'label': 'CNG'}
        ],
        'seller_types': [
            {'value': 0, 'label': 'Dealer'},
            {'value': 1, 'label': 'Individual'}
        ],
        'transmissions': [
            {'value': 0, 'label': 'Manual'},
            {'value': 1, 'label': 'Automatic'}
        ]
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'message': 'Car Price Prediction API is running'
    })

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Car Price Prediction API',
        'endpoints': {
            'GET /features': 'Get feature options',
            'POST /predict': 'Make price prediction',
            'GET /health': 'Health check'
        }
    })

if __name__ == '__main__':
    print("🚗 Car Price Prediction API Starting...")
    print("=" * 50)
    
    if model is not None:
        print("✅ ML Model: Loaded successfully")
    else:
        print("❌ ML Model: Failed to load")
        
    print("📍 Server: http://localhost:5000")
    print("📊 Available Endpoints:")
    print("   GET  /          - API information")
    print("   GET  /features  - Get feature options")
    print("   POST /predict   - Make price prediction")
    print("   GET  /health    - Health check")
    print("=" * 50)
    print("✅ Backend is ready to receive requests!")
    
    app.run(debug=True, port=5000, host='0.0.0.0')