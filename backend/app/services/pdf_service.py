from typing import List, Dict
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io

class PDFReportService:
    """PDF report generation service"""
    
    @staticmethod
    def generate_prediction_report(
        prediction: Dict,
        user_name: str
    ) -> bytes:
        """Generate PDF report for a single prediction"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1976D2'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        # Title
        elements.append(Paragraph("🚗 EcoVehicle Emission Report", title_style))
        elements.append(Spacer(1, 12))
        
        # User and Date Info
        info_data = [
            ["Report Generated:", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")],
            ["User:", user_name],
        ]
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        # Vehicle Information
        elements.append(Paragraph("Vehicle Information", heading_style))
        
        vehicle_data = [
            ["Vehicle Class:", prediction.get("vehicle_class", "N/A")],
            ["Fuel Type:", prediction.get("fuel_type", "N/A")],
            ["Transmission:", prediction.get("transmission", "N/A")],
        ]
        
        vehicle_table = Table(vehicle_data, colWidths=[2*inch, 4*inch])
        vehicle_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E3F2FD')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(vehicle_table)
        elements.append(Spacer(1, 20))
        
        # Technical Specifications
        elements.append(Paragraph("Technical Specifications", heading_style))
        
        specs_data = [
            ["Engine Size (L):", f"{prediction.get('engine_size', 0):.2f}"],
            ["Cylinders:", str(prediction.get("cylinders", "N/A"))],
            ["Fuel Consumption City (L/100km):", f"{prediction.get('fuel_consumption_city', 0):.2f}"],
            ["Fuel Consumption Highway (L/100km):", f"{prediction.get('fuel_consumption_highway', 0):.2f}"],
            ["Fuel Consumption Combined (L/100km):", f"{prediction.get('fuel_consumption_combined', 0):.2f}"],
        ]
        
        specs_table = Table(specs_data, colWidths=[3*inch, 3*inch])
        specs_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(specs_table)
        elements.append(Spacer(1, 20))
        
        # Emission Results
        elements.append(Paragraph("Emission Prediction Results", heading_style))
        
        co2 = prediction.get("predicted_co2", 0)
        rating = prediction.get("rating", "Unknown")
        
        # Color based on rating
        rating_color = {
            "Very Low": colors.HexColor('#4CAF50'),
            "Low": colors.HexColor('#8BC34A'),
            "Moderate": colors.HexColor('#FFC107'),
            "High": colors.HexColor('#FF9800'),
            "Very High": colors.HexColor('#F44336'),
        }.get(rating, colors.black)
        
        result_data = [
            ["Predicted CO2 Emission:", f"{co2:.2f} g/km"],
            ["Emission Rating:", rating],
            ["Assessment Date:", datetime.utcnow().strftime("%Y-%m-%d")],
        ]
        
        result_table = Table(result_data, colWidths=[3*inch, 3*inch])
        result_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8F5E9')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('TEXTCOLOR', (1, 1), (1, 1), rating_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (1, 1), (1, 1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(result_table)
        elements.append(Spacer(1, 20))
        
        # Emission Rating Guide
        elements.append(Paragraph("Emission Rating Guide", heading_style))
        guide_text = """
        <b>Very Low:</b> ≤ 100 g/km - Excellent emissions performance<br/>
        <b>Low:</b> 101-130 g/km - Good emissions performance<br/>
        <b>Moderate:</b> 131-160 g/km - Average emissions performance<br/>
        <b>High:</b> 161-200 g/km - Higher emissions performance<br/>
        <b>Very High:</b> > 200 g/km - Significant emissions impact<br/>
        """
        elements.append(Paragraph(guide_text, styles['Normal']))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_history_report(
        predictions: List[Dict],
        user_name: str,
        statistics: Dict
    ) -> bytes:
        """Generate PDF report for prediction history"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1976D2'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        # Title
        elements.append(Paragraph("📊 EcoVehicle Prediction History Report", title_style))
        elements.append(Spacer(1, 12))
        
        # Report Info
        info_data = [
            ["Report Generated:", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")],
            ["User:", user_name],
            ["Total Predictions:", str(statistics.get("total_predictions", 0))],
        ]
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 16))
        
        # Statistics
        elements.append(Paragraph("Statistics Summary", heading_style))
        stats_data = [
            ["Metric", "Value"],
            ["Average CO2 (g/km)", f"{statistics.get('average_co2', 0):.2f}"],
            ["Highest CO2 (g/km)", f"{statistics.get('highest_co2', 0):.2f}"],
            ["Lowest CO2 (g/km)", f"{statistics.get('lowest_co2', 0):.2f}"],
        ]
        stats_table = Table(stats_data, colWidths=[2.5*inch, 1.5*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 16))
        
        # Prediction History
        elements.append(Paragraph("Prediction History", heading_style))
        
        if predictions:
            history_data = [["Date", "CO2 (g/km)", "Rating"]]
            
            for pred in predictions[:20]:  # Limit to 20 predictions per report
                date_str = pred.get("created_at", "").strftime("%Y-%m-%d") if isinstance(pred.get("created_at"), datetime) else "N/A"
                history_data.append([
                    date_str,
                    f"{pred.get('predicted_co2', 0):.1f}",
                    pred.get("rating", "N/A")
                ])
            
            history_table = Table(history_data, colWidths=[1.2*inch, 1.3*inch, 1.3*inch, 1*inch, 1.2*inch])
            history_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
            ]))
            elements.append(history_table)
        else:
            elements.append(Paragraph("No predictions found.", styles['Normal']))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
