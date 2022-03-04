import { Button } from '@mui/material';
import React, { FC, useContext, useMemo, useState, useCallback} from 'react';
import { PublicKey,SystemProgram} from '@solana/web3.js';
import {AppCtx} from '../MyContext'
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import {PDATHEWHEEL_DATA_LAYOUT, PUBLICKEY_PROGRAM} from '../MyContext'
import { useNotify } from '../notify';
import '../style/WinnersBlock.css';

export const WinnersBlock: FC = () => {

    const { PDAProgram, connection, program,update,setupdate } = useContext(AppCtx);

    const { publicKey } = useWallet();
    const notify = useNotify();
    const [winnersbool,setwinnersbool] = useState(false);
    const [mywinners,setmywinners] = useState(new Map<number,PublicKey>());

    // Lecture du PDA TheWheel
    useMemo(  () => {
        PDAProgram!.then(
         async (PDATheWheelAccount) => {
            if (PDATheWheelAccount[1]!=null){
                const PDATheWheelData = PDATHEWHEEL_DATA_LAYOUT.decode(PDATheWheelAccount[1].data);
                let mywinnersmap :  Map<number,PublicKey>= PDATheWheelData.winners;
                setmywinners(mywinnersmap);
                setwinnersbool( 0 < mywinnersmap.size );
            }else{
                setwinnersbool(false);
            }
    });},[publicKey,PDAProgram,update!]);

    // get paid
    const testclick = useCallback( (session: number) => () => {

        Promise.all([PDAProgram]).then( async (values) => {

            console.log("coucou sessionWinner=",session);

            if (session!= 0){

                var uint8 = new Uint8Array(1);
                uint8[0] = session;

                let [game_account_inner, ] = await anchor.web3.PublicKey
                .findProgramAddress([Buffer.from("thewheel"),PUBLICKEY_PROGRAM.toBuffer(),Buffer.from(uint8)],PUBLICKEY_PROGRAM );

                let signature = '';

                try{

                    const tx = await program!.rpc.getpaid(session,{    
                        accounts: {
                        player: publicKey! ,   
                        thewheelaccount: values[0]![0],
                        gameaccount : game_account_inner,
                        systemProgram: SystemProgram.programId,
                    },});

                    await connection!.confirmTransaction(tx, 'processed');
                    notify('success', 'Transaction successful!', tx);

                }catch (error: any) {
                    notify('error', `Transaction failed! ${error?.message}`, signature);
                }

                setupdate!( update!+1)
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;

            }

        });
    }, [PDAProgram,publicKey,update]);


    const mywinnerscomponent = useMemo( () => {
            var rows = [];
            for(const [key, value] of mywinners.entries()) {
                if (key != 0){
                if (publicKey != null)  {
                    if (value.equals(publicKey!)){
                        rows.push(<tr key={key}>
                            <td>{value.toString()}</td>
                            <td>{key.toString()}</td>
                            <td><Button onClick={testclick(key)} variant="contained" >Get prize</Button></td>
                            </tr>);
                    }else{
                        rows.push(<tr key={key}>
                            <td>{value.toString()}</td>
                            <td>{key.toString()}</td>
                            <td></td>
                            </tr>);
                    }
                }else{
                    rows.push(<tr key={key}>
                        <td>{value.toString()}</td>
                        <td>{key.toString()}</td>
                        <td></td>
                        </tr>);
                }
                }
                
            }
            return rows;
    }, [mywinners,publicKey]);
 



    if (!winnersbool){
        return <div></div>;
    }else{

    return <div id="winners">

            <table>
                <thead>
                    <tr>
                        <th >Winner</th>
                        <th >Session</th>
                        <th >Action</th>
                    </tr>
                </thead>
                <tbody>
                 

                    { mywinnerscomponent}
            
                </tbody>
            </table>
          
         

            </div>}
    
    
}