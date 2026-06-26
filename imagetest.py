from ultralytics import YOLO
import cv2

# Load model hasil training
model = YOLO("runs/detect/train/weights/best.pt")

# Path gambar yang ingin diuji
image_path = "D:/racconproject/raccoon.jpg"

# Baca gambar
image = cv2.imread(image_path)

# Prediksi
results = model(image)

# Gambar hasil deteksi
annotated_image = results[0].plot()

# Tampilkan hasil
cv2.imshow("Raccoon Detection", annotated_image)

cv2.waitKey(0)
cv2.destroyAllWindows()