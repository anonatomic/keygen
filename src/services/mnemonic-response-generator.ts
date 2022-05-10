import { inject, injectable } from "inversify";
import { IDS } from "../types";
import { AddressGenerator, AddressInfo } from "./address-generator";

@injectable()
export class MnemonicResponseGenerator {
    @inject(IDS.SERVICE.AddressGenerator) _addressGenerator:AddressGenerator

    getMessage(mnemonic:string, addressCount:number){
        const seed = this._addressGenerator.getSeed(mnemonic),
            root = this._addressGenerator.getRoot(mnemonic),
            msg = [],
            foramtAddress = (addrInfo:AddressInfo)=> `${addrInfo.address} (${addrInfo.path}${addrInfo.note ? (' ' + addrInfo.note) :''})`;
            
            msg.push('Ethereum:')
            msg.push(this._addressGenerator.getEthAddresses(root,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Ledger:')
            msg.push(this._addressGenerator.getEthLedgerAddresses(root,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Ethereum Classic:')
            msg.push(this._addressGenerator.getEtcAddresses(root,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Solana:')
            msg.push(this._addressGenerator.getSolanaAddresses(mnemonic,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Bitcoin:')
            msg.push(this._addressGenerator.getBtcAddresses(seed,1).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Litecoin:')
            msg.push(this._addressGenerator.getLTCAddresses(seed,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            msg.push('Cardano:')
            msg.push(this._addressGenerator.getADAAddresses(mnemonic,addressCount).map(foramtAddress).join("\n"))
            msg.push('')

            return msg.join('\n')
    }
}