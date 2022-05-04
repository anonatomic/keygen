import * as dotenv from 'dotenv';

dotenv.config();

import 'reflect-metadata'
import { container } from './ioc';
import { IDS } from './types';
import { BotInitializer } from './bot/bot-initializer';

const botInitializer:BotInitializer = container.get(IDS.BotInitializer);
const bot = botInitializer.init();

(async()=>{
    const info = await bot.telegram.getMe()

    bot.launch();

    console.log(`bot started`, info)
})()
