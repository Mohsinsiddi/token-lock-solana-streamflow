"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const stream_1 = require("@streamflow/stream");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const solana_1 = require("@streamflow/stream/dist/solana");
const types_1 = require("@streamflow/stream/dist/common/types");
// const client = new GenericStreamClient<Types.IChain.Solana>({
//   chain: Types.IChain.Solana, // Blockchain
//   clusterUrl:
//     "https://solana-devnet.g.alchemy.com/v2/_SIn8vkln9lc1Z7BIj7jCYf5VNnKbOCt", // RPC cluster URL
//   cluster: Types.ICluster.Devnet, // (optional) (default: Mainnet)
//   // ...rest chain specific params e.g. commitment for Solana
//   programId: STREAMFLOW_DEVNET_PROGRAM_ID,
// });
const pvtKey = "";
exports.wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(pvtKey));
console.log("Wallet Pubkey", exports.wallet.publicKey.toBase58());
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const STREAMFLOW_DEVNET_PROGRAM_ID = "HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ";
    const client = new solana_1.SolanaStreamClient("https://solana-devnet.g.alchemy.com/v2/_SIn8vkln9lc1Z7BIj7jCYf5VNnKbOCt", types_1.ICluster.Devnet, "max", STREAMFLOW_DEVNET_PROGRAM_ID);
    const TOKEN_MINT_ADDRESS = "J5A4oMQ52FTGJVnJX5kHWc2jYuPACFWyUxprW86HrWvt";
    const RECIPIENT_ADDRESS = "DzZvW7sP2RVxHbDNXiD5uXG1AQca58UfAXSgKASqAwti";
    const currTimeStamp = Math.floor(Date.now() / 1000);
    const createStreamParams = {
        recipient: RECIPIENT_ADDRESS, // Recipient address.
        tokenId: TOKEN_MINT_ADDRESS, // Token mint address.
        start: currTimeStamp + 60, // Timestamp (in seconds) when the stream/token vesting starts.
        amount: (0, stream_1.getBN)(25, 9), // depositing 100 tokens with 9 decimals mint.
        period: 1, // Time step (period) in seconds per which the unlocking occurs.
        cliff: currTimeStamp + 90, // Vesting contract "cliff" timestamp in seconds.
        cliffAmount: (0, stream_1.getBN)(10, 9), // amount released on cliff for this recipient
        amountPerPeriod: (0, stream_1.getBN)(1, 9), //amount released every specified period epoch
        name: "Test 1.", // The stream name or subject.
        canTopup: false, // setting to FALSE will effectively create a vesting contract.
        cancelableBySender: true, // Whether or not sender can cancel the stream.
        cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
        transferableBySender: true, // Whether or not sender can transfer the stream.
        transferableByRecipient: false, // Whether or not recipient can transfer the stream.
        automaticWithdrawal: false, // Whether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
        withdrawalFrequency: 0, // Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
        partner: undefined, //  (optional) Partner's wallet address (string | null).
    };
    const solanaParams = {
        sender: exports.wallet, // SignerWalletAdapter or Keypair of Sender account
        isNative: false,
        // [optional] [WILL CREATE A wSOL STREAM] Wether Stream or Vesting should be paid with Solana native token or not
    };
    try {
        // Create Token Lock
        const res = yield client.create(createStreamParams, solanaParams); // second argument differ depending on a chain
        console.log("Lock Id", res.metadataId);
        // feed metadata and check details of Lock
        const metadataId = "91TmSKxYcAYYYZd3JA5qoeqQjU5NR9HdtkxPAG4Sdadt";
        const data = {
            id: metadataId, // Identifier of a stream
        };
        try {
            // current timestamp
            const currTimeStamp = Math.floor(Date.now() / 1000);
            // function to get Withdrawn Amount from Token Lock
            const stream = yield client.getOne(data);
            console.log("Withdrawn Amount", stream.withdrawnAmount.toString());
            // function to check how much is unlocked and can be withdrawn
            const unlocked = stream.unlocked(currTimeStamp); // bn amount unlocked at the tsInSeconds
            console.log((0, stream_1.getNumberFromBN)(unlocked, 9));
        }
        catch (exception) {
            // handle exception
            console.log("Fetch Stream Error => ", exception);
        }
        // const withdrawStreamParams: Types.IWithdrawData = {
        //   id: metadataId, // Identifier of a stream to be withdrawn from.
        //   amount: getBN(10, 9), // Requested amount to withdraw. If stream is completed, the whole amount will be withdrawn.
        // };
        // const solanaParamsWithdrawal = {
        //   invoker: wallet, // SignerWalletAdapter or Keypair signing the transaction
        // };
        try {
            //   const res = await client.withdraw(
            //     withdrawStreamParams,
            //     solanaParamsWithdrawal
            //   );
            //   console.log("Withdrawal Res", res);
        }
        catch (exception) {
            // handle exception
            console.log("Withdrawal Error =>", exception);
        }
    }
    catch (exception) {
        // handle exception
        console.log("Error => ", exception);
    }
});
main();
