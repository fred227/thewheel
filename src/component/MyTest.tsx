import { Button ,TextField} from '@mui/material';
import React, { FC, useContext, useState,useMemo,useCallback } from 'react';
import {AppCtx} from '../MyContext'
import {SystemProgram, TransactionSignature} from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { Program, Provider, BN } from '@project-serum/anchor';
import { Connection,PublicKey,ConfirmOptions} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react'
import {PDATHEWHEEL_DATA_LAYOUT, PUBLICKEY_PROGRAM} from '../MyContext'

export const MyTest: FC = () => {


  const { publicKey } = useWallet();

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const AnchorWallet = useAnchorWallet();
const opts : ConfirmOptions = {  preflightCommitment: 'confirmed', }
const idl = require('../data/the_wheel_official3.json');
const provider = new Provider( connection, AnchorWallet!, opts );
const program = new anchor.Program(idl, PUBLICKEY_PROGRAM,provider);

    const TheWheelPDAAccount = new Promise<[PublicKey,number]>( async (r,e)  =>{
        let [thewheelAccount, thewheelBump ] =  await anchor.web3.PublicKey
        .findProgramAddress( [Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer()],PUBLICKEY_PROGRAM );
        return r([thewheelAccount,thewheelBump]);
      });
    

     const initialize = useCallback( async () => {

        TheWheelPDAAccount.then( async (value) => {

            console.log("PUBLICKEY_PROGRAM",PUBLICKEY_PROGRAM.toString());
            console.log("thewheelAccount=",value![0]!.toString())
            console.log("thewheelBump=",value![1]!)
            console.log("publicKey=",publicKey?.toString())
      
         const tx = await program!.rpc.initialize( new BN(254),{     
            accounts: {
              creator: publicKey! ,
              thewheelaccount: value![0],
              systemProgram: SystemProgram.programId,
          },});

          console.log("Your transaction signature", tx);

        });

        

 
          },[]);



  return  <Button id="init" variant="contained"   onClick={initialize} >initialize</Button>


;
  }
