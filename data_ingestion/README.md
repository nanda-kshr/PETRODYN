# Data Ingestion & Data Quality Service

`data_ingestion` acts as the ingestion gateway and real-time validation pipeline for well telemetry received from field sensors or `pump_simulator`.

---

## 📋 Responsibilities

* **Multi-Protocol Ingestion:** Ingests live telemetry streams via MQTT, OPC-UA, WebSockets, or HTTP endpoints.
* **Data Quality & Sensor Validation:**
  * **Missing Data Detection:** Identifies packet drops, dead channels, and missing sensor readings.
  * **Outlier & Anomaly Filtering:** Rejects or flags unphysical values (e.g., negative pressures, extreme temperature spikes).
  * **Sensor Drift & Stuck Values:** Detects frozen/flatline sensors and calibration drift.
  * **Sensor Health Monitoring:** Computes per-sensor reliability metrics and flags degraded signals.
* **Data Persistence:** Normalizes validated records and persists timeseries data into **MongoDB**.
* **Real-Time Forwarding:** Broadcasts sanitized events to `dashboard` for live UI monitoring and provides indexed queries for `ai_pipelines`.

---

## 🔄 Data Flow

```
   [pump_simulator / IoT Sensors]
                  │
                  ▼ (Raw Telemetry via MQTT / REST)
     ┌────────────────────────┐
     │     data_ingestion     │
     │  - Timestamping        │
     │  - Anomaly / Drift QA  │
     │  - Schema Validation   │
     └───────┬────────┬───────┘
             │        │
             ▼        ▼
       [MongoDB]    [dashboard / WebSocket Broadcast]
```

---

## 🗄️ Database Storage Schema (MongoDB)

* **`raw_telemetry`**: Unaltered sensor packets for audit trails.
* **`validated_telemetry`**: Cleaned, stamped data consumed by downstream models.
* **`sensor_health_logs`**: Sensor uptime, drift alerts, and anomaly scores.

---

## ⚙️ Configuration

* `MONGO_URI`: Connection string to MongoDB instance.
* `INGESTION_PORT`: Port for incoming HTTP/WebSocket streams.
* `MQTT_BROKER_URL`: Broker endpoint for telemetry topics.
