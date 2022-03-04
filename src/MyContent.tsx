
import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import React, { FC, useContext, useState, useEffect, useMemo } from 'react';
import {AppCtx, MAX_SESSIONS} from './MyContext'
import { WheelComponent } from './component/WheelComponent';
import { WinnersBlock } from './component/WinnersBlock';
import { PlayerBlock } from './component/PlayerBlock';
import { InitGameBlock} from './component/InitGameBlock'
import { MyTest} from './component/MyTest'
import {PDATHEWHEEL_DATA_LAYOUT, PUBLICKEY_PROGRAM} from './MyContext'
import { Link } from 'react-router-dom';

export const Content: FC = () => {

    const { PDAProgram, update} = useContext(AppCtx)
    const [mywheels,setmywheels] = useState(new Map<number,number>());

    //PDA Program
    const [PDAProgram_string, setPDAProgram_string] = useState("");
    useEffect(() => {
    if (PDAProgram){
        PDAProgram.then( (reponse) => {setPDAProgram_string(reponse[0].toString()); });
    }   
    }, [PDAProgram]);

    // Lecture du PDA TheWheel
    useMemo(  () => {
    PDAProgram!.then(
        async (PDATheWheelAccountInfo) => {
        if (PDATheWheelAccountInfo[1]!=null){
            const PDATheWheelData = PDATHEWHEEL_DATA_LAYOUT.decode(PDATheWheelAccountInfo[1].data);
            let mysessionmap : Map<number,number> = PDATheWheelData.sessionmap;
            setmywheels(mysessionmap);   
        }
    });},[PDAProgram]);


    const mywheelscomponent = useMemo( () => {
        var rows = [];
        for(const [key, value] of mywheels.entries()) {
            if (value != 0){
                rows.push(<WheelComponent key={key} sessionnumber={value}/>);
            }
        }
        return rows;
    }, [mywheels]);
    

    return   <div id="thewheel">
    <div id="main">

  
        <div id="wallet">
         <WalletMultiButton /> 
        </div>

        <article id="intro">

            <h1>Please find technical documentation HERE</h1>
            <h1>Please find manual of TheWheel <Link to="/manual">HERE</Link></h1>

        </article>


        <article id="infogame">
       
            <h1>Program ID: <a>{PUBLICKEY_PROGRAM.toString()}</a></h1>
            <h1>PublicKey PDA Program : <a>{PDAProgram_string}</a></h1>
        </article>
  
        
        <PlayerBlock key={update!+MAX_SESSIONS}/>
        <InitGameBlock key={update!+MAX_SESSIONS+1}/>



    </div>

    <WinnersBlock key={update!+MAX_SESSIONS+2}/>

        <div id="sessions">
            {mywheelscomponent}
        </div>
    </div>;
};
