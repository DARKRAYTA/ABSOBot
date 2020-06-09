require("dotenv").config();

const Discord = require('discord.js')
//const {prefix, token}=require('./config.json');
const client = new Discord.Client()

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`))

client.login(process.env.DISCORD_TOKEN);

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pongtt!')
  }
  //if(msg.content.startsWith()){

  //}
  if (msg.content === 'Ciao') {
    msg.channel.send('Ciao')
  }
  if(msg.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])){
    if (msg.content.startsWith('SpamTag')) {
      var i;
      const member = msg.mentions.members.first()
      for (i = 0; i < 100; i++) {
        //msg.reply(`${member.reply}`)
        msg.channel.send(`${member}`);
        //get tag() {
        // return `${this.username}#${this.discriminator}`;
        //}
      }
    }
  }
  if(msg.content=='Come mi chiamo?'){
    msg.channel.send(`${msg.author}`);
  }
})

client.on('message', message => {
  if(message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])){
    if (message.content.startsWith('!kick')) {
      const member = message.mentions.members.first()
  
      if (!member) {
        return message.reply(`Who are you trying to kick? You must mention a user.`)
      }else if (!member.kickable) {
        return message.reply(`I can't kick this user. Sorry!`)
      }
      return member
        .kick()
        .then(() => message.reply(`${member.user.tag} was kicked.`))
        .catch(error => message.reply(`Sorry, an error occured.`))
    }
  }
})

client.on('message', msg => {
})