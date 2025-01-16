const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Define and configure the serial port
const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

// Forward serial data to all WebSocket clients
parser.on('data', (data) => {
  // Regular expression to extract the numeric value (assuming the format is consistent like "IR Value(bluetooth): 2558.59")
  const regex = /[-+]?\d*\.\d+|\d+/; // Matches floating-point or integer numbers
  const match = data.match(regex); // Try to match a number

  if (match) {
    const value = parseFloat(match[0]); // Convert matched number to float
    if (!isNaN(value)) {
      ws.send(JSON.stringify({ type: 'data', payload: value })); // Send valid data to frontend
    } else {
      console.error('Invalid data after conversion:', data);
    }
  } else {
    console.error('No valid number found in data:', data);
  }
});


  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Serial port opened
port.on('open', () => {
  console.log('Serial Port Open');
});

// Handle serial port errors
port.on('error', (err) => {
  console.error('Serial Port Error:', err.message);
  // Notify all connected WebSocket clients about the error
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'error', payload: err.message }));
    }
  });
});
