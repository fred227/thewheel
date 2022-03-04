import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSnackbar } from 'notistack';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import { Theme } from './Theme';
import {MyContext} from './MyContext'
import { Content } from './MyContent'

export const App: FC = () => {
    return (

        <Theme>
            <Context>
                <Content />
            </Context>
        </Theme>

    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    //const network = WalletAdapterNetwork.Devnet;
    const network = WalletAdapterNetwork.Devnet;
    // You can also provide a custom RPC endpoint.
     const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    //const endpoint = useMemo(() => "http://localhost:8899", []);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
           new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    interface AppContextInterface {
        pubkeyToSend: string;
        messageToLinkWith: string;
        amountToSend: number;
    }

    const AppCtx = React.createContext<AppContextInterface | null>(null);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                <WalletDialogProvider>
                    <MyContext>
                    {children}
                    </MyContext>
                </WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
