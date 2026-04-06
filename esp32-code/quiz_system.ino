
// Quiz System ESP32 Code
// Requires: WiFi, HTTPClient, QR Scanner library
// Compatible with: ESP32 DevKit, LCD/OLED 16x2 display

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ==================== CONFIGURATION ====================
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://your-server.com/api/trpc/quiz.submitAnswer";

// LCD Configuration (16x2 display on I2C address 0x27)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ==================== STATES ====================
enum State {
  STATE_IDLE,
  STATE_WAITING_USER_QR,
  STATE_WAITING_CARD_QR,
  STATE_WAITING_ANSWER,
  STATE_PROCESSING,
  STATE_SHOWING_RESULT
};

State currentState = STATE_IDLE;
String userQrCode = "";
String cardQrCode = "";
String userAnswer = "";
unsigned long stateStartTime = 0;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.print("Quiz System");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Setup GPIO for buttons (A, B, C, D)
  pinMode(32, INPUT_PULLUP); // Button A
  pinMode(33, INPUT_PULLUP); // Button B
  pinMode(34, INPUT_PULLUP); // Button C
  pinMode(35, INPUT_PULLUP); // Button D
  
  // Setup GPIO for QR scanner (simulated via serial)
  // In real implementation, use proper QR scanner library
  
  delay(2000);
  transitionToState(STATE_WAITING_USER_QR);
}

// ==================== MAIN LOOP ====================
void loop() {
  handleStateTransitions();
  handleButtonInput();
  handleSerialQRInput();
  updateDisplay();
  delay(100);
}

// ==================== STATE MANAGEMENT ====================
void transitionToState(State newState) {
  currentState = newState;
  stateStartTime = millis();
  userAnswer = "";
  
  switch(newState) {
    case STATE_WAITING_USER_QR:
      Serial.println("[STATE] Waiting for user QR code");
      break;
    case STATE_WAITING_CARD_QR:
      Serial.println("[STATE] Waiting for card QR code");
      break;
    case STATE_WAITING_ANSWER:
      Serial.println("[STATE] Waiting for answer selection");
      break;
    case STATE_PROCESSING:
      Serial.println("[STATE] Processing answer");
      break;
    case STATE_SHOWING_RESULT:
      Serial.println("[STATE] Showing result");
      break;
    default:
      break;
  }
}

void handleStateTransitions() {
  unsigned long elapsedTime = millis() - stateStartTime;
  
  // Auto-reset after showing result for 3 seconds
  if (currentState == STATE_SHOWING_RESULT && elapsedTime > 3000) {
    userQrCode = "";
    cardQrCode = "";
    transitionToState(STATE_WAITING_USER_QR);
  }
}

// ==================== INPUT HANDLING ====================
void handleButtonInput() {
  if (currentState != STATE_WAITING_ANSWER) return;
  
  if (digitalRead(32) == LOW) { // Button A
    userAnswer = "A";
    submitAnswer();
    delay(500);
  }
  if (digitalRead(33) == LOW) { // Button B
    userAnswer = "B";
    submitAnswer();
    delay(500);
  }
  if (digitalRead(34) == LOW) { // Button C
    userAnswer = "C";
    submitAnswer();
    delay(500);
  }
  if (digitalRead(35) == LOW) { // Button D
    userAnswer = "D";
    submitAnswer();
    delay(500);
  }
}

void handleSerialQRInput() {
  if (Serial.available() > 0) {
    String qrData = Serial.readStringUntil('\n');
    qrData.trim();
    
    if (qrData.length() > 0) {
      if (currentState == STATE_WAITING_USER_QR) {
        userQrCode = qrData;
        Serial.println("[QR] User QR: " + userQrCode);
        transitionToState(STATE_WAITING_CARD_QR);
      }
      else if (currentState == STATE_WAITING_CARD_QR) {
        cardQrCode = qrData;
        Serial.println("[QR] Card QR: " + cardQrCode);
        transitionToState(STATE_WAITING_ANSWER);
      }
    }
  }
}

// ==================== API COMMUNICATION ====================
void submitAnswer() {
  transitionToState(STATE_PROCESSING);
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi not connected");
    displayError("WiFi Error");
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["userQrCode"] = userQrCode;
  doc["cardQrCode"] = cardQrCode;
  doc["answer"] = userAnswer;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("[HTTP] Sending: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("[HTTP] Response: " + response);
    
    // Parse response
    StaticJsonDocument<512> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      String status = responseDoc["status"] | "error";
      bool isCorrect = responseDoc["data"]["correct"] | false;
      
      if (status == "success") {
        if (isCorrect) {
          displayResult("CORRECT!", true);
        } else {
          String correctAnswer = responseDoc["data"]["correct_answer"] | "?";
          displayResult("Wrong! Ans: " + correctAnswer, false);
        }
      } else {
        String message = responseDoc["device_message"] | "Error";
        displayError(message);
      }
    }
    transitionToState(STATE_SHOWING_RESULT);
  } else {
    Serial.println("[ERROR] HTTP Error: " + String(httpResponseCode));
    displayError("Network Error");
    transitionToState(STATE_SHOWING_RESULT);
  }
  
  http.end();
}

// ==================== DISPLAY ====================
void updateDisplay() {
  switch(currentState) {
    case STATE_WAITING_USER_QR:
      displayScreen("Quiz System", "Scan Your QR");
      break;
    case STATE_WAITING_CARD_QR:
      displayScreen("User: OK", "Scan Question");
      break;
    case STATE_WAITING_ANSWER:
      displayScreen("Select Answer:", "A B C D");
      break;
    case STATE_PROCESSING:
      displayScreen("Processing...", "");
      break;
    default:
      break;
  }
}

void displayScreen(const char* line1, const char* line2) {
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate < 500) return; // Update every 500ms
  lastUpdate = millis();
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
}

void displayResult(String message, bool isCorrect) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(isCorrect ? "CORRECT!" : "INCORRECT");
  lcd.setCursor(0, 1);
  lcd.print(message);
}

void displayError(String error) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ERROR");
  lcd.setCursor(0, 1);
  lcd.print(error);
}

// ==================== WIFI ====================
void connectToWiFi() {
  Serial.println("Connecting to WiFi: " + String(ssid));
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.println("IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}
