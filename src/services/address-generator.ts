import { Keypair } from "@solana/web3.js";
import { mnemonicToSeedSync } from "bip39";
import EthereumHDKey from "ethereumjs-wallet/dist/hdkey";
import { inject, injectable } from "inversify";
import { IDS } from '../types';
import { derivePath } from 'ed25519-hd-key';
import * as btcjs from "bitcoinjs-lib";
import { BIP32Interface, fromSeed } from "bip32";
import * as cardano from 'cardano-wallet';
import * as createHash from 'create-hash';
import * as bech32 from 'bech32';

const ethBasePath = `m/44'/60'/0'/0`,
    ethBasePathLedger = `m/44'/60'/0'`,
    etcBasePath = `m/44'/61'/0'/0`;

enum BtcPath {
    Legacy=`m/44'/0'/0'/0`,
    Ledger=`m/44'/0'`,
    Segwit=`m/84'/0'/0'`,
    Electrum=`m/84'/0'`
}

enum BtcType {
    Legacy,
    Segwit,
    Segwit_p2sh,
    Electrum
}

const LITECOIN_NETWORK = {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
  };

const DASH_NETWORK = {
    messagePrefix: 'unused',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
    },
    pubKeyHash: 0x4c,
    scriptHash: 0x10,
    wif: 0xcc
};

interface GenerateOptions {
    basePath: string
    count?: number
    prefix?: string
    type?: BtcType
    network?: any
    addressNormalizer?: (addr) => string
}

export interface AddressInfo {
    address: string
    path: string
    note?: string
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

    _getAddresses(root: EthereumHDKey, opts: GenerateOptions): AddressInfo[] {
        const count = opts.count || 3,
            prefix = opts.prefix || '';

        const addresses:AddressInfo[] = [];
        for(let i = 0; i < count; i++){
            const {path,wallet} = this._getWallet(root, i, opts),
                addrBuffer = wallet.getAddress();

            const address = prefix + 
                (opts.addressNormalizer 
                    ? opts.addressNormalizer(addrBuffer) 
                    : addrBuffer.toString('hex'));

            addresses.push({address, path});
        }
        
        return addresses;
    }

    _getWallet(root: EthereumHDKey, index, opts: GenerateOptions){
        const path = `${opts.basePath}/${index}`,
            wallet = root.derivePath(path).getWallet();

        return { path, wallet}
    }

    _getSolanaAddr(seed, walletIndex){
        const path = `m/44'/501'/${walletIndex}'/0'`,
            keys = derivePath(path, seed.toString('hex')),
            pair = Keypair.fromSeed(keys.key),
            address = pair.publicKey.toString();

        return {path, address};
    }

    getEthAddresses(root: EthereumHDKey, count: number):AddressInfo[]{
        return this._getAddresses(root, {basePath: ethBasePath, count, prefix:'0x'});
    }
    
    getEthLedgerAddresses(root: EthereumHDKey, count: number):AddressInfo[]{
        return this._getAddresses(root, { basePath: ethBasePathLedger, count, prefix:'0x'});
    }

    getEtcAddresses(root: EthereumHDKey, count: number):AddressInfo[]{
        return this._getAddresses(root, {basePath: etcBasePath, count, prefix:'0x'})
    }

    getSolanaAddresses(mnemonic: string, count: number):AddressInfo[]{
        const addresses:AddressInfo[] = [],
            seed = this.getSeed(mnemonic)

        for(let i = 0; i < count; i++){
            addresses.push(this._getSolanaAddr(seed, i));
        }

        return addresses;
    }

    getBtcAddresses(seed: Buffer, count:number):AddressInfo[]{
        const paths = [BtcPath.Electrum,BtcPath.Ledger,BtcPath.Legacy,BtcPath.Segwit],
            types = [BtcType.Legacy,BtcType.Segwit,BtcType.Segwit_p2sh];

        const addresses:AddressInfo[] = [];

        for(let i in types){
            for(let j in paths){
                for(let index = 0; index < count; index++){
                    addresses.push(...this._getBTCAddress(seed, {count, type:types[i], basePath: paths[j], network: btcjs.networks.bitcoin }))
                }
            }
        }

        return addresses;
    }

