from flask import Flask, jsonify
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)

bulb_status = {
    "status": "off",
    "brightness": 0  # ค่าเริ่มต้นของความสว่าง
}

@app.route('/bulb/status', methods=['GET'])
def get_status():
    return jsonify(bulb_status)

@app.route('/bulb/on', methods=['POST'])
def turn_on():
    bulb_status['status'] = 'on'
    return jsonify({"message": "The bulb is turned on."})

@app.route('/bulb/off', methods=['POST'])
def turn_off():
    bulb_status['status'] = 'off'
    bulb_status['brightness'] = 0
    return jsonify({"message": "The bulb is turned off."})

@app.route('/bulb/brightness', methods=['POST'])
def set_brightness():
    if bulb_status['status'] == 'on':
        brightness = request.json.get('brightness', 100)  # ค่าเริ่มต้นคือ 100
        if 0 <= brightness <= 100:
            bulb_status['brightness'] = brightness
            return jsonify({"message": f"Brightness set to {brightness}."})
        else:
            return jsonify({"error": "Brightness should be between 0 and 100."}), 400
    else:
        return jsonify({"error": "Cannot set brightness. The bulb is off."}), 400

if __name__ == '__main__':
    app.run(debug=True)