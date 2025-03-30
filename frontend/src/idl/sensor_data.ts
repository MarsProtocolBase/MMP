export const IDL = {
  "version": "0.1.0",
  "name": "mmp_sensor_data",
  "instructions": [
    {
      "name": "submitSensorData",
      "accounts": [
        {
          "name": "sensorData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "temperature",
          "type": "f64"
        },
        {
          "name": "humidity",
          "type": "f64"
        },
        {
          "name": "co2",
          "type": "f64"
        },
        {
          "name": "pressure",
          "type": "f64"
        },
        {
          "name": "radiation",
          "type": "f64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SensorData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "temperature",
            "type": "f64"
          },
          {
            "name": "humidity",
            "type": "f64"
          },
          {
            "name": "co2",
            "type": "f64"
          },
          {
            "name": "pressure",
            "type": "f64"
          },
          {
            "name": "radiation",
            "type": "f64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSensorData",
      "msg": "Invalid sensor data provided"
    },
    {
      "code": 6001,
      "name": "UnauthorizedAccess",
      "msg": "Unauthorized access to sensor data"
    }
  ]
}; 