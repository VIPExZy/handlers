const { rank } = require('../mongoDB'); // Подключение к схеме базы данных

// Функция для получения цвета статуса
function getStatusColor(status) {
    switch (status) {
        case 'online':
            return '#43b581'; // Зеленый цвет для статуса "В сети"
        case 'idle':
            return '#faa61a'; // Желтый цвет для статуса "Нет на месте"
        case 'dnd':
            return '#f04747'; // Красный цвет для статуса "Не беспокоить"
        case 'offline':
        default:
            return '#747f8d'; // Серый цвет для статуса "Не в сети" или если статус не определен
    }
}

// Функция для вычисления опыта до следующего уровня
function calculateExpToNextLevel(level) {
    return level * 100; // Каждый уровень требует на 100 XP больше, чем предыдущий
}

// Обработчик опыта и уровней
function init(client) {
    // Обработчик сообщений в чате
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return; // Игнорируем сообщения от ботов и в личных сообщениях

        const guildId = message.guild.id;
        const userId = message.author.id;

        let rankData = await rank.findOne({ guildId, userId });
        if (!rankData) {
            rankData = new rank({
                guildId,
                userId,
                level: 0,
                exp: 0,
                expToNextLevel: calculateExpToNextLevel(1),
            });
        }

        let xpGain = Math.floor(Math.random() * 10) + 5; // Случайное число опыта от 5 до 15

        // Проверка на NaN
        if (!isNaN(xpGain)) {
            rankData.exp += xpGain;
        } else {
            console.error(`xpGain is NaN, skipping update for exp for user ${userId}`);
        }

        while (!isNaN(rankData.exp) && rankData.exp >= rankData.expToNextLevel) {
            rankData.exp -= rankData.expToNextLevel;
            rankData.level++;
            rankData.expToNextLevel = calculateExpToNextLevel(rankData.level);
        }

        // Проверка на NaN перед сохранением
        if (!isNaN(rankData.exp)) {
            await rankData.save();
        } else {
            console.error(`rankData.exp is NaN, skipping save for user ${userId}`);
        }
    });
}

// Экспортируем функции и обработчики
module.exports = {
    getStatusColor,
    calculateExpToNextLevel,
    init,
};
