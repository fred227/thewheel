import { Button ,TextField} from '@mui/material';
import React, { FC, useContext, useState,useMemo,useCallback } from 'react';
import {AppCtx} from '../MyContext'
import { PublicKey} from '@solana/web3.js';
import {SystemProgram, TransactionSignature} from '@solana/web3.js'
import Autocomplete from '@mui/material/Autocomplete';
import {PDATHEWHEEL_DATA_LAYOUT, PUBLICKEY_PROGRAM} from '../MyContext'
import * as anchor from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react'
import { useNotify } from '../notify';
import '../style/InitGame.css';



export const InitGameBlock: FC = () => {

  const { connection, PDAProgram, program, update, setupdate} = useContext(AppCtx)
  
  const { publicKey } = useWallet()
  const notify = useNotify();

  const [launchingtime_insec, setlaunchingtime_insec] = useState(60*10);
  const [nbplayers, setnbplayers] = useState(3);
  const [ispending, setispending] = useState(false);

  const [issessionavailable,setissessionavailable] = useState(false);

  const launchingdate = [
    { label: '10 minutes', value:60*10 },
    { label: '1 hour', value:60*60 },
    { label: '5 hours', value:60*60*5 },
    { label: '12 hours', value:60*60*12 },
    { label: '1 day', value:60*60*24 },
    { label: '2 days', value:60*60*24*2 },
    { label: '5 days',  value:60*60*24*5 },
    { label: '1 week',  value:60*60*24*7 },
    { label: '2 weeks', value:60*60*24*7*2 },
    { label: '1 month', value:60*60*24*7*4 },];

    const liste = [
      { label: '3', value:3 },{ label: '4', value:4 },
      { label: '5', value:5 },{ label: '6', value:6 },{ label: '7', value:7 },{ label: '8', value:8 },
      { label: '9', value:9 },{ label: '10', value:10 },{ label: '11', value:11 },{ label: '12', value:12 },
      { label: '13', value:13 },{ label: '14', value:14 },{ label: '15', value:15 },];

      const randomsession = useMemo( () =>
      {return Math.floor(Math.random() * 254) + 1;},[])
  
    useMemo(  () => {
      PDAProgram!.then(
       async (PDATheWheelAccountInfo) => {
          if (PDATheWheelAccountInfo[1]!=null && publicKey !=null){
              const PDATheWheelData = PDATHEWHEEL_DATA_LAYOUT.decode(PDATheWheelAccountInfo[1].data);

              let mysessions : Map<number,number> = PDATheWheelData.sessionmap;
              let issessionavailable= false;
              for (const [key, value] of mysessions.entries()) { if (value == 0){issessionavailable= true; }  }
              setissessionavailable(issessionavailable);

              let mypendings : Map<PublicKey,number> = PDATheWheelData.pendingmap;
              let ispending= false;
              for (const [key, value] of mypendings.entries()) { if (key.equals(publicKey)){ispending= true;}  }
              setispending(ispending) 
          }else{
              setissessionavailable(false);
          }
     });},[PDAProgram,publicKey]);

    const PDAGAME =  useMemo( async () => {
      var uint8 = new Uint8Array(1);
      uint8[0] = randomsession!;
      if (PUBLICKEY_PROGRAM != null){
          let [game_account_inner, game_bump_inner] = await anchor.web3.PublicKey
          .findProgramAddress([Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer(),Buffer.from(uint8)],PUBLICKEY_PROGRAM );
          console.log("PDAGAME in InitGame= ",randomsession, game_account_inner.toString());
          return game_account_inner;
      }else{
          console.log("PDAGAME = null");
          return null;
      }
    },[randomsession]);

     const initgame = useCallback( async ()=>{
      Promise.all([PDAProgram, PDAGAME]).then( async (values) => {
          
          console.log("initgame session=",randomsession);
          let thwheel : PublicKey = values[0]![0];
          if ( values[0] == null){ console.log("initgame - thewheelaccount==null");return; }

          else {console.log("initgame - thewheelaccount==",thwheel.toString());}
          if ( values[1] == null){ console.log("initgame - gameaccount==null");return; }
          else {console.log("initgame - gameaccount==",values[1].toString());}

        //  console.log("new Date().getTime() / 1000=",Math.trunc(new Date().getTime() / 1000));
          let launchingdate_rpc = (Math.trunc(new Date().getTime() / 1000)) + launchingtime_insec;
/*           console.log("new anchor.BN(launchingdate_rpc)-Math.trunc(new Date().getTime() / 1000))=",
          (new anchor.BN(launchingdate_rpc)-Math.trunc(new Date().getTime() / 1000))); */
          
          try{
            const tx = await program!.rpc.initgame(randomsession!, new anchor.BN(launchingdate_rpc), nbplayers,{    
            accounts: {
            creatorgame: publicKey! ,
            thewheelaccount: values[0]![0],
            gameaccount : values[1],
            systemProgram: SystemProgram.programId,
          },});

            await connection!.confirmTransaction(tx, 'processed');
            notify('success', 'Transaction successful!', tx);

          }catch (error: any) {
            notify('error', `Transaction failed! ${error?.message}`);
          }
          setupdate!( update!+1)

          });
    }, [PDAProgram, publicKey, PDAGAME,launchingtime_insec,nbplayers,randomsession,update]);


  if (!issessionavailable || ispending){
    return <div></div>;
  }else{

  return <article id="myinitgame">
  
    <h1>Init New Game session number = <a>{randomsession!}</a>: </h1>

      <div id="myinitgamebox">
      <h1>Launching date in :</h1>
      <Autocomplete
          onChange={(event, value) => {if(value){setlaunchingtime_insec(value.value)}}}
          defaultValue={  { label: '10 minutes', value:60*10 }}
          disablePortal
          id="combo-box-demo2"
          options={launchingdate}
          sx={{ width: 200 }}
          renderInput={(params) => <TextField {...params} label="Max players" />}
        />
      <h1>Maximum players :</h1>
      <Autocomplete
          onChange={(event, value) => {if(value){setnbplayers(value.value)}}}
          defaultValue={ { label: '3', value:3 }}
          disablePortal
          id="combo-box-demo"
          options={liste}
          sx={{ width: 120 }}
          renderInput={(params) => <TextField {...params} label="Max players" />}
        />
      <Button id="init" variant="contained" onClick={initgame} disabled={!publicKey}>Init Game</Button>

      </div>

      
      </article>;
  }
}