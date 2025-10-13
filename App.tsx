import React, { useState, useEffect } from 'react';
import './styles/globals.css';

interface FeatureOptions {
  fuel_types: Array<{value: number; label: string}>;
  seller_types: Array<{value: number; label: string}>;
  transmissions: Array<{value: number; label: string}>;
}

interface PredictionResponse {
  success: boolean;
  predicted_price?: number;
  message: string;
  error?: string;
}

const API_BASE = 'http://localhost:5000';

// Default options in case API fails
const DEFAULT_FEATURE_OPTIONS: FeatureOptions = {
  fuel_types: [
    { value: 0, label: 'Petrol' },
    { value: 1, label: 'Diesel' },
    { value: 2, label: 'CNG' }
  ],
  seller_types: [
    { value: 0, label: 'Dealer' },
    { value: 1, label: 'Individual' }
  ],
  transmissions: [
    { value: 0, label: 'Manual' },
    { value: 1, label: 'Automatic' }
  ]
};

function App() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    present_price: '',
    kms_driven: '',
    fuel_type: 0,
    seller_type: 0,
    transmission: 0,
    owner: 0
  });
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureOptions, setFeatureOptions] = useState<FeatureOptions>(DEFAULT_FEATURE_OPTIONS);
  const [apiError, setApiError] = useState('');

  // Load feature options on component mount
  useEffect(() => {
    fetchFeatureOptions();
  }, []);

  const fetchFeatureOptions = async () => {
    try {
      const response = await fetch(`${API_BASE}/features`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeatureOptions(data);
      setApiError('');
    } catch (err) {
      console.error('Failed to load feature options:', err);
      setApiError('Using default options. Backend might not be running.');
      // Keep using default options
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fuel_type' || name === 'seller_type' || name === 'transmission' || name === 'owner' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: parseInt(formData.year.toString()),
          present_price: parseFloat(formData.present_price),
          kms_driven: parseFloat(formData.kms_driven),
          fuel_type: formData.fuel_type,
          seller_type: formData.seller_type,
          transmission: formData.transmission,
          owner: formData.owner
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();

      if (data.success && data.predicted_price !== undefined) {
        setPrediction(data.predicted_price);
      } else {
        setError(data.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to connect to prediction service. Make sure the backend is running on port 5000.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App min-h-screen bg-background py-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-floating"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-floating" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
  <div className="floating mb-8">
    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  </div>
  <h1 className="text-6xl font-bold mb-6" style={{color: '#000000', fontWeight: '800'}}>Car Price Prediction</h1>
  <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{color: '#000000', fontWeight: '600'}}>
    Get an accurate price prediction for your car using our advanced machine learning model
  </p>
  {apiError && (
    <div className="mt-6 p-4 glass-card rounded-2xl border border-yellow-200/50 max-w-2xl mx-auto">
      <p className="text-yellow-600 text-sm font-medium">{apiError}</p>
    </div>
  )}
</div>

        {/* Form Section */}
        <div className="glass-card rounded-3xl border border-white/20 shadow-2xl p-12 mb-16 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-card-foreground mb-4">Car Details</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Basic Information Section */}
            <div className="space-y-12">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-card-foreground inline-flex items-center gap-3 pb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Basic Information
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { name: 'year', label: 'Manufacturing Year', type: 'number', placeholder: 'Enter manufacturing year', min: 1990, max: new Date().getFullYear() },
                  { name: 'present_price', label: 'Present Price (in lakhs)', type: 'number', placeholder: 'Enter current price', step: '0.01', min: '0' },
                  { name: 'kms_driven', label: 'Kilometers Driven', type: 'number', placeholder: 'Enter kilometers driven', min: '0' },
                  { name: 'owner', label: 'Number of Previous Owners', type: 'number', placeholder: '0 to 5', min: '0', max: '5' }
                ].map((field) => (
                  <div key={field.name} className="space-y-4 group">
                    <label className="text-lg font-semibold text-card-foreground block transition-all duration-300 group-hover:text-indigo-600">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      required
                      className="w-full p-5 text-lg border-2 border-white/30 rounded-2xl bg-white/95 text-card-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-white/50"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Car Specifications Section */}
            <div className="space-y-12">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-card-foreground inline-flex items-center gap-3 pb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Car Specifications
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'fuel_type', label: 'Fuel Type', options: featureOptions.fuel_types },
                  { name: 'seller_type', label: 'Seller Type', options: featureOptions.seller_types },
                  { name: 'transmission', label: 'Transmission Type', options: featureOptions.transmissions }
                ].map((field) => (
                  <div key={field.name} className="space-y-4 group">
                    <label className="text-lg font-semibold text-card-foreground block transition-all duration-300 group-hover:text-indigo-600">
                      {field.label}
                    </label>
                    <select
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      required
                      className="w-full p-5 text-lg border-2 border-white/30 rounded-2xl bg-white/95 text-card-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-white/50 appearance-none cursor-pointer"
                    >
                      {field.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-8">
             <button 
  type="submit" 
  disabled={loading}
  className="w-full max-w-md mx-auto py-6 px-12 bg-blue-800 text-white rounded-2xl font-bold text-xl hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl"
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Predicting Price...
    </span>
  ) : (
    <span className="flex items-center justify-center gap-3">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Predict Car Price
    </span>
  )}
</button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="glass-card rounded-3xl border border-white/20 shadow-2xl p-12 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-card-foreground mb-4">Prediction Result</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          {error && (
            <div className="p-8 glass-card border border-red-200/50 rounded-2xl mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-600 font-bold text-xl">Prediction Error</span>
              </div>
              <p className="text-red-600 text-center text-lg">{error}</p>
            </div>
          )}

          {prediction !== null ? (
            <div className="text-center p-12 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-emerald-200 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg floating">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-emerald-800 mb-6">Predicted Car Price</h3>
              <div className="text-7xl font-black text-emerald-900 mb-8 gradient-text">₹{prediction}</div>
              <p className="text-emerald-700 text-2xl font-semibold mb-2">lakhs</p>
              <p className="text-emerald-600 text-lg">Based on the car details you provided</p>
            </div>
          ) : (
            <div className="text-center p-16 border-4 border-dashed border-white/30 rounded-3xl backdrop-blur-sm">
              <div className="w-24 h-24 mx-auto mb-8 opacity-60">
                <svg className="w-full h-full text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-2xl font-medium mb-4">Fill out the form above to get your car's predicted price</p>
              <p className="text-muted-foreground text-lg">Click "Predict Car Price" to see the estimated value</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;