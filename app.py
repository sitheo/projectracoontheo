from flask import Flask, render_template, Response, jsonify
from ultralytics import YOLO
import cv2
import time

app = Flask(__name__)

model = YOLO("runs/detect/train/weights/best.pt")

camera = None
camera_running = False

confidence = 0
fps = 0
detected_object = 0

def generate_frames():

    global confidence
    global fps
    global detected_object

    prev_time = time.time()

    while camera_running:

        success, frame = camera.read()

        if not success:
            break

        results = model(frame)

        detected_object = len(results[0].boxes)

        if detected_object > 0:

            confidence = float(results[0].boxes.conf[0])

        else:

            confidence = 0

        annotated = results[0].plot()

        current_time = time.time()

        fps = 1/(current_time-prev_time)

        prev_time = current_time

        ret, buffer = cv2.imencode(".jpg", annotated)

        frame = buffer.tobytes()

        yield(b'--frame\r\n'
              b'Content-Type:image/jpeg\r\n\r\n'
              +frame+
              b'\r\n')
        
@app.route("/start_camera")
    
def start_camera():

    global camera
    global camera_running

    if not camera_running:

        camera = cv2.VideoCapture(0)

        camera_running = True
    return jsonify({"status":"started"})

@app.route("/stop_camera")
def stop_camera():

    global camera
    global camera_running

    camera_running = False

    if camera is not None:

        camera.release()
    return jsonify({"status":"stopped"})

@app.route("/video")
def video():

    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route("/status")
def status():

    return jsonify({

        "confidence":round(confidence*100,2),

        "fps":round(fps,2),

        "object":detected_object,

        "running":camera_running

    })

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)