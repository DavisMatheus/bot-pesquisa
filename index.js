const { Client, MessageEmbed } = require('discord.js');
const config = require('./config');
const commands = require('./help');

let bot = new Client({
  fetchAllMembers: true, // Remove this if the bot is in large guilds.
  presence: {
    status: 'online',
    activity: {
      name: `${config.prefix}help`,
      type: 'LISTENING',
    },
  },
});

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}.`));

bot.on('message', async (message) => {
  // Check for command
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    switch (command) {
      case 'ping':
        let msg = await message.reply('Pinging...');
        await msg.edit(`PING! ${Date.now() - msg.createdTimestamp}ms.`);
        break;
      case 'say':
        break;
      case 'repeat':
        if (args.length > 0) message.channel.send(args.join(' '));
        else
          message.reply(
            'Você não enviou uma mensagem para repetir, cancelando o comando.'
          );
        break;
      case 'clear':
        if (!message.member.permissions.has('MANAGE_MESSAGES'))
          return message.reply(
            'você não tem permissão de `Gerenciar Mensagens` para usar esse comando'
          );
        const deleteCount = parseInt(args[0], 10);
        if (!deleteCount || deleteCount < 1 || deleteCount > 99)
          return message.reply(
            'forneça um número de até **99 mensagens** a serem excluídas'
          );
        const fetched = await message.channel.messages.fetch({
          limit: deleteCount + 1,
        }); //bugado aqui n sei pq n aceita message.channel.messages.fetch
        await message.channel.bulkDelete(fetched);
        break;
      /* Unless you know what you're doing, don't change this command. */
      case 'help':
        let embed = new MessageEmbed()
          .setTitle('MENU DE AJUDA')
          .setColor('GREEN')
          .setFooter(
            `Requisitado pelo corno: ${
              message.member
                ? message.member.displayName
                : message.author.username
            }`,
            message.author.displayAvatarURL()
          )
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed.setDescription(
            Object.keys(commands)
              .map(
                (command) =>
                  `\`${command.padEnd(
                    Object.keys(commands).reduce(
                      (a, b) => (b.length > a.length ? b : a),
                      ''
                    ).length
                  )}\` :: ${commands[command].description}`
              )
              .join('\n')
          );
        else {
          if (
            Object.keys(commands).includes(args[0].toLowerCase()) ||
            Object.keys(commands)
              .map((c) => commands[c].aliases || [])
              .flat()
              .includes(args[0].toLowerCase())
          ) {
            let command = Object.keys(commands).includes(args[0].toLowerCase())
              ? args[0].toLowerCase()
              : Object.keys(commands).find(
                  (c) =>
                    commands[c].aliases &&
                    commands[c].aliases.includes(args[0].toLowerCase())
                );
            embed.setTitle(`COMMAND - ${command}`);

            if (commands[command].aliases)
              embed.addField(
                'Command aliases',
                `\`${commands[command].aliases.join('`, `')}\``
              );
            embed
              .addField('DESCRIPTION', commands[command].description)
              .addField(
                'FORMAT',
                `\`\`\`${config.prefix}${commands[command].format}\`\`\``
              );
          } else {
            embed
              .setColor('RED')
              .setDescription(
                'Este comando não existe. Use o comando -help para listá-los.'
              );
          }
        }
        message.channel.send(embed);
        break;
    }
  }
});

require('./server')();
bot.login(config.token);
