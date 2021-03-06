require("dotenv").config();

const fs = require('fs');
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const cooldowns = new Discord.Collection();

const client = new Discord.Client();
const DiscordInterfaceUtilities = require("./utilities/dsiUtilities");
DiscordInterfaceUtilities.INSTANCE.setClient(client);

//Connection to the database
const { Pool } = require('pg');
const postgreSQLClient = new Pool({/*Pool allows to have more queryes, client just one and then it has to be throw out: https://stackoverflow.com/questions/48751505/how-can-i-choose-between-client-or-pool-for-node-postgres  */
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
postgreSQLClient.connect();
const DatabaseUtilities = new require('./utilities/dbUtilities');
DatabaseUtilities.INSTANCE.setConnection(postgreSQLClient);
console.log("Database connected!");


//Commands adding
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));//This next step is how you'll dynamically retrieve all your newly created command files. Add this below your client.commands line:
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	//Dependency Injection not used: https://www.youtube.com/watch?v=TxxdqfhMUnI, https://www.npmjs.com/package/discordjs-dependency-injection-typescript
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);//Faccio una specie di hashmap con chiave (nome comando dentro il file) e file
}

client.login(process.env.DISCORD_TOKEN); //using env pass

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("with depression", {
    type: "STREAMING",
    url: "https://www.twitch.tv/darkrayta"
  });
})

client.on('message', msg => {
  //I don't need it cause send rank list if (msg.author.bot) return; //if (!msg.content.startsWith(prefix) || msg.author.bot) return; //but i take also different commands without prefix
  //msg.channel.send are ok also without return, it's just to end quicker

  if (msg.content.startsWith(prefix)){
    const args = msg.content.slice(prefix.length).split(/*' '*// +/);//regex: regular expression
    const commandName = args.shift().toLowerCase();

    //Check Alliases
    const command = client.commands.get(commandName)
    	|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return msg.channel.send('Wut?! I\'m a machine but not stupid');

    //Check if it exist
    //if (!client.commands.has(/*command*/commandName)) return ;

    //Check if it can't be used in DMs
    if (command.guildOnly && (msg.channel.type != 'text')) {
      return msg.reply('I can\'t execute that command inside DMs!');
    }
    
    //Check if it can be used cause timeslice
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;
    if (timestamps.has(msg.author.id)) {
      const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
    
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }
    }
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    try {
      //client.commands.get(command).execute(msg, args);
        command.execute(msg, args);//It uses dinamically the quantity of arguments, execute/run
    } catch(error){
        msg.channel.send('There was an error trying to execute that command!');
        console.error(error);
    }
  }
})

//API errors
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

//websocket errors
client.on('shardError', error => {
  console.error('A websocket connection encountered an error:', error);
});

function byTheBot(msg){//funziona!
  return msg.author.bot;
}

function getUserFromMention(mention) {
	// The id is the first and only match found by the RegEx.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// However the first element in the matches array will be the entire mention, not just the ID,
	// so use index 1.
	const id = matches[1];

	return client.users.cache.get(id);
}