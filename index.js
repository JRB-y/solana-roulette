// const inquirer = require("inquirer");
import inquirer from "inquirer";
import chalk from 'chalk';
import figlet from "figlet";
import { totalAmtToBePaid, getReturnAmount, randomNumber } from "./helper.js";
import { airDropSOL, getWalletBalance, transferSOL } from "./solana.js";


import bs58 from 'bs58';

const address = '2EchxoZ95iBPWd89etYGTF75z8WQejqo4iNryLS8LataN5sub6eePiim46yCRfYy3TS2AUg2hjd9CQq8Jzgvh16E';
const bytes = bs58.decode(address);
console.log(bytes);
console.log(Buffer.from(bytes).toUint8Array());

process.exit(0);

const SECRET = [
  61, 194, 51, 96, 130, 231, 124, 21, 127, 62, 50,
  206, 174, 199, 161, 221, 177, 41, 111, 113, 226, 15,
  15, 187, 82, 10, 28, 38, 103, 168, 213, 3, 108,
  3, 129, 127, 219, 95, 159, 145, 146, 207, 195, 1,
  239, 233, 114, 105, 244, 183, 8, 31, 148, 183, 199,
  99, 50, 97, 79, 76, 143, 126, 40, 223
];


const VOLT = Keypair.fromSecretKey(Uint8Array.from(SECRET))

const USER_SECRET_KEY = [
  229, 65, 12, 110, 128, 101, 62, 119, 239, 95, 26,
  67, 178, 99, 40, 77, 46, 151, 163, 227, 167, 5,
  138, 101, 140, 195, 212, 161, 105, 216, 79, 73, 6,
  85, 188, 71, 255, 12, 214, 102, 84, 170, 129, 127,
  64, 57, 133, 22, 10, 9, 135, 34, 75, 223, 107,
  252, 253, 22, 242, 135, 180, 245, 221, 155
];

const USER_WALLET = Keypair.fromSecretKey(Uint8Array.from(USER_SECRET_KEY));

console.log('pubKey', USER_WALLET.privateKey);
import { Keypair } from "@solana/web3.js";

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("SOL ROULETTE", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
  console.log(chalk.yellow("The max bidding amount is 5 SOL here!"));
};

const askQuestions = () => {
  const questions = [
    {
      name: "SOL",
      type: "number",
      message: "How much SOL do you want to invest?",
      validate: function (value) {
        var pass = !isNaN(value)
        if (pass) {
          return true
        }
        return 'Please enter a amount of SOL'
      }
    },
    {
      type: "rowlist",
      name: "RATIO",
      message: "What is the ratio of winning to losing?",
      choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
      filter: function(val) {
        const stackFactor = val.split(":")[1];
        return stackFactor;
      }
    },
    {
      type: "number",
      name: "RANDOM",
      message: "Guess the random number between 1 and 5 (bot 1 and 5 included)",
      when: async (val) => {
        if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
          console.log(chalk.red("Stack with smaller amount"));
          return false;
        }

        console.log(chalk.green`You need to pay ${totalAmtToBePaid(val.SOL)}SOL to move forward!`);
        const userBalance = await getWalletBalance(USER_WALLET.publicKey.toString());
        console.log('userBalance', userBalance);
        if (userBalance < totalAmtToBePaid(val.SOL)) {
          console.log(chalk.red`You don't have enough balance in your wallet`);
          return false;
        }

        console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if guessing the number`);
        return true;
      }
    }
  ]

  return questions;
}


const gameExec = async () => {
  init();
  const generateRandomNumber = randomNumber(1, 5);
  const answers = await inquirer.prompt(askQuestions());
  if (answers.RANDOM) {
    const paymentSignature = await transferSOL(USER_WALLET, VOLT, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));
    console.log(`Signature of payment for playing the game`, chalk.green`${paymentSignature}`);
    if (answers.RANDOM === generateRandomNumber) {
      await airDropSOL(VOLT, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));
      const prizeSignature = await transferSOL(VOLT, USER_WALLET, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));
      console.log(chalk.green`Your guess is absolutely correct`);
      console.log(`Here is the price signature `, chalk.green`${prizeSignature}`)
    } else {
      console.log(chalk.yellowBright`The number was ${generateRandomNumber}`);
      console.log(chalk.yellowBright`Better luck next time`);
    }

  }
}

gameExec();
