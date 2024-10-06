const { rank, serverSettings } = require('../mongoDB');
const { calculateExpToNextLevel } = require('./models.js');
const { EmbedBuilder } = require('discord.js');
const { embedcolor } = require('../config.json');

module.exports = {
  init: (client) => {
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;

      const guildId = message.guild.id;
      const userId = message.author.id;

      let rankData = await rank.findOne({ guildId, userId });
      let serverData = await serverSettings.findOne({ guildId });

      // Проверка, включена ли система уровней
      if (serverData?.status === 'disabled') return;

      // Обновление буста времени, если истек
      if (serverData?.boost?.status === 'on' && serverData.boost.time && Date.now() > serverData.boost.time) {
        serverData.boost.status = 'off';
        serverData.boost.multiple = 0;
        await serverData.save();
      }

      // Проверка на активный буст из базы данных
      let xpGain = Math.floor(Math.random() * 10) + 5;
      if (serverData?.boost?.status === 'on' && serverData.boost.multiple > 0) {
        xpGain *= serverData.boost.multiple;
      }

      if (!rankData) {
        rankData = new rank({
          guildId,
          userId,
          level: 0,
          exp: 0,
          expToNextLevel: calculateExpToNextLevel(1),
        });
        await rankData.save();
      }

      rankData.exp += xpGain;

      while (rankData.exp >= rankData.expToNextLevel) {
        rankData.exp -= rankData.expToNextLevel;
        rankData.level++;
        rankData.exp = 0;  // Сбрасываем опыт после повышения уровня
        rankData.expToNextLevel = calculateExpToNextLevel(rankData.level);

        await handleLevelUp(guildId, userId, rankData.level, message.guild, message.channel);
      }

      await rankData.save();
    });
  },
};

async function handleLevelUp(guildId, userId, level, guild, currentChannel) {
  const rankData = await rank.findOne({ guildId, userId });
  const serverData = await serverSettings.findOne({ guildId });

  if (!rankData || !serverData) return;

  const user = await guild.members.fetch(userId);

  // Проверка наличия и существования установленного канала
  let targetChannel = null;
  if (serverData.channel) {
    targetChannel = guild.channels.cache.get(serverData.channel);
    if (!targetChannel) {
      serverData.channel = null;
      await serverData.save();
    }
  }

  // Если канал не найден, используем текущий канал
  if (!targetChannel) {
    targetChannel = currentChannel;
  }

  // Найти первую награду для текущего уровня
  const rewardForLevel = serverData.rewards.find(r => r.level === level);

  if (rewardForLevel && serverData.alert) {
    const rewardsArray = rewardForLevel.content.split('\n\n');
    const rewardMessage = rewardsArray.shift();

    const embed = new EmbedBuilder()
      .setTitle('Новый уровень!')
      .setDescription(`Администратор сервера "${guild.name}" прислал вам награду за достижение нового уровня <a:9142tada:1275403174962004053>\n\n**Ваша награда:**\n${rewardMessage}`)
      .setColor(embedcolor)
      .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Поздравляем!`, iconURL: guild.iconURL({ dynamic: true }) });

    try {
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.error(`Не удалось отправить сообщение пользователю ${user.user.tag}: ${err}`);
    }

    if (rewardsArray.length > 0) {
      rewardForLevel.content = rewardsArray.join('\n\n');
    } else {
      serverData.rewards = serverData.rewards.filter(r => r.level !== level);
    }

    await serverData.save();
  }

  const levelUpEmbed = new EmbedBuilder()
  .setColor(embedcolor)
  .setDescription(`${user}, у вас новый уровень **${level}** <a:9142tada:1275403174962004053>`)
  .setThumbnail(user.user.displayAvatarURL({ dynamic: true }));

try {
  if (serverData.alert) {
    await targetChannel.send({ embeds: [levelUpEmbed] }).catch(() => {});
  }
} catch (error) {
  // Игнорируем любые ошибки
}
}

