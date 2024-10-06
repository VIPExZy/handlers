const { Client, GatewayIntentBits } = require('discord.js');
const { schet } = require('../mongoDB');

module.exports = {
  init: async (client) => {
    try {
      setInterval(async () => {
        try {
          const guilds = [...client.guilds.cache.values()];

          for (const guild of guilds) {
            const guildID = guild.id;

            const guildData = await schet.findOne({ guildID });

            if (guildData && guildData.status === 'on' && guildData.channelsID) {
              const channelsID = guildData.channelsID;

              const members = await guild.members.fetch();
              const memberCount = members.filter(member => !member.user.bot).size;
              const botCount = members.filter(member => member.user.bot).size;
              const totalCount = memberCount + botCount;

              for (const [type, channelID] of Object.entries(channelsID)) {
                try {
                  const channel = await guild.channels.fetch(channelID).catch(() => null); // Пропускаем ошибку, если канал не найден
                  if (channel && channel.isTextBased()) { // Проверка на текстовый тип канала для обновления названия
                    let count;
                    switch (type) {
                      case 'members':
                        count = memberCount;
                        break;
                      case 'bots':
                        count = botCount;
                        break;
                      case 'total':
                        count = totalCount;
                        break;
                      default:
                        count = 0;
                    }

                    // Получаем текущее название канала
                    const currentName = channel.name;

                    // Обновляем только значение в названии канала, оставляя остальную часть без изменений
                    const newName = currentName.replace(/(\d+)/g, count.toString());

                    // Меняем название канала
                    await channel.setName(newName).catch(() => {
                      // Пропускаем ошибку, если не хватает прав для изменения названия канала
                    });
                  }
                } catch {
                  // Игнорируем любые ошибки для продолжения выполнения
                }
              }
            }
          }

          console.log('Обновление информации всех каналов завершено.');
        } catch (error) {
          console.error('Ошибка при обновлении информации всех каналов:', error);
        }
      }, 60000); // Обновлять информацию каждую минуту
    } catch (error) {
      console.error('Ошибка при инициализации обработчика:', error);
    }
  }
};
