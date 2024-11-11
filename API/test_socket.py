import socket
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ip = {} 
port = {}
command = {}


@app.route("/bulb", methods=["POST"])
def bulb():
    ip = request.json.get("ip")
    port = request.json.get("port")
    print(port)
    command = request.json.get("command")
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)  # เพิ่ม timeout เป็น 5 วินาที
            s.connect((ip, int(port)))
            s.send((json.dumps(command) + "\r\n").encode())


            # รับ response จากหลอดไฟ
            data = s.recv(1024)  # รับข้อมูลตอบกลับ
            response = data.decode()
            parsed_response = json.loads(response.strip())

        return jsonify({"message": "Command sent to socket.", "response": parsed_response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bulbget", methods=["GET"])
def get_bulb():
    return ("test")

        

        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=47591)