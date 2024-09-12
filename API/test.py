from flask import Flask, jsonify
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)

# สถานะของหลอดไฟ
bulb_status = {
    "status": "off",
    "brightness": 0  # ค่าเริ่มต้นของความสว่าง
}

# กำหนด Bearer Token ที่อนุญาต
VALID_TOKEN = "testtoken"

# Middleware สำหรับตรวจสอบ Bearer Token
def token_required(f):
    def wrapper(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token or token != VALID_TOKEN:
            return jsonify({"error": "Unauthorized access"}), 401

        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper

@app.route('/bulb/status', methods=['GET'])
@token_required
def get_status():
    return jsonify(bulb_status)

@app.route('/bulb/on', methods=['POST'])
@token_required
def turn_on():
    bulb_status['status'] = 'on'
    return jsonify({"message": "The bulb is turned on."})

@app.route('/bulb/off', methods=['POST'])
@token_required
def turn_off():
    bulb_status['status'] = 'off'
    bulb_status['brightness'] = 0
    return jsonify({"message": "The bulb is turned off."})

@app.route('/bulb/brightness', methods=['POST'])
@token_required
def set_brightness():
    if bulb_status['status'] == 'on':
        brightness = request.json.get('brightness', 100)  # ค่าเริ่มต้นคือ 100
        
        # ปริ้นค่า brightness ที่ได้รับจาก body
        print(f"Received brightness value: {brightness}")
        
        if 0 <= brightness <= 100:
            bulb_status['brightness'] = brightness
            return jsonify({"message": f"Brightness set to {brightness}."})
        else:
            return jsonify({"error": "Brightness should be between 0 and 100."}), 400
    else:
        return jsonify({"error": "Cannot set brightness. The bulb is off."}), 400

if __name__ == '__main__':
    app.run(debug=True)
