# CroFu API Specification & Output Standards

This document defines the complete API output specification, payload schemas, standard response envelopes, HTTP headers, and endpoint documentation for the **CroFu Agricultural Price Forecasting Platform**.

---

## 1. Core API Output Standards & Architecture

Every response produced by the CroFu API strictly adheres to deterministic standards across HTTP status codes, data envelopes, error models, and response headers.

### A. Standard JSON Response Envelope
All API endpoints produce a consistent top-level JSON structure:

```json
{
  "success": true,
  "status_code": 200,
  "message": "Forecast retrieved successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-08-04T15:54:00Z",
    "request_id": "req_8f93a10b42",
    "version": "v1"
  }
}
```

### B. Standardized Error Payload
When an error occurs, the API produces an actionable, structured error object:

```json
{
  "success": false,
  "status_code": 422,
  "error": {
    "code": "INVALID_COMMODITY_KEY",
    "message": "The commodity 'carrot' is not supported in region 'tn'.",
    "details": [
      {
        "field": "commodity",
        "issue": "Must be one of ['tomato', 'onion', 'potato', 'brinjal']"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-04T15:54:00Z",
    "request_id": "req_9921bca0"
  }
}
```

### C. Standard HTTP Headers

| Header | Description / Example Output |
| :--- | :--- |
| `Content-Type` | `application/json; charset=utf-8` |
| `X-Request-ID` | `req_8f93a10b42` (Traceability UUID) |
| `Cache-Control` | `public, max-age=300, s-maxage=600` |
| `ETag` | `"w/33a64df551425f"` (Client-side cache validation) |
| `X-RateLimit-Limit` | `1000` (Max requests per window) |
| `X-RateLimit-Remaining` | `984` |
| `X-RateLimit-Reset` | `1785860400` (Unix timestamp) |

---

## 2. CroFu System API Endpoints & Payload Specifications

### 1. Commodities List
* **Endpoint:** `GET /api/v1/commodities`
* **Description:** Retrieves the list of supported agricultural commodities, their default ML prediction models, evaluation metrics (MAPE, RMSE, MAE), and image metadata.

#### Response Output:
```json
{
  "success": true,
  "status_code": 200,
  "message": "Commodities retrieved successfully",
  "data": [
    {
      "key": "tomato",
      "label": "Tomato",
      "category": "Vegetable",
      "unit": "₹ / Quintal",
      "model": "XGBoost",
      "metrics": {
        "mape": 6.4,
        "rmse": 142.0,
        "mae": 108.0
      },
      "image_url": "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=900&q=80"
    },
    {
      "key": "onion",
      "label": "Onion",
      "category": "Vegetable",
      "unit": "₹ / Quintal",
      "model": "ARIMA",
      "metrics": {
        "mape": 5.1,
        "rmse": 118.0,
        "mae": 89.0
      },
      "image_url": "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=900&q=80"
    },
    {
      "key": "potato",
      "label": "Potato",
      "category": "Vegetable",
      "unit": "₹ / Quintal",
      "model": "ARIMA",
      "metrics": {
        "mape": 4.3,
        "rmse": 95.0,
        "mae": 72.0
      },
      "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&q=80"
    },
    {
      "key": "brinjal",
      "label": "Brinjal",
      "category": "Vegetable",
      "unit": "₹ / Quintal",
      "model": "XGBoost",
      "metrics": {
        "mape": 7.8,
        "rmse": 168.0,
        "mae": 128.0
      },
      "image_url": "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=900&q=80"
    }
  ],
  "meta": {
    "timestamp": "2026-08-04T16:00:00Z",
    "request_id": "req_com_019283"
  }
}
```

---

### 2. Price History & Forecast
* **Endpoint:** `GET /api/v1/forecasts/{commodity_key}`
* **Query Parameters:**
  - `region` (optional, default: `"national"`): Region key (`national`, `tn`).
  - `horizon_days` (optional, default: `14`): Number of forecast days.
* **Description:** Produces observed historical price series alongside multi-day machine learning predictions with upper and lower confidence intervals.

