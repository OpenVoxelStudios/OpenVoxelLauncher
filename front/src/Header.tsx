import './Header.css';

import Logo from '/img/logo.png';
import DiscordLogo from '/img/icons/discord.svg';
import CloseLogo from '/img/icons/close.svg';
import BoxLogo from '/img/icons/gamesheader.svg';
import { DISCORD_URL, featured_games } from '../data.ts';


import Player from '/player.png';


function Header({ openURL, minimalist = false }: { openURL: (url: string) => void, minimalist?: boolean }) {
    return (
        <header className="header">
            <img src={Logo} />


            {minimalist &&
                <div className='flexer'>
                    <h2>OpenVoxel Launcher</h2>
                </div>
            }

            {!minimalist &&
                <>
                    <div className='games'>
                        <div>
                            <img src={BoxLogo} />
                            <b>Featured</b>
                        </div>

                        {featured_games.map((g, key) => {
                            return <img className='coolclick' src={`/img/games/${g.id}.png`} key={key} />
                        })}
                    </div>

                    <div className='logged coolclick'>
                        <img className='skin' src={Player} />
                        <div>
                            <a style={{ fontSize: '12px' }}><i>Logged in as</i></a>
                            <a style={{ fontSize: '16px', inlineSize: '150px' }}><b>Kodeur_Kubik</b></a>
                        </div>
                    </div>
                </>
            }

            <a className='coolclick' onClick={(e) => { e.preventDefault(); openURL(DISCORD_URL) }}>
                <img src={DiscordLogo} />
            </a>

            <a id='closeApp' className='coolclick'>
                <img src={CloseLogo} />
            </a>
        </header>
    )
}

export default Header;