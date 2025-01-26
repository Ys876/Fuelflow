import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

try:
    from scrapers.purdue_dining_scraper import PurdueDiningScraper
    logger.info("Successfully imported PurdueDiningScraper")
except Exception as e:
    logger.error(f"Failed to import PurdueDiningScraper: {e}")
    raise

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
scraper = PurdueDiningScraper()

@app.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        dining_court = request.args.get('diningCourt')
        meal_type = request.args.get('mealType')
        date = request.args.get('date')

        logger.info(f"Received request for dining_court={dining_court}, meal_type={meal_type}, date={date}")

        if not dining_court or not meal_type:
            return jsonify({
                'error': 'Both diningCourt and mealType are required'
            }), 400

        menu = scraper.get_menu(dining_court, meal_type, date)
        logger.info(f"Successfully fetched menu: {len(menu.get('items', [])) if menu else 0} items")
        return jsonify(menu)
    except Exception as e:
        logger.error(f"Error in get_menu: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch menu',
            'details': str(e)
        }), 500

@app.route('/api/analyze-meals', methods=['POST'])
def analyze_meals():
    try:
        data = request.get_json()
        dining_court = data.get('diningCourt')
        meal_items = data.get('mealItems', [])
        
        logger.info(f"Analyzing meals for dining_court={dining_court}, items={len(meal_items)} items")
        
        if not dining_court or not meal_items:
            return jsonify({
                'error': 'Both diningCourt and mealItems are required'
            }), 400

        # For now, return a simple recommendation based on the available items
        recommendations = {
            'recommended_items': meal_items[:3],  # Recommend first 3 items
            'nutritional_analysis': {
                'protein_rich': [item for item in meal_items if 'chicken' in item.lower() or 'fish' in item.lower()],
                'vegetarian': [item for item in meal_items if any(veg in item.lower() for veg in ['vegetable', 'salad', 'vegan'])],
                'balanced_meal': meal_items[:3]  # Placeholder for actual balanced meal analysis
            },
            'dining_court_rating': 4.5,  # Placeholder rating
            'wait_time_estimate': '10-15 minutes'  # Placeholder wait time
        }
        
        logger.info(f"Successfully analyzed meals and generated recommendations")
        return jsonify(recommendations)
    except Exception as e:
        logger.error(f"Error in analyze_meals: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to analyze meals',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Python server on port 5002")
    app.run(port=5002)
