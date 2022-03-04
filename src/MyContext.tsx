import { Connection,PublicKey , ConfirmOptions} from '@solana/web3.js';
import React, { useState, FC, createContext, useMemo} from 'react';
import * as anchor from '@project-serum/anchor';
import { Program, Provider } from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as borsh from "@project-serum/borsh";
import { exit } from 'process';

import idl from './data/the_wheel_official3.json';

export const MAX_SESSIONS = 9;
export const MAX_WINNERS = 5;
export const MIN_DEPOSIT = 10000000;
export const LIMIT_TIME_FOR_DEPOSIT_INMS = 60*1000;//60*60*24*1000;

export const PUBLICKEY_PROGRAM = new PublicKey("39D9W9evHuroXaBg7P48Z3ovJsyYvr4LUN7P8V9oGJ1Y");

/* pub struct TheWheelAccount { // PDA = "thewheel"+id()
  pub is_initialized: u8,
  pub time_initialization: i64,
  pub arrarysession: [u8; 9], // games available max = 9
  pub winners: BTreeMap<u8, Pubkey>, 
  pub pendingmap: BTreeMap<Pubkey, u8> // pending list : Pubkey session - value
}
 */

export const PDATHEWHEEL_DATA_LAYOUT = borsh.struct([
  borsh.u8("is_initialized"),
  borsh.i64("time_initialization"),
  borsh.array(borsh.u8("session"),MAX_SESSIONS,"sessionmap"),
  borsh.map(borsh.u8("session"),borsh.publicKey("player"), "winners"),
  borsh.map(borsh.publicKey("player"), borsh.u8("session"), "pendingmap"),
]);

/* pub struct GameAccount { // PDA = "thewheel"+id()+session
  pub is_initialized: u8,
  pub is_lock: u8,  // lock when winner is knew
  pub winner: Pubkey,  // winner pubkey
  pub sessionnumber: u8,
  pub max_players: u8,
  pub players_in_game: u8,
  pub launching_date: i64, // launching date when turn wheel
  pub ledger: BTreeMap<Pubkey, u64> // Pubkey player - lamports deposit max player = 30
} */

export const PDAGAME_DATA_LAYOUT = borsh.struct([
  borsh.u8("is_initialized"),
  borsh.u8("is_lock"),
  borsh.publicKey("winner"),
  borsh.u8("sessionnumber"),
  borsh.u8("max_players"),
  borsh.u8("players_in_game"),
  borsh.i64("launchingdate"),
  borsh.map(borsh.publicKey("player"), borsh.u64("lamports"), "ledger"),
]);

interface AppContextInterface {
    PDAProgram: Promise<PublicKeyAndBuffer>,
    connection: Connection,
    program: anchor.Program<anchor.Idl>,
    update:number,
    setupdate: React.Dispatch<React.SetStateAction<number>>,
}

export const AppCtx = createContext<Partial<AppContextInterface>>({});

//const connection = new Connection("http://localhost:8899", "confirmed");


export type PublicKeyAndBuffer = [PublicKey, anchor.web3.AccountInfo<Buffer>];

export const MyContext: FC = ({ children }) => {

    const [update,setupdate] = useState(0);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const AnchorWallet = useAnchorWallet();
    const opts : ConfirmOptions = {  preflightCommitment: 'confirmed', }
    //const idl = require('./data/the_wheel_official3.json');

    const provider = new Provider( connection, AnchorWallet!, opts );
    const program = new Program(idl, PUBLICKEY_PROGRAM, provider);



    
    const PDAProgram :  Promise<PublicKeyAndBuffer >=  useMemo( async () => {
      let [voteAccount, ] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer()],PUBLICKEY_PROGRAM );
      const PDATheWheelAccountInfo = await connection!.getAccountInfo(voteAccount);
        if (voteAccount!= null && PDATheWheelAccountInfo != null){
          const myPublicKeyAndBuffer: PublicKeyAndBuffer = [voteAccount,PDATheWheelAccountInfo]
          console.log("PDA TheWheel Account in MyContext =", voteAccount.toString());
          return myPublicKeyAndBuffer;
        }else{
         exit();
        }
      },[update,PUBLICKEY_PROGRAM]);

      //extraction des données
 



    return (
      <AppCtx.Provider
        value={{
             PDAProgram, connection, program,update,setupdate,
        }}
      >
        {children}
      </AppCtx.Provider>
    );
  };

