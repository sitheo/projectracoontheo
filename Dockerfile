# Gunakan image Python resmi yang ringan
FROM python:3.10-slim

# Set working directory di dalam kontainer
WORKDIR /app

# Perbaikan: Mengganti libgl1-mesa-glx dengan libgl1
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Salin file requirements dan install library Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh isi projek ke dalam kontainer
COPY . .

# Hugging Face Spaces menggunakan port 7860 secara default
EXPOSE 7860

# Jalankan aplikasi menggunakan Gunicorn (production server)
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]