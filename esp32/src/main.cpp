#include <Adafruit_SSD1306.h>
#include <Arduino.h>
#include <DNSServer.h>
#include <DHT.h>
#include <LittleFS.h>
#include <WebServer.h>
#include <WiFi.h>
#include <Wire.h>

namespace {
constexpr char AP_SSID[] = "ASTRA-HEALTH";
constexpr char AP_PASSWORD[] = "astra-health";
constexpr uint8_t DHT_PIN = 4;
constexpr uint8_t I2C_SDA_PIN = 21;
constexpr uint8_t I2C_SCL_PIN = 22;
constexpr uint8_t DHT_TYPE = DHT11;
constexpr uint8_t OLED_ADDRESS = 0x3C;
constexpr uint32_t DNS_PORT = 53;
constexpr uint32_t SENSOR_POLL_MS = 2000;
constexpr uint32_t OLED_FRAME_MS = 150;

IPAddress apAddress(192, 168, 4, 1);
DNSServer dnsServer;
WebServer server(80);
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
bool displayReady = false;
float temperatureC = NAN;
float humidityPercent = NAN;
uint32_t lastSensorReadMs = 0;
uint32_t lastDisplayFrameMs = 0;

void addCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void serveIndex() {
  File index = LittleFS.open("/index.html", "r");
  if (!index) {
    server.send(503, "text/plain", "Dashboard files are missing. Upload the LittleFS filesystem image.");
    return;
  }
  server.sendHeader("Cache-Control", "no-cache");
  server.streamFile(index, "text/html");
  index.close();
}

String contentTypeFor(const String& path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

void serveFileOrDashboard() {
  String path = server.uri();
  if (path.indexOf("..") >= 0) {
    server.send(400, "text/plain", "Invalid path");
    return;
  }

  if (LittleFS.exists(path)) {
    File file = LittleFS.open(path, "r");
    if (file) {
      server.streamFile(file, contentTypeFor(path));
      file.close();
      return;
    }
  }

  if (path.startsWith("/api/") || path.indexOf('.') >= 0) {
    server.send(404, "application/json", "{\"error\":\"Not found\"}");
    return;
  }
  serveIndex();
}

void updateDhtReadings() {
  const uint32_t now = millis();
  if (lastSensorReadMs != 0 && now - lastSensorReadMs < SENSOR_POLL_MS) return;

  const float nextTemperature = dht.readTemperature();
  const float nextHumidity = dht.readHumidity();
  temperatureC = nextTemperature;
  humidityPercent = nextHumidity;
  lastSensorReadMs = now;
}

void sendSensorData() {
  updateDhtReadings();

  String payload;
  payload.reserve(64);
  payload = "{\"t\":";
  payload += isnan(temperatureC) ? "null" : String(temperatureC, 1);
  payload += ",\"hum\":";
  payload += isnan(humidityPercent) ? "null" : String(humidityPercent, 1);
  payload += "}";

  addCorsHeaders();
  server.send(200, "application/json", payload);
}

void drawAssistantFrame() {
  if (!displayReady) return;
  const uint32_t now = millis();
  if (now - lastDisplayFrameMs < OLED_FRAME_MS) return;
  lastDisplayFrameMs = now;

  const uint32_t blinkPhase = now % 5000;
  const bool blink = blinkPhase >= 4600 && blinkPhase < 4740;
  const bool mouthOpen = (now / 700) % 2 == 0;

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(48, 0);
  display.print("ASTRA");
  display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

  if (blink) {
    display.drawFastHLine(29, 30, 27, SSD1306_WHITE);
    display.drawFastHLine(72, 30, 27, SSD1306_WHITE);
  } else {
    display.fillRoundRect(29, 20, 27, 21, 8, SSD1306_WHITE);
    display.fillRoundRect(72, 20, 27, 21, 8, SSD1306_WHITE);
    display.fillCircle(42, 30, 4, SSD1306_BLACK);
    display.fillCircle(85, 30, 4, SSD1306_BLACK);
  }

  if (mouthOpen) {
    display.fillRoundRect(55, 43, 19, 7, 3, SSD1306_WHITE);
  } else {
    display.drawLine(56, 46, 63, 48, SSD1306_WHITE);
    display.drawLine(63, 48, 71, 46, SSD1306_WHITE);
  }

  display.drawFastHLine(0, 53, 128, SSD1306_WHITE);
  char status[24];
  if (isnan(temperatureC) || isnan(humidityPercent)) {
    snprintf(status, sizeof(status), "T: --.-C  H: --%%");
  } else {
    snprintf(status, sizeof(status), "T:%2.1fC  H:%2.0f%%", temperatureC, humidityPercent);
  }
  display.setCursor(13, 56);
  display.print(status);
  display.display();
}

void configureRoutes() {
  server.on("/", HTTP_GET, serveIndex);
  server.on("/api/data", HTTP_GET, sendSensorData);
  server.on("/api/data", HTTP_OPTIONS, []() {
    addCorsHeaders();
    server.send(204);
  });
  server.on("/generate_204", HTTP_GET, serveIndex);
  server.on("/gen_204", HTTP_GET, serveIndex);
  server.on("/hotspot-detect.html", HTTP_GET, serveIndex);
  server.on("/connecttest.txt", HTTP_GET, serveIndex);
  server.on("/ncsi.txt", HTTP_GET, serveIndex);
  server.onNotFound(serveFileOrDashboard);
}
}  // namespace

void setup() {
  Serial.begin(115200);
  dht.begin();
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  displayReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  if (displayReady) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(32, 27);
    display.print("ASTRA HEALTH");
    display.display();
    Serial.println("SSD1306 OLED ready at 0x3C on SDA=21, SCL=22.");
  } else {
    Serial.println("ERROR: SSD1306 OLED not found. Check I2C wiring and address 0x3C.");
  }

  if (!LittleFS.begin(true)) {
    Serial.println("ERROR: LittleFS could not be mounted.");
  }

  WiFi.mode(WIFI_AP);
  if (!WiFi.softAPConfig(apAddress, apAddress, IPAddress(255, 255, 255, 0))) {
    Serial.println("ERROR: Could not configure the ESP32 access point address.");
  }
  if (!WiFi.softAP(AP_SSID, AP_PASSWORD)) {
    Serial.println("ERROR: Could not start the ESP32 access point.");
  } else {
    Serial.printf("Wi-Fi: %s | password: %s | dashboard: http://%s/\n",
                  AP_SSID, AP_PASSWORD, WiFi.softAPIP().toString().c_str());
  }

  dnsServer.start(DNS_PORT, "*", apAddress);
  configureRoutes();
  server.begin();
  Serial.println("HTTP server and captive DNS are running.");
}

void loop() {
  dnsServer.processNextRequest();
  server.handleClient();
  updateDhtReadings();
  drawAssistantFrame();
  delay(2);
}
