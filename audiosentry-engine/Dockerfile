FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
# Installing fastapi and uvicorn alongside requirements.txt since they are not in the file
RUN pip install --no-cache-dir -r requirements.txt fastapi uvicorn python-multipart

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
