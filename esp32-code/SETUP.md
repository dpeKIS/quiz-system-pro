# ESP32 Quiz System - Setup Guide

## Hardware Requirements

- ESP32 DevKit or equivalent
- 16x2 LCD Display (I2C interface)
- 4x Push buttons (for A, B, C, D answers)
- QR Code Scanner Module (USB or UART)
- USB Cable for programming
- WiFi network access

## Pin Configuration

| Component | GPIO Pin | Function |
|-----------|----------|----------|
| Button A  | GPIO 32  | Answer A |
| Button B  | GPIO 33  | Answer B |
| Button C  | GPIO 34  | Answer C |
| Button D  | GPIO 35  | Answer D |
| LCD SDA   | GPIO 21  | I2C Data |
| LCD SCL   | GPIO 22  | I2C Clock |
| QR RX     | GPIO 16  | Serial RX |
| QR TX     | GPIO 17  | Serial TX |

## Installation Steps

### 1. Install Arduino IDE
- Download from https://www.arduino.cc/en/software
- Install ESP32 board support via Board Manager

### 2. Install Required Libraries
In Arduino IDE, go to Sketch > Include Library > Manage Libraries and install:
- ArduinoJson (by Benoit Blanchon)
- LiquidCrystal_I2C (by Frank de Brabander)
- WiFi (built-in)
- HTTPClient (built-in)

### 3. Configuration
Edit the following in quiz_system.ino:
```cpp
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://your-server.com/api/trpc/quiz.submitAnswer";
```

### 4. Upload Code
1. Connect ESP32 via USB
2. Select Tools > Board > ESP32 Dev Module
3. Select Tools > Port > COM port
4. Click Upload

### 5. Serial Monitor
Open Serial Monitor (9600 baud) to see debug messages

## QR Code Format

User QR Code: `USER_<ID>` (e.g., USER_001)
Card QR Code: `CARD_<QUESTION_ID>` (e.g., CARD_Q123)

## Troubleshooting

- **WiFi not connecting**: Check SSID and password
- **LCD not displaying**: Verify I2C address (default 0x27)
- **Buttons not responding**: Check GPIO pins and pull-up resistors
- **QR scanner not reading**: Check serial connection and baud rate

## API Communication

The device sends POST requests to the backend with this format:
```json
{
  "userQrCode": "USER_001",
  "cardQrCode": "CARD_Q123",
  "answer": "A",
  "timestamp": 1234567890
}
```

Expected response:
```json
{
  "status": "success",
  "code": "ANSWER_SAVED",
  "message": "Answer recorded successfully",
  "action": "SHOW_RESULT",
  "device_message": "Poprawna!",
  "data": {
    "correct": true,
    "correct_answer": "A"
  }
}
```
