FROM python:3.11-slim

WORKDIR /app

RUN adduser --disabled-password --gecos '' appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

CMD ["sh", "-c", "python manage.py migrate && python manage.py loaddata fixtures.json || true && python manage.py runserver 0.0.0.0:8001"]
