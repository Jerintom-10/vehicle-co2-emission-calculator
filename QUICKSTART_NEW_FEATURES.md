# Quick Start Guide - New Features

## 🎯 Dataframe Diagrams & Download Features

This guide shows how to use the newly implemented dataframe diagram and download features in EcoVehicle.

---

## 📊 Features Overview

### 1. Dataframe Diagrams After Prediction
After making a prediction, you can now:
- **View Diagram** - See a comprehensive 4-panel visualization of your input data
- **Download PNG** - Save the diagram as a high-quality PNG image
- **View Analysis** - See comparison charts of your prediction history

### 2. Backend APIs

#### Get Prediction Diagram (PNG)
```bash
curl -X GET "http://localhost:8000/api/predictions/diagram/{prediction_id}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o prediction_diagram.png
```

#### Get Diagram Preview (Base64)
```bash
curl -X GET "http://localhost:8000/api/predictions/diagram-preview/{prediction_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Comparison Chart
```bash
curl -X GET "http://localhost:8000/api/predictions/comparison/chart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🖥️ Frontend Usage

### History Page Enhanced Features

#### 1. View Prediction Diagram
1. Go to **Prediction History** page
2. Find your prediction in the table
3. Click **📈 Diagram** button
4. A modal will open showing:
   - Numeric features bar chart
   - Categorical features summary
   - Fuel consumption comparison
   - Vehicle information table

#### 2. Download PNG Diagram
1. From History page, click **⬇️ PNG** button
2. High-quality PNG will be downloaded to your device
3. File name: `prediction_diagram_{prediction_id}.png`

#### 3. View Analysis Chart
1. Click **📊 View Analysis Chart** button in History page header
2. Modal opens showing:
   - CO2 emission trend over time
   - Emission rating distribution
3. Shows total number of predictions

#### 4. Download Comparison Chart
1. Open the Analysis Chart modal
2. Click **Download Chart (PNG)** button
3. Chart is saved as `prediction_comparison_chart.png`

#### 5. View Statistics
The History page displays real-time statistics:
- **Total Predictions** - Count of all predictions
- **Average CO2** - Mean emissions across predictions
- **Highest CO2** - Maximum emission value
- **Lowest CO2** - Minimum emission value

---

## 💻 Command Line Usage

### Enhanced Local Prediction Script

Run the enhanced prediction script with visualization:

```bash
python predict_enhanced.py
```

**Features:**
- Interactive CLI for entering vehicle specs
- Automatic diagram generation
- Saves prediction records to CSV
- Generates output in `reports/` folder

**Example Output:**
```
============================================================
🚗 Vehicle CO2 Emission Prediction System
============================================================

Please enter vehicle specifications:

Engine Size (L, e.g., 2.0): 2.5
Number of Cylinders (e.g., 4): 6
Fuel Consumption City (L/100km, e.g., 9.0): 10.5
Fuel Consumption Highway (L/100km, e.g., 7.0): 7.8
Fuel Consumption Combined (L/100km, e.g., 8.0): 9.0
Fuel Type (X, Z, D, E): D
Vehicle Class (SUV, COMPACT, MID-SIZE, etc.): SUV
Transmission (AS6, M5, A6, etc.): A6
Vehicle Make (e.g., Toyota): Ford
Vehicle Model (e.g., Camry): Explorer

------------------------------------------------------------
📊 Input Data Summary:
------------------------------------------------------------
engine_size    cylinders  fuel_consumption_city  ... model
2.5            6          10.5                   ... Explorer

============================================================
✅ PREDICTION RESULTS
============================================================
Predicted CO2 Emission: 245.50 g/km
Emission Rating:       High
Confidence:            85.0%
============================================================

🎨 Generating prediction diagram...
✅ Diagram saved to: .../reports/prediction_diagram.png

✅ Prediction record saved to: .../reports/predictions.csv

============================================================
✨ Prediction complete!
============================================================
```

---

## 📁 Generated Files

### Diagrams Directory: `reports/`

```
reports/
├── prediction_diagram.png          # Latest diagram from predict_enhanced.py
├── predictions.csv                 # CSV log of all predictions
└── [Downloaded from UI]
    ├── prediction_diagram_<id>.png
    └── prediction_comparison_chart.png
```

---

## 🎨 Diagram Components

### Dataframe Diagram (4 Panels)

**Panel 1: Numeric Features**
- Bar chart showing engine size, cylinders, fuel consumption values

**Panel 2: Categorical Features**
- Displays fuel type, vehicle class, transmission

**Panel 3: Fuel Consumption**
- Comparison chart of city vs highway vs combined consumption

**Panel 4: Vehicle Information**
- Summary table with vehicle make, model, engine size, cylinders

### Comparison Chart (2 Panels)

**Panel 1: CO2 Trend**
- Line chart showing CO2 emission over prediction history
- Helps track changes over time

**Panel 2: Rating Distribution**
- Bar/pie chart of emission rating frequency
- Shows breakdown of predictions by rating category

---

## 🔐 Authentication

All diagram endpoints require authentication:

```javascript
// Frontend example
const token = localStorage.getItem('token')
const response = await fetch('/api/predictions/diagram-preview/{id}', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🌐 API Response Examples

### Diagram Preview Response
```json
{
  "status": "success",
  "diagram": "iVBORw0KGgoAAAANSUhEUgAAA...[base64 data]...==",
  "prediction_id": "507f1f77bcf86cd799439011"
}
```

### Comparison Chart Response
```json
{
  "status": "success",
  "chart": "iVBORw0KGgoAAAANSUhEUgAAA...[base64 data]...==",
  "total_predictions": 5
}
```

---

## 🚀 Deployment Checklist

- [ ] Verify `matplotlib` and `pandas` are in `requirements.txt`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Test diagram generation on your system
- [ ] Verify MongoDB connection for saving predictions
- [ ] Test API endpoints with authentication tokens
- [ ] Test UI components in browser
- [ ] Test mobile responsiveness
- [ ] Verify file downloads work correctly
- [ ] Test error handling with invalid predictions

---

## 🆘 Troubleshooting

### Issue: Diagram Not Generating
**Solution:**
1. Check that matplotlib is installed: `pip list | grep matplotlib`
2. Verify matplotlib backend is 'Agg' (non-interactive)
3. Check system has enough disk space
4. Review server logs for errors

### Issue: Download Not Working
**Solution:**
1. Clear browser cache
2. Check browser download settings
3. Verify file permissions
4. Try different browser

### Issue: Preview Not Showing
**Solution:**
1. Check base64 encoding is correct
2. Verify image data is complete
3. Check browser console for errors
4. Ensure proper CORS headers

### Issue: Slow Diagram Generation
**Solution:**
1. Reduce DPI from 100 to 75 in visualization_service.py
2. Reduce figure size if needed
3. Check server resources
4. Consider caching frequently generated diagrams

---

## 📞 Support

For issues or questions:
1. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed documentation
2. Review API endpoint signatures in [predictions.py](./backend/app/routes/predictions.py)
3. Check component source in [DiagramViewer.jsx](./frontend/src/components/DiagramViewer.jsx)
4. Review visualization logic in [visualization_service.py](./backend/app/services/visualization_service.py)

---

## 📝 Notes

- All diagrams are generated on-demand
- Base64 previews are optimal for UI display
- PNG downloads are suitable for reports and sharing
- Comparison charts update automatically with new predictions
- All operations require valid authentication token
- Diagrams respect user privacy (owner-only access)

---

**Enjoy your enhanced EcoVehicle experience! 🌱**
