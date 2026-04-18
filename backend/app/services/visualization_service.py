"""Service for generating visualization diagrams with SHAP explanations"""

from typing import Dict, Tuple, Optional
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
import io
import base64
from datetime import datetime
import shap
import os

# Use non-interactive backend
matplotlib.use('Agg')

class VisualizationService:
    """Generate visualizations for prediction data"""
    
    # Use uploads folder for storing diagrams
    UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    
    @classmethod
    def ensure_uploads_dir(cls):
        """Create uploads directory if it doesn't exist"""
        if not os.path.exists(cls.UPLOADS_DIR):
            os.makedirs(cls.UPLOADS_DIR)
            print(f"Created uploads directory: {cls.UPLOADS_DIR}")
    
    @classmethod
    def create_shap_waterfall_diagram(cls, shap_explainer_data) -> Tuple[Optional[str], Optional[str]]:
        """
        Create a SHAP waterfall plot showing feature contributions to prediction
        Saves to disk and returns (file_path, base64_string) or (None, None) on failure
        """
        try:
            if shap_explainer_data is None:
                print("SHAP data is None")
                return None, None
            
            cls.ensure_uploads_dir()
            print(f"Uploads directory: {cls.UPLOADS_DIR}")

            if hasattr(shap_explainer_data, 'data') and hasattr(shap_explainer_data, 'toarray'):
                shap_explainer_data = shap_explainer_data.toarray().flatten()
            
            # Create figure with waterfall plot
            plt.figure(figsize=(12, 8))
            shap.plots.waterfall(shap_explainer_data, show=False)
            
            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"shap_waterfall_{timestamp}.png"
            file_path = os.path.join(cls.UPLOADS_DIR, filename)
            
            print(f"Saving SHAP diagram to: {file_path}")
            
            # Save to disk with high DPI
            plt.savefig(file_path, bbox_inches="tight", dpi=300)
            plt.close()
            
            # Verify file exists
            if os.path.exists(file_path):
                print(f"✓ SHAP diagram saved successfully: {file_path}")
            else:
                print(f"✗ Failed to save SHAP diagram at: {file_path}")
                return None, None
            
            # Also create base64 for embedding in response
            with open(file_path, 'rb') as f:
                image_bytes = f.read()
            base64_string = base64.b64encode(image_bytes).decode('utf-8')
            
            print(f"Base64 string created, length: {len(base64_string)}")
            
            return file_path, base64_string
            
        except Exception as e:
            print(f"Error creating SHAP waterfall diagram: {e}")
            import traceback
            traceback.print_exc()
            return None, None
    
    @classmethod
    def create_dataframe_diagram(cls, prediction_data: Dict) -> Tuple[Optional[str], Optional[str]]:
        """
        Create a visual diagram of the prediction input dataframe
        Saves to disk and returns (file_path, base64_string) or (None, None) on failure
        """
        try:
            cls.ensure_uploads_dir()
            print(f"Creating dataframe diagram, uploads dir: {cls.UPLOADS_DIR}")
            
            # Create a DataFrame from prediction data
            df = pd.DataFrame([prediction_data])
            
            # Create figure with multiple subplots
            fig, axes = plt.subplots(2, 2, figsize=(14, 10))
            fig.suptitle('Vehicle Emission Prediction Data Analysis', fontsize=16, fontweight='bold')
            
            # Plot 1: Numeric features
            numeric_cols = ['engine_size', 'cylinders', 'fuel_consumption_city', 
                          'fuel_consumption_highway', 'fuel_consumption_combined']
            numeric_data = df[[col for col in numeric_cols if col in df.columns]].iloc[0]
            
            ax1 = axes[0, 0]
            numeric_data.plot(kind='bar', ax=ax1, color='steelblue')
            ax1.set_title('Numeric Vehicle Features', fontweight='bold')
            ax1.set_ylabel('Value')
            ax1.tick_params(axis='x', rotation=45)
            ax1.grid(axis='y', alpha=0.3)
            
            # Plot 2: Categorical features
            categorical_cols = ['fuel_type', 'vehicle_class', 'transmission']
            ax2 = axes[0, 1]
            ax2.axis('off')
            
            cat_text = "Categorical Features:\n\n"
            for col in categorical_cols:
                if col in df.columns:
                    cat_text += f"• {col.replace('_', ' ').title()}: {df[col].iloc[0]}\n"
            
            ax2.text(0.1, 0.9, cat_text, fontsize=11, verticalalignment='top',
                    bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
                    family='monospace')
            
            # Plot 3: Fuel consumption comparison
            if all(col in df.columns for col in ['fuel_consumption_city', 'fuel_consumption_highway', 'fuel_consumption_combined']):
                ax3 = axes[1, 0]
                fuel_cols = ['fuel_consumption_city', 'fuel_consumption_highway', 'fuel_consumption_combined']
                fuel_data = df[fuel_cols].iloc[0]
                
                colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
                ax3.bar(range(len(fuel_data)), fuel_data.values, color=colors)
                ax3.set_xticks(range(len(fuel_data)))
                ax3.set_xticklabels(['City', 'Highway', 'Combined'], rotation=0)
                ax3.set_title('Fuel Consumption Comparison', fontweight='bold')
                ax3.set_ylabel('L/100km')
                ax3.grid(axis='y', alpha=0.3)
            
            # Plot 4: Summary table
            ax4 = axes[1, 1]
            ax4.axis('off')
            
            summary_data = []
            summary_data.append(['Prediction Info', 'Value'])
            summary_data.append(['Vehicle Class', df.get('vehicle_class', ['N/A']).iloc[0] if 'vehicle_class' in df.columns else 'N/A'])
            summary_data.append(['Engine Size', f"{df.get('engine_size', [0]).iloc[0] if 'engine_size' in df.columns else 0:.1f}L"])
            summary_data.append(['Cylinders', str(df.get('cylinders', ['N/A']).iloc[0] if 'cylinders' in df.columns else 'N/A')])
            summary_data.append(['CO2', f"{df.get('predicted_co2', [0]).iloc[0] if 'predicted_co2' in df.columns else 0:.1f}"])
            
            table = ax4.table(cellText=summary_data, cellLoc='left', loc='center',
                            colWidths=[0.5, 0.5])
            table.auto_set_font_size(False)
            table.set_fontsize(10)
            table.scale(1, 2)
            
            # Style header row
            for i in range(2):
                table[(0, i)].set_facecolor('#40466e')
                table[(0, i)].set_text_props(weight='bold', color='white')
            
            # Style data rows
            for i in range(1, len(summary_data)):
                for j in range(2):
                    table[(i, j)].set_facecolor('#f0f0f0' if i % 2 == 0 else 'white')
            
            plt.tight_layout()
            
            # Save to disk with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"vehicle_analysis_{timestamp}.png"
            file_path = os.path.join(cls.UPLOADS_DIR, filename)
            
            print(f"Saving vehicle analysis diagram to: {file_path}")
            plt.savefig(file_path, bbox_inches='tight', dpi=300)
            plt.close(fig)
            
            # Verify file exists
            if os.path.exists(file_path):
                print(f"✓ Vehicle analysis diagram saved: {file_path}")
            else:
                print(f"✗ Failed to save vehicle analysis diagram at: {file_path}")
                return None, None
            
            # Create base64 for embedding
            with open(file_path, 'rb') as f:
                image_bytes = f.read()
            base64_string = base64.b64encode(image_bytes).decode('utf-8')
            print(f"Base64 string created for vehicle analysis, length: {len(base64_string)}")
            
            return file_path, base64_string
            
        except Exception as e:
            print(f"Error creating dataframe diagram: {e}")
            import traceback
            traceback.print_exc()
            return None, None
    
    @staticmethod
    def create_comparison_chart(predictions_list: list) -> Tuple[bytes, str]:
        """
        Create a comparison chart of multiple predictions
        Returns: (image_bytes, base64_string)
        """
        try:
            if not predictions_list:
                return None, None
            
            df = pd.DataFrame(predictions_list)
            
            fig, axes = plt.subplots(1, 2, figsize=(14, 6))
            fig.suptitle('Prediction History Analysis', fontsize=16, fontweight='bold')
            
            # CO2 Emissions over time
            ax1 = axes[0]
            if 'predicted_co2' in df.columns:
                co2_values = df['predicted_co2'].values
                ax1.plot(co2_values, marker='o', linestyle='-', linewidth=2, markersize=6, color='#E74C3C')
                ax1.fill_between(range(len(co2_values)), co2_values, alpha=0.3, color='#E74C3C')
                ax1.set_title('CO2 Emission Trend', fontweight='bold')
                ax1.set_xlabel('Prediction #')
                ax1.set_ylabel('CO2 (g/km)')
                ax1.grid(True, alpha=0.3)
            
            # Rating distribution
            ax2 = axes[1]
            if 'rating' in df.columns:
                rating_counts = df['rating'].value_counts()
                colors_map = {
                    'Very Low': '#4CAF50',
                    'Low': '#8BC34A',
                    'Moderate': '#FFC107',
                    'High': '#FF9800',
                    'Very High': '#F44336'
                }
                colors = [colors_map.get(r, '#3498DB') for r in rating_counts.index]
                ax2.bar(range(len(rating_counts)), rating_counts.values, color=colors)
                ax2.set_xticks(range(len(rating_counts)))
                ax2.set_xticklabels(rating_counts.index, rotation=45, ha='right')
                ax2.set_title('Emission Rating Distribution', fontweight='bold')
                ax2.set_ylabel('Count')
                ax2.grid(axis='y', alpha=0.3)
            
            plt.tight_layout()
            
            # Save to bytes
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_bytes = buffer.getvalue()
            
            # Create base64 string
            base64_string = base64.b64encode(image_bytes).decode('utf-8')
            
            plt.close(fig)
            
            return image_bytes, base64_string
            
        except Exception as e:
            print(f"Error creating comparison chart: {e}")
            return None, None
