from ultralytics import YOLO

model = YOLO("models/best.pt")


def predict(image):

    results = model(image, verbose=False)

    detections = []

    for box in results[0].boxes:

        x1, y1, x2, y2 = box.xyxy[0].tolist()

        detections.append({

            "class": model.names[int(box.cls)],

            "confidence": round(float(box.conf), 4),

            "bbox": [
                int(x1),
                int(y1),
                int(x2),
                int(y2)
            ]

        })

    return detections