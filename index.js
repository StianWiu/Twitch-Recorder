console.clear();

// If you decide to make your own API by cloning https://github.com/StianWiu/TwitchAPI you can use that instead to bypass any rate limits.
const API = "https://twitch.astraea.dev/api/twitch/";

// If you need to download vod's you can use my free website https://vod.astraea.dev/

// Make sure all dependencies are installed.
try {
  require("asciiart-logo");
  require("axios");
  require("bug-killer");
  require("commander");
  require("enquirer");
  require("timer-node");
  require("fs");
  require("twitch-m3u8");
  require("m3u8stream");
} catch (error) {
  console.log(
    "\x1b[31m%s",
    "\n\nPlease install the required dependencies by running npm install. Exiting...\n\n"
  );
  process.exit(1);
}

const fs = require("fs"),
  logo = require("asciiart-logo"),
  Logger = require("bug-killer"),
  axios = require("axios"),
  { Confirm } = require("enquirer"),
  { Command } = require("commander"),
  twitch = require("twitch-m3u8"),
  m3u8stream = require("m3u8stream");

// Tool to make console logs look nice.
Logger.config = {
  // The error type
  error: {
    color: [192, 57, 43]
    , text: "error"
    , level: 1
  }
  // The warning type
  , warn: {
    color: [241, 196, 15]
    , text: "warn "
    , level: 2
  }
  // The info type
  , info: {
    color: [52, 152, 219]
    , text: "info "
    , level: 3
  }
  // Display date
  , date: false
  // Log level
  , level: 4
  // Output stream
  , stream: process.stdout
  // The options passed to `util.inspect`
  , inspectOptions: { colors: true }
};

Logger.config.action = {
  color: [88, 232, 95]
  , text: "action "
  , level: 2
};

const printLogo = () => {
  console.log(
    logo({
      name: "Twitch Recorder",
      font: "Chunky",
      lineChars: 10,
      padding: 2,
      margin: 3,
    })
      .emptyLine()
      .emptyLine()
      .center(
        'Twitch recording software. Developed by StianWiu. "--help" for options'
      )
      .center("https://stianwiu.me")
      .render()
  );
};


// Get parameters from the command line.
const program = new Command();
program.requiredOption("-u, --user <string>", "Twitch username");
program.option(
  "-l, --loop",
  "Should program loop forever"
);
program.option("-c, --category <string>", "Only record certain category");
program.option("-m, --max <num>", "How many GB file can become");
program.option("-q, --quality <num>", "What quality to record at 0 = highest");
// program.option("-y, --yes", "Skip settings confirmation");
program.option("-d, --directory <string>", "Where to save the files produced");
program.parse(process.argv);
const config = program.opts();

// twitch-m3u8 won't accept a username with upper case letters.
config.user = config.user.toLowerCase();

// If twitch-m3u8 returns a error stream is not live.
const checkIfUserIsLive = async () => {
  try {
    await twitch.getStream(config.user);
    return true;
  } catch (error) {
    return false;
  }
}

const checkIfVideoFolderExists = async () => {
  const exists = await fs.existsSync(config.directory);
  if (!exists) {
    Logger.warn(`${config.directory} does not exist. Creating...`);
    try {
      await fs.mkdirSync(config.directory);
      Logger.log(`Created directory ${config.directory}`, "action");
    } catch (error) {
      Logger.error(`Could not create ${config.directory}. Exiting...`);
      Logger.error(error);
      process.exit(1);
    }
  }
  return;
}

const getStreamDetails = async () => {
  let data;
  await axios.post(API, {
    name: config.user
  })
    .then(async (response) => {
      if (response.data == "No name provided") {
        Logger.error("Something went wrong. Server reported no name provided. Exiting...");
        process.exit(1);
      } else if (response.data == "Not live") {
        Logger.error("Something went wrong. Server reported user not live. Exiting...");
        process.exit(1);
      } else {
        data = response.data
      }
    })
  return data;
}

