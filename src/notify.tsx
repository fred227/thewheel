import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar, VariantType } from 'notistack';
import { useCallback } from 'react';
import React from 'react'


export function useNotify() {
    const { enqueueSnackbar } = useSnackbar();

    const Notification = styled('span')(() => ({
        display: 'flex',
        alignItems: 'center',
    }));
    
    const StyledLink = styled(Link)(() => ({
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        marginLeft: 16,
        textDecoration: 'underline',
        '&:hover': {
            color: '#000000',
        },
    }));
    
    const StyledLaunchIcon = styled(LaunchIcon)(() => ({
        fontSize: 20,
        marginLeft: 8,
    }));

    return useCallback(
        (variant: VariantType, message: string, signature?: string) => {
            enqueueSnackbar(
                <Notification>
                    {message}
                    {signature && (
                        <StyledLink href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank">
                            Transaction
                            <StyledLaunchIcon />
                        </StyledLink>
                    )}
                </Notification>,
                { variant }
            );
        },
        [enqueueSnackbar]
    );
}
