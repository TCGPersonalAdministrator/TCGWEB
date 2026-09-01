# syntax=docker/dockerfile:1

FROM python:3.14-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY run.py ./

ENV HOST=0.0.0.0 \
    PORT=5000

EXPOSE 5000
CMD ["python", "run.py"]
