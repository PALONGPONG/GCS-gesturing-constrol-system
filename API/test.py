from flask import Flask, jsonify
from flask_cors import CORS
from flask import request

app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        'message': 'Hello, World!'
    }
    return jsonify(data)
@app.route('/api/data2', methods=['GET'])
def get_data2():
    data = {
        'message': 'Hello, World!2'
    }
    return jsonify(data)
@app.route('/api/post', methods=['POST'])
def post_data():
    request_data = request.get_json()
    response_data = {
        'received': request_data,
        'message': 'Data received successfully!'
    }
    return jsonify(response_data)
if __name__ == '__main__':
    app.run(debug=True)