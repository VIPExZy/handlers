const { money } = require('../mongoDB'); // Импортируем модель Money из файла models.js

module.exports = {
  init: async (client) => {
    const defaultPercentageIncrease = 5; // Увеличение баланса по умолчанию в процентах
    const defaultTimeInterval = 300000; // Время по умолчанию в миллисекундах (5 минут)

    setInterval(async () => {
      try {
        const users = await money.find({ status: "on" }); // Находим пользователей со статусом "on"
        for (const user of users) {
          const percentageIncrease = user.percentage ? parseFloat(user.percentage) : defaultPercentageIncrease;
          const timeInterval = user.time ? user.time : defaultTimeInterval;

          const increaseAmount = Math.floor((user.bankBalance * percentageIncrease) / 100); // Вычисляем увеличение баланса
          user.bankBalance += increaseAmount; // Увеличиваем баланс
          await user.save(); // Сохраняем обновленные данные о деньгах пользователя
          console.log(`Баланс в банке для пользователя ${user.userID} увеличен.`);
        }
      } catch (error) {
        console.error('Ошибка при увеличении баланса в банках:', error);
      }
    }, defaultTimeInterval); // Устанавливаем интервал выполнения кода по умолчанию
  },
};