    _getBTCAddress(seed: Buffer, opts:GenerateOptions):AddressInfo[]{
        const root = fromSeed(seed),
            addresses:AddressInfo[] = [];

        for(let i = 0; i < opts.count; i++){
            const path = `${opts.basePath}/${i}`,
                addrNode = root.derivePath(path),
                network = opts.network || null;

                let address:string;
                let note: string;
                if(opts.addressNormalizer){
                    address = opts.addressNormalizer(addrNode);
                } else if(opts.type == BtcType.Segwit){
                    address = btcjs.payments.p2wpkh({pubkey: addrNode.publicKey, network}).address;
                    note = 'segwit p2wpkh'
                } else if(opts.type == BtcType.Segwit_p2sh){
                    address = btcjs.payments.p2sh({
                        redeem: btcjs.payments.p2wpkh({pubkey: addrNode.publicKey, network}), network
                    }).address
                    note = 'segwit p2sh'
                } else {
                    address = btcjs.payments.p2pkh({pubkey: addrNode.publicKey, network}).address;
                    note = 'p2pkh'
                }
                

            addresses.push({address, path, note})
        }

        return addresses;
    }

    getLTCAddresses(seed: Buffer, count: number):AddressInfo[]{
        const addresses:AddressInfo[] = [],
            types = [BtcType.Legacy,BtcType.Segwit_p2sh,BtcType.Segwit],
            paths = [`m/44'/2'/0'/0`,`m/44'/60'/0'/0`];

        for(let p in paths){
            for(let t in types){
                addresses.push(...this._getBTCAddress(seed,{count, basePath:paths[p], type: types[t], network: LITECOIN_NETWORK}))
            }
        }

        return addresses;
    }

    getADAAddresses(mnemonic: string, count: number):AddressInfo[]{
        const addresses: AddressInfo[] = [];

        const entropy = cardano.Entropy.from_english_mnemonics(mnemonic);
        const wallet = cardano.Bip44RootPrivateKey.recover(entropy,'');

        const accIndex = cardano.AccountIndex.new(0 | 0x80000000);
        const account = wallet.bip44_account(accIndex);
        const accountPublic = account.public();

        const chainPub = accountPublic.bip44_chain(false);
        
        for(let i = 0; i < count; i++){
            addresses.push(this._getADAAddr(chainPub, i))
        }

        return addresses;
    }

    _getADAAddr(chainPub:cardano.Bip44ChainPublic , index):AddressInfo{
        
        const addrIndex = cardano.AddressKeyIndex.new(index);
        const keyPub = chainPub.address_key(addrIndex);

        const settings = cardano.BlockchainSettings.mainnet();
        const address = keyPub.bootstrap_era_address(settings);

        return {address: address.to_base58(), path: `m/44'/1815'/0'/0/${index}`};
    }

    getDashAddresses(seed:Buffer, count: number){
        return this._getBTCAddress(
            seed,{
                count, 
                basePath:`m/44'/5'/0'/0`,
                type: BtcType.Legacy,
                network: DASH_NETWORK
            })
    }

    getAtomAddresses(seed: Buffer, count: number){
        return this._getBTCAddress(
            seed,{
                count, 
                basePath:`m/44'/118'/0'/0`,
                type: BtcType.Legacy,
                addressNormalizer: (addrNode:BIP32Interface)=>{
                    const hrp = "cosmos";
                    const sha256_ed = createHash("sha256").update(addrNode.publicKey).digest();
                    const ripemd160_ed = createHash("rmd160").update(sha256_ed).digest();
                    return bech32.encode(hrp, bech32.toWords(ripemd160_ed));
                }
            })
    }
}