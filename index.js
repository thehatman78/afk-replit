const mineflayer = require('mineflayer')
const fs = require('fs');
const { keep_alive } = require("./keep_alive");

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

var pi = 3.14159;
var moveinterval = 2;
var maxrandom = 5;
var actions = ['forward', 'back', 'left', 'right'];
var host = data["ip"];
var username = data["name"];
var port = parseInt(data["port"]) || 25565;

keep_alive();

function createBot() {
  var lasttime = -1;
  var moving = 0;
  var connected = false;
  var lastaction;

  console.log(`Connecting to ${host}:${port} as ${username}...`);

  var bot = mineflayer.createBot({
    host: host,
    port: port,
    username: username
  });

  bot.on('login', function () {
    console.log("Logged in successfully");
  });

  bot.on('spawn', function () {
    connected = true;
    console.log("Spawned - AFK mode active");
  });

  bot.on('time', function () {
    if (!connected) return;
    if (lasttime < 0) {
      lasttime = bot.time.age;
      return;
    }
    var randomadd = Math.random() * maxrandom * 20;
    var interval = moveinterval * 20 + randomadd;
    if (bot.time.age - lasttime > interval) {
      if (moving) {
        bot.setControlState(lastaction, false);
        moving = false;
      } else {
        var yaw = Math.random() * pi - (0.5 * pi);
        var pitch = Math.random() * pi - (0.5 * pi);
        bot.look(yaw, pitch, false);
        lastaction = actions[Math.floor(Math.random() * actions.length)];
        bot.setControlState(lastaction, true);
        moving = true;
        bot.activateItem();
      }
      lasttime = bot.time.age;
    }
  });

  bot.on('error', function (err) {
    console.log("Connection error:", err.message);
  });

  bot.on('end', function (reason) {
    connected = false;
    if (moving && lastaction) {
      try { bot.setControlState(lastaction, false); } catch (e) {}
    }
    console.log("Session ended:", reason || "unknown reason");
    console.log("Reconnecting in 10 seconds...");
    setTimeout(createBot, 10000);
  });
}

createBot();
