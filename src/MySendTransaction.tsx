import { Button } from '@mui/material';
import { useConnection, useWallet} from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, TransactionSignature } from '@solana/web3.js';
import { FC, useCallback, useReducer} from 'react';
import { useNotify } from './notify';
import React from 'react'
import {AppCtx} from './MyContext'

interface MySendTransactionProps {
    toPubkey: Promise<PublicKey | null>;
    lamports: number;
    disabled:boolean;
}


export const MySendTransaction: FC<MySendTransactionProps> = (props) => {

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const notify = useNotify();

    function delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    const onClick = useCallback(() => {
        if (!publicKey) {
            notify('error', 'Wallet not connected!');
            return;
        }

        props.toPubkey.then(
            async (topubkey) => {
                if (topubkey != null){
                    let signature: TransactionSignature = '';
                    try {
                        const transaction = new Transaction().add(
                            SystemProgram.transfer({
                                fromPubkey: publicKey,
                                toPubkey: topubkey,
                                lamports: props.lamports,
                            })
                        );
            
                        signature = await sendTransaction(transaction, connection);
                        notify('info', 'Transaction sent:', signature);
            
                        await connection.confirmTransaction(signature, 'processed');
                        notify('success', 'Transaction successful!', signature);
                    } catch (error: any) {
                        notify('error', `Transaction failed! ${error?.message}`, signature);
                        return;
                    }

                    await delay(1000);
                    window.location.reload();


                }
            }

        );

    }, [publicKey, notify, connection, sendTransaction,props]);

    return (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey || props.disabled}>
            Send Transaction
        </Button>
    );
};
