import { inject, injectable } from "inversify";
import { IDS } from '../types';
import { Telegraf } from 'telegraf';
import { AddressGenerator } from '../services/address-generator';

@injectable()
export class BotInitializer {
    _addressLimit = 3;
    @inject(IDS.Telegraf) private _bot: Telegraf;
    @inject(IDS.SERVICE.AddressGenerator) private _addressGenerator: AddressGenerator;

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
            const mnemonic = ctx.message.text,
                root = this._addressGenerator.getRoot(mnemonic),
                addressCount = 3,
                msg = [];
            
            msg.push('Etherium:')
            msg.push(this._addressGenerator.getEthAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Ledger:')
            msg.push(this._addressGenerator.getEthLedgerAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Etherium Classic:')
            msg.push(this._addressGenerator.getEtcAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Solana:')
            msg.push(this._addressGenerator.getSolanaAddresses(mnemonic,addressCount).join("\n"))
            msg.push('')

            return ctx.reply(msg.join('\n'));
        });
    }
}