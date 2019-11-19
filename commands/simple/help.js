const Commando = require('discord.js-commando');
const env = require('../../config/env');
const magi = require('../../magi');
const Commands = require('./commands');
const embed = require('../../utils/embed');

class Help extends Commando.Command {
  static options() {
    return {
      usage: `${env.client.prefix} help <command name>`,
      name: 'help',
      group: 'simple',
      memberName: 'help',
      description: 'Show how you can use an especific bot command',
      details: 'Should receive one argument referring to the command you want to know about',
      examples: [
        `${env.client.prefix} help purge`,
        `${env.client.prefix} help play`,
      ],
      args: [
        {
          key: 'commandName',
          prompt: 'Name of the command you want to know about',
          type: 'string',
          label: 'command name',
        },
      ],
    };
  }

  constructor(client) {
    super(client, Help.options());
  }

  async run(message, { commandName }) {
    let command = magi.commands[commandName];
    if (commandName === 'commands') {
      command = Commands.options();
    }

    if (!command) {
      return message.reply(`This command does not exist. Use "${env.client.prefix} commands" to know all commands`);
    }

    const reply = embed.create();

    reply
      .setTitle(`The "${command.name}" command`)
      .setDescription(command.usage)
      .addField('Description', command.description, true)
      .addField('Details', command.details, true);

    if (command.args && command.args.length > 0) {
      let argsFieldValue = '';
      for (let i = 0; i < command.args.length; i += 1) {
        argsFieldValue += `${i + 1}: <${command.args[i].label}> ${command.args[i].prompt}\n`;
      }

      reply.addField('Arguments', argsFieldValue);
    }

    if (command.examples && command.examples.length > 0) {
      let examplesFieldValues = '';
      for (let i = 0; i < command.examples.length; i += 1) {
        examplesFieldValues += `${command.examples[i]}\n`;
      }

      reply.addField('Examples', examplesFieldValues);
    }

    let permissionsFieldValue = '';
    if (command.userPermissions && command.userPermissions.length > 0) {
      for (let i = 0; i < command.userPermissions.length; i += 1) {
        permissionsFieldValue += `${command.userPermissions[i]}\n`;
      }
    } else {
      permissionsFieldValue = 'All members can use this command';
    }
    reply.addField('Permissions', permissionsFieldValue, true);

    if (command.guildOnly) {
      reply.addField('Can be used in DM?', 'No', true);
    } else {
      reply.addField('Can be used in DM?', 'Yes', true);
    }

    if (command.throttling) {
      const { usages, duration } = command.throttling;
      reply.addField('Use limit', `This command can only be used ${usages} times in ${duration} seconds`, true);
    }

    return message.channel.send(reply);
  }
}

module.exports = Help;