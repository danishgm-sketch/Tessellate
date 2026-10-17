FROM python:3.13-slim
WORKDIR /app
COPY apps/host-daemon/ /app/
RUN useradd --uid 10001 --no-create-home host && python -m unittest discover -s tests
USER 10001:10001
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
CMD ["python", "daemon.py"]
