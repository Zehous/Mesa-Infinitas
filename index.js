const { Client, Intents, ActivityFlags } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

console.clear();

client.on("ready", () => {
    console.log('Bot Pronto. Bora Trabalhar...');
    client.user.setActivity('RPG');
});

client.on("message", async msg => {
    if (msg.author.bot) return;
    if (msg.channel.type == "dm") return;
    if (msg.content[0] != '.') return;

    const args = msg.content.slice('.').trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    require('./Modulos/Commandos').Run(msg, cmd, args);
});


client.login(process.env.TokenDiscord);