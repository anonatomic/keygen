import { mnemonicToSeedSync } from "bip39";
import EthereumHDKey from "ethereumjs-wallet/dist/hdkey";

const basePath = `m/44'/60'/0'/0`

export function getAddresses(seedPhrase:string, count:number = 3){
    const buffer = mnemonicToSeedSync(seedPhrase)
    const root = EthereumHDKey.fromMasterSeed(buffer);
    const addresses = [];
    for(let i = 0; i < count; i++){
        const address = '0x' + root.derivePath(basePath+`/${i}`).getWallet().getAddress().toString('hex'); 
        addresses.push(address)
    }
    
    return addresses;
}