const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { embedcolor } = require('../config.json');
const { clientIdentificator } = require("../config.json") ; // Укажите ваш clientId

module.exports = {
  init: async (client) => {
    client.on('guildCreate', async (guild) => {
      // Получаем список каналов на сервере, к которым бот имеет доступ
      const channels = guild.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildText && 
        channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
      );

      // Выбираем случайный канал из списка доступных каналов
      const randomChannel = channels.random();

      if (!randomChannel) {
        console.log('Не удалось найти доступный канал для отправки сообщения.');
        return;
      }

      // Создаем кнопки для добавления бота и ссылок
      const addButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Мой сайт')
        .setURL('https://shiru.ru/');

      const addButton2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Я на Top.gg')
        .setURL('https://top.gg/bot/1200794422397378600');

      const addButton3 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Я на Boticord')
        .setURL('https://boticord.top/bot/1200794422397378600');

      const addButton4 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Добавить меня')
        .setURL(`https://discord.com/oauth2/authorize?client_id=${clientIdentificator}&permissions=1102464511094&scope=bot`);

      // Создаем action row и добавляем кнопки
      const row = new ActionRowBuilder().addComponents(addButton, addButton2, addButton3, addButton4);

      // Создаем embed сообщение
      const embed = new EmbedBuilder()
        .setColor(embedcolor)
        .setTitle('Привет!')
        .setDescription(`Спасибо, что добавили меня на этот замечательный сервер **${guild.name}**! <a:7122motionlilahello:1223239494283558962>\n\n✌️ Познакомьтесь с нашим многофункциональным Discord ботом!\n
          <a:Yellow_gears:1256124202872733698> Shiru создана для того, чтобы сделать ваше пребывание на сервере максимально удобным, увлекательным, а ещё помочь в модерировании сервера. Давайте подробнее рассмотрим мои функции:\n
          <:Symbol_Forward_Slash:1256124616464666707> Slash-команды: Наш бот поддерживает slash-команды, что делает взаимодействие с ним простым и интуитивным. Вам больше не нужно запоминать сложные префиксы и команды.\n
          <a:tada_animated:1256124889044357120> Весёлости: Бот добавит веселья на ваш сервер с помощью мини-игр, викторин и развлечений.\n
          <:earth:1256125724708835500> Мультиязычность: Бот говорит на нескольких языках, что идеально для международных серверов.\n
          <:moderator_shield:1256126075319222292> Модерация: Мощные инструменты для управления сервером и поддержания порядка.\n
          <:AutoMod:1256126229472481320> Автомодерация: Бот фильтрует контент и автоматически применяет санкции при необходимости.\n
          <:ChatGPT:1256126409009532938> Искусственный интеллект: AI помогает отвечать на вопросы и вести осмысленные беседы.\n
          <a:moneywings:1256126947298246667> Экономика: Виртуальная валюта и внутриигровая экономика для поощрения активности.\n
          <:play:1253420039038828656> Музыка: Проигрывание музыки с Яндекс.Музыка, Вк.Музыка и других сервисов.\n
          🎉 Розыгрыши: Система розыгрышей, работающая даже после перезагрузки бота.\n
          🏆 Система уровней: Получайте уровни за активность на сервере.\n
          💍 Свадьбы: Уникальные свадебные церемонии на сервере.\n
          💛 Премиум: Доступ к эксклюзивным функциям и премиум-подписке.\n
          📊 Статистика: Актуальная информация о пользователях и ботах в названиях каналов.\n\n
          **__Бот находится на бета-тесте. Большинство команд в разработке.__** <a:PinkShinyHeart:1256127804169256992>`)
        .setFooter({ text: 'Контакты для связи: support@shiru.ru | Разработчик: jianaze' });

      // Отправляем embed сообщение в случайный канал
      await randomChannel.send({ embeds: [embed], components: [row] });
    });
  }
};
