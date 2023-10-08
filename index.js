import schedule from 'node-schedule';
import { Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import { createWriteStream } from 'fs';
import { format } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const poll_chat_id = process.env.POLL_CHAT_ID
const log_chat_id = process.env.LOG_CHAT_ID
const telegram_token = process.env.TELEGRAM_TOKEN

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var log_file = createWriteStream(__dirname + '/debug.log', { flags: 'a' });
var log_stdout = process.stdout;

const log = function (d) { //
    log_file.write(new Date().toISOString() + ' ' + format(d) + '\n');
    log_stdout.write(new Date().toISOString() + ' ' + format(d) + '\n');
};

const bot = new Telegraf(telegram_token);

bot.on(message('text'), async (ctx) => {
    log(JSON.stringify(ctx.message))

    bot.telegram.sendMessage(log_chat_id, JSON.stringify(ctx.from));
})

bot.on('poll_answer', async (ctx) => {
    log(JSON.stringify(ctx.update))
})

const job = schedule.scheduleJob('0 6 * * 2,4', function () {
    bot.telegram.sendPoll(poll_chat_id, "Тренировка", ["+", "-"], {
        is_anonymous: false,
    });
});

bot.launch()