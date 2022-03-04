

import React, { FC } from 'react';
import '../style/manual.css';


export const Manual: FC = () => {

    return   <div id="manual">


<h1>

TheWheel is no-loss lottery game based on Solana. In a no-loss lottery money the winner gets is equal to the sum of all deposits. No part is taken due to taxes or organization.
</h1>
<br/>
<h1>
The classic path of any player of the TheWheel is quite straightforward:
</h1>
<br/>
<h1>
1 ) Player initializes a new game or requests to participate to an existing one.<br/>
2 ) Player transfers to a temporary account the quantity of lamports he wishes to commit.<br/>
3 ) When launching date comes, player can spin the wheel.<br/>
4 ) Winner gets the reward.<br/>
</h1>
<br/>
<h1>
An optional fifth step is to reopen session 24h hours after the launching date if winner didn’t take his reward.
</h1>
<br/>
<h1>
1 ) Player initializes a new game or requests to participate to an existing one.
</h1>
<br/>
<img id="img1" src={require('./image/img1.png')}/>
<br/>
<h1>

Player has various options in this example. First he can play session 115 where there are already five participants.
 Second option is to create session 146 by choosing a launching date and a maximum of players.
  When “init game” is clicked the new created session will automatically appears.
Last option is spinning the wheel of session 207 as launching date has been reached.

</h1>
<br/>
<table>

<tr>
    <td id="td1"><img id="img1b" src={require('./image/img1b.png')}/></td>
    <td>
        <h1>
Sessions are represented with the same template where pie chart shows players in different colors. Size of every parts are relative to participations. Consequently the higher a deposit is, the better is the chance for the player to win.
<br/><br/>
The algorithm to decide who the winner is quite simple. When “spin the wheel” is clicked an unpredictable float is generated between 0 and 1 to place an indicator on the circumference of the wheel. As indicator will automatically points on a player, the winner will appears.
<br/><br/>
For a full explanation of the algorithm please refer to technical documentation. 
<br/><br/>
In this example only one place is still available. After a new participation, “Participe” button will be disabled. Before that, players are free to participate and can engage as much lamports they wish in every open session as long as the maximum of authorized players is not reached.

        </h1>


    </td>
</tr>

</table>
<br/>
<h1>

2 ) Player Transfers to a temporary account lamports he wishes to commit.
<br/><br/>
A new frame appears in first block just after participation request. New game initialization is no longer available as long as player didn't confirm his deposit.
<br/>
</h1>
<br/>
<img id="img2" src={require('./image/img2.png')}/>
<br/>
<h1>
The frame gives two information that are the publickey of the Player PDA Account where lamports will be transferred before confirmation and its actual balance. A minimum of 10 000 000 lamports is required to confirm deposit.
</h1><br/><h1>
As Solana protocol requests a rent for Account initialization, player can see lamports are already on his Account before first transfer. Nevertheless, the initial rent is not enough to confirm deposit in TheWheel. Player needs to transfer more lamports.
</h1>
<br/>
<img id="img2b" src={require('./image/img2b.png')}/>
<br/>

<table>

    <tr>
        <td id="td2"><img id="img2c" src={require('./image/img2c.png')}/></td>
        <td>
<h1>
Once the confirm deposit allowed and clicked the game is updated. If player is already in game, his deposit is updated, if not his pubkey is added to the ledger of the game and player becomes a new participant. 
<br/><br/>
In the example of game 115 player 7FQS2DLh6LLyFE41A2dCFC51aN 4jVjbRMfBbQXigkw3F now sees his part (in white) bigger than before.
<br/><br/>
3 ) When launching date comes, player can spin the wheel.
<br/><br/>
When launching date comes, player can click the “spin the wheel” button.

</h1>
<br/>
<img id="img2d" src={require('./image/img2d.png')}/>

        </td>
    </tr>

</table>
<br/>
<h1>
When “spin the wheel” button is clicked winner block is updated.

<br/><br/>
4 ) Winner gets the reward.
<br/><br/>
Player 7FQS2DLh6LLyFE41A2dCFC51aN4jVjbRMfBbQXigkw3F has lost the game 115 but won the 207. He can now have his prize by clicking the “get prize” button.

</h1>
<br/>
<img id="img4" src={require('./image/img4.png')}/>
<br/>
<h1>
After having spun the wheel session is locked waiting for the winner to get his winnings.
After 24hours if winner didn’t click the button “get prize” session will automatically reopen for a new period of one week.
Winnings are just kept on same account and will be transferred to next winner.
</h1>
</div>;
};
