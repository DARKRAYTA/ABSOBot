module.exports = {
    name: 'info',
    description: 'Shows the infos of the Bot',
    execute(message, args) {
        const Discord = require('discord.js');
        //const embedInfo = new Discord.MessageEmbed();

        const embedInfo = {
            title: 'ABSO',
            color: 0xbb00ff
        }
    
        message.channel.send({ embed: embedInfo });
    }
}