#### Response Output:
```json
{
  "success": true,
  "status_code": 200,
  "message": "Forecast retrieved successfully",
  "data": {
    "commodity": "tomato",
    "region": "national",
    "currency": "INR",
    "unit": "Quintal",
    "last_updated": "2026-08-04T12:00:00Z",
    "observed_prices": [
      { "date": "2026-07-06", "price": 1820 },
      { "date": "2026-07-07", "price": 1855 },
      { "date": "2026-08-03", "price": 2315 },
      { "date": "2026-08-04", "price": 2320 }
    ],
    "forecast_prices": [
      {
        "day": 1,
        "date": "2026-08-05",
        "predicted_price": 2340.0,
        "lower_bound": 2300.0,
        "upper_bound": 2380.0
      },
      {
        "day": 2,
        "date": "2026-08-06",
        "predicted_price": 2358.0,
        "lower_bound": 2305.0,
        "upper_bound": 2415.0
      },
      {
        "day": 14,
        "date": "2026-08-18",
        "predicted_price": 2475.5,
        "lower_bound": 2270.0,
        "upper_bound": 2680.0
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-04T16:00:00Z",
    "request_id": "req_fc_992013"
  }
}
```

---

### 3. Regions Coverage
* **Endpoint:** `GET /api/v1/regions`
* **Description:** Returns the geographical coverage areas supported by the forecasting engine.

#### Response Output:
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    { "key": "national", "label": "National", "code": "IN-ALL" },
    { "key": "tn", "label": "Tamil Nadu", "code": "IN-TN" }
  ],
  "meta": {
    "timestamp": "2026-08-04T16:00:00Z",
    "request_id": "req_reg_4412"
  }
}
```

---

### 4. Model Analytics & Feature Importance
* **Endpoint:** `GET /api/v1/models/metrics`
* **Description:** Produces model training stats, accuracy metrics (MAPE, RMSE, MAE, R²), and feature importance weightings.

#### Response Output:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "models": [
      {
        "name": "XGBoost-V3",
        "commodity": "tomato",
        "trained_at": "2026-08-01T00:00:00Z",
        "dataset_split": "80/20",
        "evaluation": {
          "mape": 6.4,
          "rmse": 142.0,
          "mae": 108.0,
          "r2_score": 0.941
        },
        "top_features": [
          { "feature": "rainfall_mm_30d", "importance": 0.38 },
          { "feature": "mandi_arrival_tonnes", "importance": 0.29 },
          { "feature": "fuel_price_index", "importance": 0.15 },
          { "feature": "seasonal_index", "importance": 0.18 }
        ]
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-04T16:00:00Z",
    "request_id": "req_mdl_8829"
  }
}
```

---

### 5. Price Volatility Alert Subscription
* **Endpoint:** `POST /api/v1/alerts/subscribe`
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
```json
{
  "email": "user@example.com",
  "commodity": "tomato",
  "threshold_percentage": 5.0
}
```

#### Response Output:
```json
{
  "success": true,
  "status_code": 201,
  "message": "Alert subscription registered successfully",
  "data": {
    "subscription_id": "sub_92104812",
    "email": "user@example.com",
    "commodity": "tomato",
    "threshold_percentage": 5.0,
    "created_at": "2026-08-04T16:00:00Z"
  },
  "meta": {
    "timestamp": "2026-08-04T16:00:00Z",
    "request_id": "req_sub_0102"
  }
}
```

---

## 3. Supplementary System Deliverables

Beyond REST JSON endpoints, the API produces:

1. **OpenAPI 3.0 Specification (`/api/v1/openapi.json`)**: Machine-readable specification for Swagger UI and SDK generation.
2. **Health & Readiness Check (`/healthz`)**:
   ```json
   {
     "status": "healthy",
     "uptime_seconds": 86400,
     "database": "connected",
     "redis_cache": "connected"
   }
   ```
3. **Real-time Price Stream (`/api/v1/stream/prices`)**: Server-Sent Events (SSE) stream for live price updates.
