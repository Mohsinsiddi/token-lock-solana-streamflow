import { BN } from "bn.js";
import {
  Types,
  GenericStreamClient,
  getBN,
  getNumberFromBN,
  StreamflowSolana,
} from "@streamflow/stream";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { SolanaStreamClient } from "@streamflow/stream/dist/solana";
import { ICluster } from "@streamflow/stream/dist/common/types";

// const client = new GenericStreamClient<Types.IChain.Solana>({
//   chain: Types.IChain.Solana, // Blockchain
//   clusterUrl:
//     "https://solana-devnet.g.alchemy.com/v2/_SIn8vkln9lc1Z7BIj7jCYf5VNnKbOCt", // RPC cluster URL
//   cluster: Types.ICluster.Devnet, // (optional) (default: Mainnet)
//   // ...rest chain specific params e.g. commitment for Solana
//   programId: STREAMFLOW_DEVNET_PROGRAM_ID,
// });

const pvtKey = "";
export const wallet = Keypair.fromSecretKey(bs58.decode(pvtKey));
console.log("Wallet Pubkey", wallet.publicKey.toBase58());

const RPC_URL =
  "https://solana-devnet.g.alchemy.com/v2/_SIn8vkln9lc1Z7BIj7jCYf5VNnKbOCt";

const main = async () => {
  const STREAMFLOW_DEVNET_PROGRAM_ID =
    "HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ";
  const client = new SolanaStreamClient(
    RPC_URL,
    ICluster.Devnet,
    "max",
    STREAMFLOW_DEVNET_PROGRAM_ID
  );

  const TOKEN_MINT_ADDRESS = "J5A4oMQ52FTGJVnJX5kHWc2jYuPACFWyUxprW86HrWvt";
  const RECIPIENT_ADDRESS = "DzZvW7sP2RVxHbDNXiD5uXG1AQca58UfAXSgKASqAwti";

  const currTimeStamp = Math.floor(Date.now() / 1000);

  const createStreamParams: Types.ICreateStreamData = {
    recipient: RECIPIENT_ADDRESS, // Recipient address.
    tokenId: TOKEN_MINT_ADDRESS, // Token mint address.
    start: currTimeStamp + 60, // Timestamp (in seconds) when the stream/token vesting starts.
    amount: getBN(25, 9), // depositing 100 tokens with 9 decimals mint.
    period: 1, // Time step (period) in seconds per which the unlocking occurs.
    cliff: currTimeStamp + 90, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: getBN(10, 9), // amount released on cliff for this recipient
    amountPerPeriod: getBN(1, 9), //amount released every specified period epoch
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
    sender: wallet, // SignerWalletAdapter or Keypair of Sender account
    isNative: false,
    // [optional] [WILL CREATE A wSOL STREAM] Wether Stream or Vesting should be paid with Solana native token or not
  };
  try {
    // Create Token Lock
    // const res = await client.create(createStreamParams, solanaParams); // second argument differ depending on a chain
    // console.log("Lock Id", res.metadataId);

    // feed metadata and check details of Lock
    const metadataId = "8n4Ezm8C5Zng1UHjstiAvQnQGzD745DEHYm9wy2RjucM";
    const data: Types.IGetOneData = {
      id: metadataId, // Identifier of a stream
    };

    try {
      // current timestamp
      const currTimeStamp = Math.floor(Date.now() / 1000);

      // function to get Withdrawn Amount from Token Lock
      const stream = await client.getOne(data);
      console.log("Withdrawn Amount", stream.withdrawnAmount.toString());

      // function to check how much is unlocked and can be withdrawn
      const unlocked = stream.unlocked(currTimeStamp); // bn amount unlocked at the tsInSeconds
      console.log(getNumberFromBN(unlocked, 9));
    } catch (exception) {
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
    } catch (exception) {
      // handle exception
      console.log("Withdrawal Error =>", exception);
    }
  } catch (exception) {
    // handle exception
    console.log("Error => ", exception);
  }
};
main();