const getStream = async () => {
  let m3u8 = await twitch.getStream(config.user);
  // Remove audio only from array.
  for (let i = 0; i < m3u8.length; i++) {
    if (m3u8[i].quality === "audio_only") {
      m3u8.splice(i, 1);
    }
  }
  Logger.info(`There are ${m3u8.length} quality options available.`);
  // If quality number is higher than the amount of options available.
  if (config.quality > m3u8.length - 1) {
    Logger.error(`Quality selected is not available. Lowest quality available is ${m3u8.length - 1}. Exiting...`);
    process.exit(1);
  }
  if (!config.quality) {
    Logger.info(`No quality option provided. Using highest quality available. ${m3u8[0].quality}`);
    m3u8 = m3u8[0].url
  } else {
    Logger.info(`Quality option provided. Selected ${m3u8[config.quality].quality}.`);
    m3u8 = m3u8[config.quality].url
  }
  return m3u8;
}

const start = async () => {
  let streamDetails;
  // Check if user is live.
  if (await checkIfUserIsLive()) {
    Logger.info(`${config.user} is live`);
    // Check if user has specified a category.
    if (config.category) {
      // Request stream data from API.
      streamDetails = await getStreamDetails();
      // Check if streamer is streaming the specified category.
      if (config.category.toLowerCase() !== streamDetails.game_name.toLowerCase()) {
        Logger.warn(`Streamer is streaming ${streamDetails.game_name} but you specified ${config.category}. Skipping for now...`);
        return;
      }
    }
    // Double check folder is created.
    await checkIfVideoFolderExists();
    // Get m3u8 link to record from.
    const m3u8Link = await getStream();
    streamDetails = await getStreamDetails();
    // Create filename.
    const filename = `${streamDetails.user_name}_${Date.now()}.mp4`;
    const stream = m3u8stream(m3u8Link).pipe(fs.createWriteStream(`${config.directory}${filename}`));
    Logger.log("Started recording")
    let record = true
    stream.on('end', () => {
      Logger.info("Stream ended. Exiting...");
      record = false
    });
    stream.on('error', (error) => {
      Logger.error("Something went wrong. Exiting...");
      Logger.error(error);
      record = false
    });
    while (record) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      if (config.category !== undefined) {
        streamDetails = await getStreamDetails();
        if (config.category.toLowerCase() !== streamDetails.game_name.toLowerCase()) {
          Logger.info(`Streamer is now streaming ${streamDetails.game_name} but you specified ${config.category}. Stopping recording...`);
          record = false
        } else {
          await new Promise(resolve => setTimeout(resolve, 50000));
        }
      }
      if (await checkIfUserIsLive() === false) {
        Logger.info(`${config.user} is no longer live. Stopping recording...`);
        record = false
      }
      // Turn bytes into gb.
      const bytes = stream.bytesWritten;
      const gb = bytes / 1000000000;
      if (config.max !== undefined) {
        if (gb >= config.max) {
          Logger.info(`File size has reached ${gb}GB/${config.max}GB. Stopping recording...`);
          record = false
        }
      }
    }
    try {
      stream.end();
    } catch (error) { }
    if (config.directory === "./videos/") {
      // Get current directory path.
      const currentDirectory = process.cwd();
      Logger.info(`Finished recording. File has been saved to ${currentDirectory}/${filename}`);
    } else {
      Logger.info(`Finished recording. File has been saved to ${config.directory}/${filename}`);
    }
    return;
  } else {
    Logger.warn(`${config.user} is not live.`);
  }
}

(async () => {
  // Check if program should loop forever.
  let loop = false
  if (config.loop) {
    loop = true
  }
  if (config.directory === undefined) {
    config.directory = "./videos/"
  } else {
    Logger.info(`Using ${config.directory} as directory`);
  }
  await checkIfVideoFolderExists();
  if (!config.loop) {
    await start();
  } else {
    // If loop is true, start the loop.
    let loopDuration = 10000
    if (config.category) {
      loopDuration = 120000
      Logger.info(`You have specified a category, in order to reduce the amount of requests sent to the server, the loop will run every 2 minutes.`)
    }
    while (loop) {
      await start();
      await new Promise((resolve) => setTimeout(resolve, loopDuration));
      console.clear();
    }
  }
})();