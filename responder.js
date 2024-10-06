const { EmbedBuilder } = require('discord.js');
const { embedcolor, clientIdentificator } = require('../config.json');

module.exports = {
  init: async (client) => {
    client.on('messageCreate', async (message) => {
      try {
        // Проверяем, что сообщение не от бота
        if (message.author.bot) return;

        // Проверяем, является ли сообщение ответом (reply) на сообщение бота
        if (message.reference) {
          const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
          if (repliedMessage.author.id === client.user.id) return;
        }

        // Проверяем, что упомянули именно бота через его упоминание <@clientId>
        const botMention = `<@${clientIdentificator}>`;
        if (message.content.includes(botMention)) {
          // Создаем embed-сообщение
          const embed = new EmbedBuilder()
            .setColor(embedcolor)
            .setDescription(`${message.author}, да, я здесь! <a:29020blobcateyeblink:1286697839493382285>\nНапиши /help, чтобы узнать, что я умею!`);

          // Отправляем embed-сообщение в ответ на сообщение
          await message.reply({ embeds: [embed] });
        }
      } catch (error) {
        // Игнорируем любые ошибки
        console.error('Ошибка при обработке упоминания бота:', error);
      }
    });
  }
};