const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const DeviceDetector = require('node-device-detector');

const port = process.env.PORT || 3000;
let startTime;

// Initialize DeviceDetector
const deviceDetector = new DeviceDetector();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable JSON parsing for POST requests
app.use(bodyParser.json());

function formatAndPrint(header, data) {
  console.log(header);
  console.log(data);
  console.log('--------------------( ⚆ _ ⚆ )---------------------------');
}

// Set the default timezone
momentTimezone.tz.setDefault('Africa/Algiers');

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('----------------------- user connected IP External -----------------------');

  // Handle 'getIP' event
  socket.on('getIP', (data) => {
    // Get the client's IP address and port directly from the socket object
    const clientIP = socket.handshake.address;
    const clientPort = socket.handshake.port;

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const userAgent = socket.request.headers['user-agent'];
    const deviceInfo = deviceDetector.detect(userAgent);

    console.log(`Timestamp..........: ${timestamp}`);
    console.log(`Client IP..........: ${clientIP}`);
    console.log(`Client Port........: ${clientPort}`);

    // Since we are not doing an IP WHOIS lookup, you can set these values to N/A
    const serviceProvider = 'N/A';
    const organization = 'N/A';

    console.log(`IP Service Provider: ${serviceProvider}`);
    console.log(`Organization........: ${organization}`);
    formatAndPrint('Device Info......:', deviceInfo);

    // Emit 'ip' event with information
    socket.emit('ip', {
      clientIP,
      clientPort,
      timestamp,
      deviceInfo,
      serviceProvider,
      organization,
    });
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startTime = new Date();
});

