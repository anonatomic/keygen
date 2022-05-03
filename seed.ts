import * as dotenv from 'dotenv';

dotenv.config();

import 'reflect-metadata'
import { container } from './src/ioc';
import { IDS } from './src/types';
import { AddressGenerator } from './src/services/address-generator';
import { mnemonicToSeedSync } from 'bip39';
import { Keypair } from '@solana/web3.js';
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import * as bip32 from 'bip32';
import { derivePath } from 'ed25519-hd-key'

const addressGenerator:AddressGenerator = container.get(IDS.SERVICE.AddressGenerator);

//const seed = 'collect square brief bronze lunch pattern april tube edit nothing speed kingdom decrease forget picture'
const seedSoftware = 'opinion evidence tray poem tiger above recipe bomb zero dwarf brain hen'
const solanaMnemonic = 'gown ritual kidney enter unable upper sad body regular flight suit also grape face law install state practice rigid oppose grape stool episode radar'
const solanaPath = `m/44'/501'/1'/0'`

const seed = mnemonicToSeedSync(seedSoftware)

const address = derivePath(solanaPath, seed.toString('hex')  ).key;
const pair = Keypair.fromSeed(address);

console.log(pair.publicKey.toString())
/*
const root = bip32.fromSeed(seed).derivePath(solanaPath) ;
const pair2 = Keypair.fromSeed(root.privateKey)
console.log(pair2.publicKey.toString())*/


