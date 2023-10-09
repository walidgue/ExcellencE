const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const DeviceDetector = require('node-device-detector');
const axios = require('axios');

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
  console.log('************************************** WaLID **************************************',);
  console.log('Requested Path:', requestedPath);
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/save_ip', (req, res) => {
  const ipAddress = req.body.ipAddress;
  console.log('+++++++++++++++++++++++++++++++ User Conect IP Local +++++++++++++++++++++++++++++++',);
  console.log('Local IP address...:', ipAddress);
  res.json({ message: 'IP address received successfully' });
});

// Set the default timezone
momentTimezone.tz.setDefault('Africa/Algiers');

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('----------------------- user connected IP External -----------------------');

  // Handle 'getIP' event
  socket.on('getIP', async (data) => {
    const xForwardedFor = socket.request.headers['x-forwarded-for'];
    const externalIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : socket.request.connection.remoteAddress;
    const port = socket.request.connection.remotePort;

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const userAgent = socket.request.headers['user-agent'];
    const deviceInfo = deviceDetector.detect(userAgent);

    console.log(`Timestamp..........: ${timestamp}`);
    console.log(`External IP........: ${externalIP}`);
    console.log(`Port...............: ${port}`);

    let serviceProvider = 'Not Available';
    let organization = 'Not Available';

    const fields = 'connection';
try {
  const ipWhoisResponse = await axios.get(`http://ipwho.is/${externalIP}?output=json&fields=${fields}`);

  if (ipWhoisResponse.status === 200) {
    const responseData = ipWhoisResponse.data;
    serviceProvider = responseData.connection.isp;
    organization = responseData.connection.org;

    // Check if responseData.timezone exists before accessing its properties
    if (responseData.timezone) {
      const currentTime = responseData.timezone.current_time;
      console.log(`Current Time: ${currentTime}`);
    } else {
      console.log('Current Time: N/A');
    }

    console.log(`IP Service Provider: ${serviceProvider}`);
    console.log(`Organization: ${organization}`);
  } else {
    console.error('Error fetching IP service provider: Unexpected status code', ipWhoisResponse.status);
  }
} catch (error) {
  console.error('Error fetching IP service provider:', error.message);
}

    console.log(`IP Service Provider.: ${serviceProvider}`);
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
