import { Button } from '@mui/material';
import React, { FC, useContext, useState,useMemo,useCallback,useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { PublicKey, SystemProgram} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import {AppCtx} from '../MyContext'
import { useNotify } from '../notify';
import { useWallet } from '@solana/wallet-adapter-react'
import {PDAGAME_DATA_LAYOUT, PUBLICKEY_PROGRAM,LIMIT_TIME_FOR_DEPOSIT_INMS} from '../MyContext'
import '../style/WheelComponent.css';

import { CountdownComponent } from './CountdownComponent';


interface MyLittleWheelComponentProps {
    sessionnumber: number;
}


export const WheelComponent: FC<MyLittleWheelComponentProps> = (props) => {

    const { connection, PDAProgram, program, update, setupdate} = useContext(AppCtx)
    const sessionString : String= props.sessionnumber.toString();
    const { publicKey } = useWallet();
    const notify = useNotify();

    const [totalplayers, settotalplayers] = useState(0);
    const [maxplayers, setmaxplayers] = useState(0);
    const [totallamports, settotallamports] = useState(0);
    const [countdown_inms, setcountdown_inms] = useState(0);
    const [islock, setislock] = useState(0);

    const initvalue = [{title: "", value: 0, color: ""}];
    const [datapiestate, setdatapiestate] = useState(initvalue);

    var uint8 = new Uint8Array(1);
    uint8[0] = props.sessionnumber;

    const colors = ["#c84630ff","#d4a0a7ff","#e3e3e3ff","#898989ff",
                    "#5da271ff","#6caa7eff","#79b28aff","#85b995ff",
                    "#90bf9fff","#9ac5a8ff","#c84630ff","#d4a0a7ff",
                    "#5da271ff","#6caa7eff","#79b28aff","#85b995ff",];

    const PDAGAME:  Promise<PublicKey>  =   useMemo( async () => {
        console.log("PDAGAME in MyLittleWheelComponent=",props.sessionnumber)
        let [game_account_inner, ] = await anchor.web3.PublicKey
        .findProgramAddress([Buffer.from("thewheel"),PUBLICKEY_PROGRAM!.toBuffer(),Buffer.from(uint8)],PUBLICKEY_PROGRAM! );
        console.log("PDAGAME in MyLittleWheelComponent=",props.sessionnumber, game_account_inner.toString())
        return game_account_inner;
    },[props,update]);

    const PDAPlayer:  Promise<PublicKey | null>  =   useMemo( async () => {
        if (publicKey != null){
            let [PlayerAccount, PlayerAccountBump] =  await anchor.web3.PublicKey
            .findProgramAddress( [Buffer.from("thewheel"),PUBLICKEY_PROGRAM!.toBuffer(),Buffer.from(uint8), publicKey!.toBuffer()], PUBLICKEY_PROGRAM! );
            return PlayerAccount;
        }else{
            return null;
        }

    },[publicKey,props]);

   // préparation des données
    useEffect(  () => {
        PDAGAME.then(
         async (PDAGameAccount) => {
            const PDAGameAccountInfo = await connection!.getAccountInfo(PDAGameAccount);
            const PDAGameBalance = await connection!.getBalance(PDAGameAccount);
            settotallamports(PDAGameBalance);
            console.log("PDAGameBalance=",props.sessionnumber,PDAGameBalance)
            if (PDAGameAccountInfo!=null){
            const PDASessionData = PDAGAME_DATA_LAYOUT.decode(PDAGameAccountInfo.data);

            setmaxplayers(PDASessionData.max_players);
            let launchingdate_bn : anchor.BN = PDASessionData.launchingdate;

            setcountdown_inms((launchingdate_bn.toNumber() * 1000) - new Date().getTime())
            let mymap : Map<PublicKey,anchor.BN> = PDASessionData.ledger;
            setislock(PDASessionData.is_lock);
            let datapie: { title: string; value: number;color: string; }[] = new Array(mymap.size);
            let i = 0;
            for (const [key, value] of mymap.entries()) {
                if ( 0 < value.toNumber()){
                    datapie[i++]={ title: key.toString(), value: value.toNumber(), color: colors[i] };
                }
            }
            setdatapiestate(datapie);
            settotalplayers(i);
    }}
    );
    },[PDAGAME]);

    const Reopengame = useCallback( () => {


        Promise.all([PDAProgram, PDAGAME]).then( async (values) => {

            console.log("Reopengame props.sessionnumber",props.sessionnumber)
            console.log("Reopengame thewheelaccount",values![0]![0].toString())
            console.log("Reopengame gameaccount", values![1]!.toString())
    

            let signature = '';
            try{
                const tx = await program!.rpc.reopengame(props.sessionnumber,{    
                    accounts: {
                    thewheelaccount: values[0]![0],
                    gameaccount : values[1],
                },});

               await connection!.confirmTransaction(tx, 'processed');
               notify('success', 'Transaction successful!', tx);
                //window.location.reload();
           }catch (error: any) {
              notify('error', `Transaction failed! ${error?.message}`, signature);
           }
         setupdate!( update!+1)
          document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
          });
    }, [PDAProgram, PDAGAME, publicKey]);


    // participation to game
    // 1) call initplayer
    const ParticipateClick = useCallback( () => {

        Promise.all([PDAProgram, PDAGAME, PDAPlayer]).then( async (values) => {

            let signature = '';
            try{
                const tx = await program!.rpc.initplayer(props.sessionnumber,{    
                    accounts: {
                    player: publicKey!,
                    thewheelaccount: values![0]![0],
                    gameaccount : values![1]!,
                    playeraccount : values![2]!,
                    systemProgram: SystemProgram.programId,
                },});

               await connection!.confirmTransaction(tx, 'processed');
               notify('success', 'Transaction successful!', tx);

                //window.location.reload();
           }catch (error: any) {
              notify('error', `Transaction failed! ${error?.message}`, signature);
           }
          setupdate!( update!+1)
          document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
          });
    }, [PDAProgram, PDAGAME, PDAPlayer,publicKey, props]);



    // Spin the wheel
    const SpinTheWheelClick = useCallback( () => {

        Promise.all([PDAProgram, PDAGAME]).then( async (values) => {

            let signature = '';
            try{
                const tx = await program!.rpc.play(props.sessionnumber,{    
                    accounts: {
                    thewheelaccount: values[0]![0],
                    gameaccount : values[1],
                },});

               await connection!.confirmTransaction(tx, 'processed');
               notify('success', 'Transaction successful!', tx);

                //window.location.reload();
           }catch (error: any) {
              notify('error', `Transaction failed! ${error?.message}`, signature);
           }
          setupdate!( update!+1)
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          });
    }, [PDAProgram, PDAGAME, publicKey]);

    return <div id="littlewheelbox">
    
        <div id="piechart">
            <PieChart data={datapiestate}/>
        </div>
        <h1>Game number :<a>{sessionString}</a></h1>
       
        <h1>Number of players :<a>{totalplayers}</a>/<a>{maxplayers}</a></h1>
        <h1>Lamports in game:</h1>
        <h2><a>{totallamports}</a></h2>
        { islock ==0 && <h1>Date the wheel turns in:</h1>}
        <h1>     
            { (islock ==0 && countdown_inms != 0) &&  <CountdownComponent timeunix={countdown_inms}/>}
           
        </h1>
        { islock ==1 && <h1> <b>Waiting for the winner to get the prize</b></h1>}
  
       
        <div id="center">
            
           { islock != 1  && <Button onClick={ParticipateClick} variant="contained" disabled={totalplayers==maxplayers || countdown_inms < 0 || islock == 1  || !publicKey}>Participe</Button>} 
           { islock != 1  && <Button onClick={SpinTheWheelClick} variant="contained" disabled={ islock == 1  || countdown_inms > 0 || !publicKey}>Spin the wheel</Button>}
           { islock == 1 &&  <Button onClick={Reopengame} variant="contained" 
           disabled={  0< countdown_inms + LIMIT_TIME_FOR_DEPOSIT_INMS || !publicKey}>reopen game</Button>}
        </div>
        
    </div>;
}