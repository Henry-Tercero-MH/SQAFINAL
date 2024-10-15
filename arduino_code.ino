#include <Servo.h>
#include <Keypad.h>

Servo myServo;  // Crear objeto Servo

// Configuración del teclado matricial
const byte ROWS = 4;  // Cuatro filas
const byte COLS = 4;  // Cuatro columnas
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {9, 8, 7, 6};  // Pines de las filas conectados al Arduino
byte colPins[COLS] = {5, 4, 3, 2};  // Pines de las columnas conectados al Arduino

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Lista de tarjetas RFID permitidas
const String allowedCards[] = {"08449914", "08018476", "08356868", "08430791"};
String correctPIN = "4321";  // PIN correcto (modificar según necesidad)

void setup() {
  myServo.attach(10);  // Conectar el servomotor al pin 10
  myServo.write(0);     // Asegurarse de que el servomotor esté en posición cerrada
  Serial.begin(9600);   // Inicializar la comunicación serie
}

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');  // Leer la entrada

    if (input.length() == 8) {  // Si es un código RFID (8 caracteres)
      if (isCardAllowed(input)) {
        Serial.println("Tarjeta válida. Ingrese el PIN en el teclado:");
      } else {
        Serial.println("Tarjeta no válida.");
      }
    } else if (input.length() == 4) {  // Si es un PIN (4 caracteres)
      if (input == correctPIN) {
        openServo();
      } else {
        Serial.println("PIN incorrecto.");
      }
    }
  }

  // Leer el teclado (por si se usa directamente)
  char key = keypad.getKey();
  if (key) {
    Serial.print(key);
  }
}

// Función para verificar si la tarjeta está permitida
bool isCardAllowed(String card) {
  for (int i = 0; i < sizeof(allowedCards) / sizeof(allowedCards[0]); i++) {
    if (card == allowedCards[i]) {
      return true;
    }
  }
  return false;
}

// Función para abrir el servomotor
void openServo() {
  Serial.println("Abriendo puerta");
  myServo.write(190);  // Abrir el servomotor
  delay(3000);        // Mantener abierto 3 segundos
  myServo.write(0);   // Cerrar el servomotor
  Serial.println("Cerrando puerta");
}