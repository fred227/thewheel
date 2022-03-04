
import { Button, TextField } from '@mui/material';
import React, { FC, useContext, useMemo, useState, useEffect, useCallback} from 'react';
import { PublicKey} from '@solana/web3.js';
import {AppCtx, MIN_DEPOSIT} from '../MyContext'
import { MySendTransaction } from '../MySendTransaction';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import {PDATHEWHEEL_DATA_LAYOUT, PUBLICKEY_PROGRAM} from '../MyContext'
import { useNotify } from '../notify';
import '../style/PlayerBlock.css';

export const PlayerBlock: FC = () => {

    const { PDAProgram, connection, program,update,setupdate } = useContext(AppCtx);

    const { publicKey } = useWallet();
    const notify = useNotify();

    const [isOnPendingList, setisOnPendingList] = useState(false);
    const [sessionPending, setsessionPending] = useState(0);
    const [playerpublickey, setplayerpublickey] = useState("");
    const [lamportstosend, setlamportstosend] = useState(0);
    const [lamportsonAccount, setlamportsonAccount] = useState(0);

    // Lecture du PDA TheWheel
    useEffect(  () => {
        PDAProgram!.then(
         async (PDATheWheelAccount) => {
            if (PDATheWheelAccount[1]!=null && publicKey!=null){
                const PDATheWheelData = PDATHEWHEEL_DATA_LAYOUT.decode(PDATheWheelAccount[1].data);
                let mypendingmap : Map<PublicKey,number> = PDATheWheelData.pendingmap;
                for (const [key, value] of mypendingmap.entries()) {
                    console.log('MyPlayerBlock=',key.toString())
                    if (key.equals(publicKey!)){
                        setisOnPendingList(true);
                        setsessionPending(value);
                    }
                }
            }else{
                setisOnPendingList(false);
            }
    });},[publicKey,PDAProgram,update!]);
 
    const PDAGAME =  useMemo( async () => {
        var uint8 = new Uint8Array(1);
        uint8[0] = sessionPending;
        if (PUBLICKEY_PROGRAM != null && sessionPending!= 0){
            let [game_account_inner, ] = await anchor.web3.PublicKey
            .findProgramAddress([Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer(),Buffer.from(uint8)],PUBLICKEY_PROGRAM );
            console.log("PDAGAME in MyPlayerBlock= ",sessionPending, game_account_inner.toString());
            return game_account_inner;
        }else{
            console.log("PDAGAME in MyPlayerBlock= null");
            return null;
        }
 
    },[sessionPending]);

    const PDAPLAYER =  useMemo( async () => {
        var uint8 = new Uint8Array(1);
        uint8[0] = sessionPending;
        if (PUBLICKEY_PROGRAM !=null && publicKey!=null && sessionPending!= 0){
            let [PlayerAccount, PlayerAccountBump] =  await anchor.web3.PublicKey
            .findProgramAddress( [Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer(),Buffer.from(uint8), publicKey!.toBuffer()], PUBLICKEY_PROGRAM);
            console.log("PDAPLAYER in MyPlayerBlock= ",sessionPending, PlayerAccount.toString())
            return PlayerAccount;
        }else{
            console.log("PDAPLAYER in MyPlayerBlock = null");
            return null;
        }
    },[sessionPending,publicKey]);


    useEffect( ()=>{
    PDAPLAYER.then(
        (value) =>{ if (value){  setplayerpublickey(value.toString())}}); 
    },[PDAPLAYER]);

    useEffect(  () => {
    PDAPLAYER.then(
        async (PDAGameAccount) => {
            if (PDAGameAccount){
                const PDATheWheelAccountInfoBalance = await connection!.getBalance(PDAGameAccount);
                setlamportsonAccount(PDATheWheelAccountInfoBalance);
            }
    });},[PDAPLAYER]);

    // call confirm transaction
    const confirmdeposit = useCallback( (sessionv) => ()=>{
        Promise.all([PDAProgram, PDAGAME, PDAPLAYER]).then( async (values) => {
            
            console.log("confirmdeposit session=",sessionv);
            if ( values[0] == null){ console.log("confirmdeposit - thewheelaccount==null");return; }
            if ( values[1] == null){ console.log("confirmdeposit - gameaccount==null");return; }
            if ( values[2] == null){ console.log("confirmdeposit - playeraccount==null");return; }

            try{
                const tx = await program!.rpc.confirmdeposit(sessionv,{    
                    accounts: {
                    player: publicKey! ,
                    thewheelaccount: values[0][0],
                    gameaccount : values[1],
                    playeraccount : values[2],
                },});
    
                await connection!.confirmTransaction(tx, 'processed');
                notify('success', 'Transaction successful!', tx);
                

            }catch (error: any) {
                notify('error', `Transaction failed! ${error?.message}`);
            }
            setupdate!(update!+1);


            });
    }, [PDAProgram, PDAGAME, PDAPLAYER]);

    if (!isOnPendingList){
        return <div></div>;
    }else{

    return <article id='playerBlock'>

            <h1>You're on pending list for session game number <a>{sessionPending}</a>. Choose amount of lamports you want to play.</h1>
            <h1>Your PDA Player Account Public Key is : <a>{playerpublickey}</a></h1>
            <h1>Actual balance is : <a id="red">{lamportsonAccount < MIN_DEPOSIT && lamportsonAccount}</a><a id="green">{lamportsonAccount >= MIN_DEPOSIT && lamportsonAccount}</a>. Minimal deposit for a transfer to game Account is {MIN_DEPOSIT} lamports.</h1>
            <div id="send">
          
    <TextField value={lamportstosend} onChange={(val) => {setlamportstosend(parseInt(val.target.value))}}></TextField>
    <MySendTransaction toPubkey={PDAPLAYER} lamports={lamportstosend} disabled={lamportstosend==0}/>
    <Button id="confirm" variant="contained" onClick={confirmdeposit(sessionPending)} disabled={lamportsonAccount < MIN_DEPOSIT}>confirm deposit</Button>
            </div>

            </article>}
    
    
}