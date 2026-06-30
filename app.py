from flask import Flask, jsonify, request
import cv2
import numpy as np
from flask import render_template
from detector import predict
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/health")
def health():

    return jsonify({

        "status":"ok"

    })

@app.route("/predict", methods=["POST"])
def prediction():

    if "image" not in request.files:

        return jsonify({

            "error":"No image uploaded"

        }),400

    file = request.files["image"]

    image = np.frombuffer(file.read(), np.uint8)

    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    detections = predict(image)

    return jsonify({

        "detections":detections

    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)