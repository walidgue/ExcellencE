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

app.get('/*', (req, res) => {
  const requestedPath = req.path;
  console.log('************************************** WaLID **************************************');
  console.log('Requested Path:', requestedPath);
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/save_ip', (req, res) => {
  const ipAddress = req.body.ipAddress;
  console.log('+++++++++++++++++++++++++++++++ User Conect IP Local +++++++++++++++++++++++++++++++');
  console.log('Local IP address...:', ipAddress);
  res.json({ message: 'IP address received successfully' });
});

// Set the default timezone
momentTimezone.tz.setDefault('Africa/Algiers');

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('----------------------- user connected IP External -----------------------');

  // Handle 'getIP' event
  socket.on('getIP', (data) => {
    const xForwardedFor = socket.request.headers['x-forwarded-for'];
    const externalIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : socket.handshake.address; // Use socket.handshake.address to get the client's IP
    const port = socket.handshake.port; // Use socket.handshake.port to get the client's port

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const userAgent = socket.request.headers['user-agent'];
    const deviceInfo = deviceDetector.detect(userAgent);

    console.log(`Timestamp..........: ${timestamp}`);
    console.log(`Client IP..........: ${externalIP}`); // Display the client's IP
    console.log(`Client Port........: ${port}`); // Display the client's port

    // Omit the IP WHOIS lookup for intermediary servers

    // Since we are not doing an IP WHOIS lookup, you can set these values to 'N/A'
    const serviceProvider = 'N/A';
    const organization = 'N/A';

    console.log(`IP Service Provider: ${serviceProvider}`);
    console.log(`Organization........: ${organization}`);
    formatAndPrint('Device Info......:', deviceInfo); // Separator after "Device Info" section

    // Emit 'ip' event with information
    socket.emit('ip', {
      externalIP,
      port,
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
