
import React, { FC } from 'react';

interface ICountdown {
    timeunix: number;
}

export const CountdownComponent:  FC<ICountdown> = ({timeunix}) =>{

   // const [time, setTime] = React.useState(timeunix);
    const [days, setdays] = React.useState(Math.floor(timeunix / (1000 * 60 * 60 * 24)));
    const [hours, sethours] = React.useState(Math.floor((timeunix % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const [minutes, setminutes] = React.useState(Math.floor((timeunix % (1000 * 60 * 60)) / (1000 * 60)));
    const [seconds, setseconds] = React.useState(Math.floor((timeunix % (1000 * 60)) / 1000));

    const tick = () => {

        if (seconds<0) 
            return;

        if (seconds === 0){

            if (0 < minutes) {
                setminutes(minutes-1);
                setseconds(59);
                return;
            } 

            if (0 < hours  && minutes === 0) {
                sethours(hours-1);
                setminutes(59);
                setseconds(59);
                return;
            } 
            
            if ( 0<days && hours === 0 && minutes === 0 ){ 
                setdays(days-1);
                sethours(23);
                setminutes(59);
                setseconds(59);
                return;
            }

            if (days === 0 && hours === 0 && minutes === 0 ){ 
                return;
            }

        }else{
            setseconds(seconds-1);
        }

   
    };

    
    React.useEffect(() => {
            const timerId = setInterval(() => tick(), 1000);
            return () => clearInterval(timerId);
 
    });

    
    return (
        <div>
            {(seconds < 0) &&  <b>READY</b>}
            {!(seconds < 0)&& <h1><p>{`${days.toString().padStart(2, '0')}d:
                    ${hours.toString().padStart(2, '0')}h:
                    ${minutes.toString().padStart(2, '0')}m:
                    ${seconds.toString().padStart(2, '0')}s`}</p> </h1>}
        </div>
    );
}
