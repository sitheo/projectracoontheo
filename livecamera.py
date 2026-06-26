from ultralytics import YOLO
import cv2

model = YOLO("runs/detect/train/weights/best.pt")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()

    results = model(frame)

    annotated_frame = results[0].plot()

    cv2.imshow("Raccoon Detection", annotated_frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q') or key == 27:
        break

cap.release()
cv2.destroyAllWindows()