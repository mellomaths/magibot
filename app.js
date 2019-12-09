const path = require('path');
const Commando = require('discord.js-commando');

const nlp = require('./services/nlp');
const config = require('./config/bot');
const wrapper = require('./wrapper');
const logger = require('./utils/logger');
const Radio = require('./utils/radio');
const embed = require('./utils/embed');
const helpers = require('./helpers');

const guildEventHandler = require('./events/guild');

const bot = new Commando.Client({
  commandPrefix: config.env.discord.prefix,
  unknownCommandResponse: false,
  disableEveryone: true,
  disabledEvents: config.disabledEvents,
  messageCacheLifetime: config.env.discord.message.cacheLifetime,
  messageSweepInterval: config.env.discord.message.sweepInterval,
  messageCacheMaxSize: config.env.discord.message.cacheMaxSize,
  retryLimit: config.env.discord.retryLimit,
});

bot.nlp = nlp;
bot.services = {};
bot.services.swapi = require('./services/swapi.service');

bot.services.magi = {
  guild: require('./services/guild.service'),
};

bot.config = config;
bot.wrapper = wrapper;
bot.logger = logger;
bot.customEmbed = embed;
bot.helpers = helpers;
bot.Radio = new Radio(config.env.youtube.apiKey);

bot.registry
  .registerDefaultTypes()
  .registerGroups([
    ['simple', 'Simple'],
    ['utils', 'Utilities'],
    ['radio', 'Radio'],
    ['voice', 'Voice'],
    ['swapi', 'Star Wars API'],
    ['help', 'Help'],
    ['playlist', 'Playlist'],
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

bot.once('ready', async () => {
  bot.logger.success(`${bot.user.username} starting`);
  const guilds = bot.guilds.size;
  const channels = bot.channels.size;
  const users = bot.users.size;
  bot.logger.success(
    `Connected to ${guilds} guilds, ${channels} channels and ${users} users`,
  );
  const activity = "Fo' shizzle my nizzle";
  bot.logger.success(`Activity set to: ${activity}`);
  bot.user.setActivity(activity);

  await bot.nlp.train();
  bot.nlp.save();
});

bot.on('guildCreate', guildEventHandler.onCreate);
bot.on('guildDelete', guildEventHandler.onDelete);

// bot.on('guildMemberAdd')
// bot.on('guildMemberRemove')

// bot.on('disconnect');

process
  .on('unhandledRejection', (reason, p) => {
    bot.logger.error('Unhandled Rejection at Promise');
    console.error(reason, p);
  })
  .on('uncaughtException', (err) => {
    bot.logger.error('Uncaught Exception thrown');
    console.error(err);
  });

bot.login(config.env.discord.token);