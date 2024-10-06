const { RsnChat } = require("rsnchat");
const { EmbedBuilder } = require('discord.js');
const { rsn_key, embedcolor } = require('../config.json');
const { gpt } = require('../mongoDB');

const rsnchat = new RsnChat(rsn_key);

const getChannelData = async (guildID, channelID) => {
  return await gpt.findOne({ guildID, channelID });
};

const handleMessage = async (client, message) => {
  // Проверяем, является ли message объектом и содержит ли он свойство author
  if (!message || !message.author || message.author.bot) return;

  // Исключаем сообщения, которые начинаются с "." или "!"
  if (message.content.startsWith('.') || message.content.startsWith('!')) return;

  const data = await getChannelData(message.guildId, message.channelId);

  if (data && data.status === 'on') {
    message.channel.sendTyping().catch(e=>{});
    let response;

    try {
      if (data.model === 'gpt4') {
        response = await rsnchat.gpt4(message.content);
      } else if (data.model === 'gpt') {
        response = await rsnchat.gpt(message.content);
      } else if (data.model === 'naomi') {
        response = await rsnchat.naomi(message.content);
      } else if (data.model === 'codellama') {
        response = await rsnchat.codellama(message.content);
      } else {
        await message.reply('Выбранная модель не поддерживается.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(embedcolor)
        .setDescription(response.message);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      await message.reply('Произошла ошибка при обработке вашего запроса.');
    }
  }
};


module.exports = {
  init: async (client) => {
    client.on('messageCreate', (message) => handleMessage(client, message));
    client.on('channelDelete', async (channel) => {
      try {
        await gpt.deleteMany({ channelID: channel.id });
        console.log(`Удалены данные канала ${channel.id} из базы данных.`);
      } catch (error) {
        console.error('Ошибка при удалении данных канала из базы данных:', error);
      }
    });

    console.log('Обработчик сообщений инициализирован.');
  }
};
