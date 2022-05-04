import { inject, injectable } from "inversify";
import { IDS } from "../types";
import { AddressGenerator } from "./address-generator";

@injectable()
export class MnemonicResponseGenerator {
    @inject(IDS.SERVICE.AddressGenerator) _addressGenerator:AddressGenerator

    getMessage(mnemonic:string, addressCount:number){
        const root = this._addressGenerator.getRoot(mnemonic),
                msg = [];
            
            msg.push('Ethereum:')
            msg.push(this._addressGenerator.getEthAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Ledger:')
            msg.push(this._addressGenerator.getEthLedgerAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Ethereum Classic:')
            msg.push(this._addressGenerator.getEtcAddresses(root,addressCount).join("\n"))
            msg.push('')

            msg.push('Solana:')
            msg.push(this._addressGenerator.getSolanaAddresses(mnemonic,addressCount).join("\n"))
            msg.push('')

            msg.push('Bitcoin:')
            msg.push(this._addressGenerator.getBTCAddress(mnemonic,addressCount).join("\n"))
            msg.push('') 

            return msg.join('\n')
    }
}