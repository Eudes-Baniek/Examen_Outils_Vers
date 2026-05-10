FROM python:3.9-slim

RUN useradd -m dit_user
USER dit_user
WORKDIR /home/dit_user/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ENV PATH="/home/dit_user/.local/bin:${PATH}"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
