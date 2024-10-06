const { autoModeration } = require('../mongoDB');

module.exports = {
  init: (client) => {
    client.on('messageCreate', async (message) => {
      try {
        // Проверка, является ли отправитель ботом или сообщение не в текстовом канале
        if (message.author.bot || !message.guild || !message.content) return;

        // Получаем настройки автомодерации из базы
        const autoModSettings = await autoModeration.findOne({ guildID: message.guild.id });

        // Проверяем, включена ли автомодерация
        if (!autoModSettings || autoModSettings.automodStatus !== 'on') return;

        // Проверяем, включена ли фильтрация рекламы
        if (autoModSettings.linksStatus === 'on' && await containsAdvertisement(message.content, autoModSettings.banlinks)) {
          // Удаление сообщения с рекламой, если канал не находится в whitelist или whitelistChannelsStatus выключен
          if (!autoModSettings.whitelistChannels.includes(message.channel.id) || autoModSettings.whitelistChannelsStatus !== 'on') {
            await message.delete();
            const warningMessage = await message.channel.send(`${message.author.tag}, нельзя отправлять ссылки в чат.`);
            setTimeout(async () => {
              try {
                await warningMessage.delete();
              } catch (error) {
                console.log("Моё сообщение уже удалили");
              }
            }, 3000); // Удаляем через 3 секунды
          }
          }

        // Проверяем, включена ли фильтрация плохих слов
        if (autoModSettings.badWordsStatus === 'on' && await containsBadWord(message.content, autoModSettings.banwords)) {
          // Удаление сообщения с плохим словом, если канал не находится в whitelist или whitelistChannelsStatus выключен
          if (!autoModSettings.whitelistChannels.includes(message.channel.id) || autoModSettings.whitelistChannelsStatus !== 'on') {
            await message.delete();
            const warningMessage = await message.channel.send(`${message.author.tag}, использование нецензурной лексики запрещено на сервере.`);
            setTimeout(async () => {
              try {
                await warningMessage.delete();
              } catch (error) {
                console.log("Моё сообщение уже удалили");
              }
            }, 3000); // Удаляем через 3 секунды
          }
          }

        // Проверяем, включена ли фильтрация упоминаний @everyone и @here
        if (autoModSettings.mentionsStatus === 'on' && message.mentions.everyone) {
          // Удаление сообщения с упоминанием @everyone или @here, если канал не находится в whitelist или whitelistChannelsStatus выключен
          if (!autoModSettings.whitelistChannels.includes(message.channel.id) || autoModSettings.whitelistChannelsStatus !== 'on') {
            await message.delete();
            const warningMessage = await message.channel.send(`${message.author.tag}, упоминания запрещены на сервере.`);
            setTimeout(async () => {
              try {
                await warningMessage.delete();
              } catch (error) {
                console.log("Моё сообщение уже удалили");
              }
            }, 3000); // Удаляем через 3 секунды
          }
        }
      } catch (error) {
        console.error('Ошибка в автомодерации:', error);
      }
    });
  },
};

async function containsAdvertisement(content, banlinks) {
  // Проверка наличия рекламы в сообщении
  const linkRegex = /https?:\/\/[^\s/$.?#].[^\s]*/i;
  const defaultAds = ['.com', '.net', '.org', '.gg', '.ru'];
  const advertisements = [...defaultAds, ...banlinks.split(',').map(link => link.trim())]; // Разделяем список заблокированных доменов
  return linkRegex.test(content) || advertisements.some(ad => content.includes(ad));
}

async function containsBadWord(content, banwords) {
  // Проверка наличия плохих слов в сообщении
  const words = banwords.split(',').map(word => word.trim().toLowerCase()); // Разделяем список заблокированных слов и приводим к нижнему регистру
  const messageContent = content.toLowerCase();
  return words.some(word => messageContent.includes(word));
}
