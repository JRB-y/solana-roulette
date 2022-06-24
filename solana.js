import web3, { PublicKey } from '@solana/web3.js';

export const transferSOL = async (from, to, transferAmt) => {
  try {
    const connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: new PublicKey(from.publicKey.toString()),
        toPubkey: new PublicKey(to.publicKey.toString()),
        lamports: transferAmt * web3.LAMPORTS_PER_SOL,
      })
    );

    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [from],
    );

    return signature;
  } catch (error) {
    console.log('err: ', error);
  }
}

export const getWalletBalance = async (pubk) => {
  try {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
    const balance = await connection.getBalance(new PublicKey(pubk));
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (error) {
    console.log('err ', error);
  }
}

export const airDropSOL = async (wallet, tranferAmt) => {
  try {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet", "confirmed"));

    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(wallet.publicKey.toString()),
      tranferAmt * web3.LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(fromAirDropSignature);
  } catch (error) {
    
  }
}
