import { inject, injectable } from "inversify";
import { IDS } from '../types';
import { Telegraf } from 'telegraf';
import { AddressGenerator } from '../services/address-generator';
import { MnemonicResponseGenerator } from '../services/mnemonic-response-generator';

@injectable()
export class BotInitializer {
    _addressLimit = 3;
    @inject(IDS.Telegraf) private _bot: Telegraf;
    @inject(IDS.SERVICE.MnemonicResponseGenerator) _mnemonicResponse:MnemonicResponseGenerator

    init(){
        this.initCommands();
        this.initEvents();

        return this._bot;
    }

    initCommands(){
        this._bot.command('start', ctx => {
            ctx.reply(`Send your seed phrase`);
        })
    }

    initEvents(){
        this._bot.on('text', async (ctx)=>{
            const wordsCount = (ctx.message.text.match(/\s/g) || []).length
            if(wordsCount < 10){
                return ctx.reply('seed phrase too short');
            }

            return ctx.reply(
                this._mnemonicResponse.getMessage(ctx.message.text, 3)
            );
        });
    }
}