import { Container } from "inversify";
import { Telegraf } from "telegraf";
import { IDS } from './types';
import { BotInitializer } from './bot/bot-initializer';
import { AddressGenerator } from './services/address-generator';
import { Keypair } from "@solana/web3.js";

export const container = new Container();

container.bind(IDS.Telegraf).toDynamicValue(context =>{
    return new Telegraf(process.env.TELEGRAM_BOT_API_KEY);
});

container.bind(IDS.BotInitializer).to(BotInitializer);
container.bind(IDS.SERVICE.AddressGenerator).to(AddressGenerator);
container.bind(IDS.SolanaKeypair).toConstantValue(Keypair)