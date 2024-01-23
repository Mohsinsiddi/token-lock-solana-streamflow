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

const RPC_URL = "";

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
  const TOKEN_DECIMAL = 9;
  const TOKEN_AMOUNT = 25;
  const CLIFF_AMOUNT = 10;
  const AMOUNT_PER_PERIOD = 1;
  const RECIPIENT_ADDRESS = "DzZvW7sP2RVxHbDNXiD5uXG1AQca58UfAXSgKASqAwti";

  const LOCK_NAME = "TEST 1";

  const currTimeStamp = Math.floor(Date.now() / 1000);

  const START_TIME = currTimeStamp + 90; // will start in 90 seconds
  const CLIFF_TIME = START_TIME + 100;

  const TIME_PERIOD_SECONDS = 1;

  const createStreamParams: Types.ICreateStreamData = {
    recipient: RECIPIENT_ADDRESS, // Recipient address.
    tokenId: TOKEN_MINT_ADDRESS, // Token mint address.
    start: START_TIME, // Timestamp (in seconds) when the stream/token vesting starts.
    amount: getBN(TOKEN_AMOUNT, TOKEN_DECIMAL), // depositing 100 tokens with 9 decimals mint.
    period: TIME_PERIOD_SECONDS, // Time step (period) in seconds per which the unlocking occurs.
    cliff: CLIFF_TIME, // Vesting contract "cliff" timestamp in seconds.
    cliffAmount: getBN(CLIFF_AMOUNT, TOKEN_DECIMAL), // amount released on cliff for this recipient
    amountPerPeriod: getBN(AMOUNT_PER_PERIOD, TOKEN_DECIMAL), //amount released every specified period epoch
    name: LOCK_NAME, // The stream name or subject.
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
    // const resData = await client.create(createStreamParams, solanaParams); // second argument differ depending on a chain
    // console.log("Lock Id", resData.metadataId);

    // feed metadata and check details of Lock
    const metadataId = "FNZSC1FNSXCmmHj2X9iA6Xasaqaqoyt2codadDCpxRLx";
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
