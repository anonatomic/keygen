import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import EthereumHDKey from "ethereumjs-wallet/dist/hdkey";
import { inject, injectable } from "inversify";
import { IDS } from '../types';
import { derivePath } from 'ed25519-hd-key';
import * as btcjs from "bitcoinjs-lib";
import { fromSeed } from "bip32";

const ethBasePath = `m/44'/60'/0'/0`,
    ethBasePathLedger = `m/44'/60'/0'`,
    etcBasePath = `m/44'/61'/0'/0`;

interface GenerateOptions {
    basePath: string
    count?: number
    prefix?: string
    addressNormalizer?: (addr) => string
}

@injectable()
export class AddressGenerator {
    @inject(IDS.SolanaKeypair) _solana:Keypair

    getRoot(mnemonic): EthereumHDKey {
        return EthereumHDKey.fromMasterSeed(
            this.getSeed(mnemonic)
        );
    }

    getSeed(mnemonic){
        return mnemonicToSeedSync(mnemonic);
    }

    _getAddresses(root: EthereumHDKey, opts: GenerateOptions){
        const count = opts.count || 3,
            prefix = opts.prefix || '';

        const addresses = [];
        for(let i = 0; i < count; i++){
            const wallet = this._getWallet(root, i, opts),
                addrBuffer = wallet.getAddress();

            const address = prefix + 
                (opts.addressNormalizer 
                    ? opts.addressNormalizer(addrBuffer) 
                    : addrBuffer.toString('hex'));

            addresses.push(address)
        }
        
        return addresses;
    }

    _getWallet(root: EthereumHDKey, index, opts: GenerateOptions){
        return root.derivePath(opts.basePath+`/${index}`).getWallet()
    }

    _getSolanaAddr(seed, walletIndex){
        const keys = derivePath(`m/44'/501'/${walletIndex}'/0'`, seed.toString('hex')),
            pair = Keypair.fromSeed(keys.key);

        return pair.publicKey.toString();
    }

    getEthAddresses(root: EthereumHDKey, count: number){
        return this._getAddresses(root, {basePath: ethBasePath, count, prefix:'0x'});
    }
    
    getEthLedgerAddresses(root: EthereumHDKey, count: number){
        return this._getAddresses(root, { basePath: ethBasePathLedger, count, prefix:'0x'});
    }

    getEtcAddresses(root: EthereumHDKey, count: number){
        return this._getAddresses(root, {basePath: etcBasePath, count, prefix:'0x'})
    }

    getSolanaAddresses(mnemonic: string, count: number){
        const addresses = [],
            seed = this.getSeed(mnemonic)

        for(let i = 0; i < count; i++){
            addresses.push(this._getSolanaAddr(seed, i))
        }

        return addresses;
    }

    getBTCAddress(mnemonic: string, count: number){
        const seed = this.getSeed(mnemonic),
            root = fromSeed(seed),
            addresses = [];

        for(let i = 0; i < count; i++){
            const addrNode = root.derivePath(`m/44'/0'/0'/0/${i}`),
                p2pkh = btcjs.payments.p2pkh({pubkey: addrNode.publicKey});

            addresses.push(p2pkh.address)
        }

        return addresses;
    }
}