module.exports = {
	name: 'changeprefix',
    usage: '<prefix>',
	description: 'Change the prefix',
	execute(client, msg, args) {
        if (!args.length) {
          return msg.channel.send(`${usage}\nYou didn't provide any arguments, ${msg.author}! Pls add a name for the list`);
        }
        var { prefix } = require('./config.json');
        prefix=args[0];
    },
};