import { CreatorDetailList, CreatorList } from '../data';
import './Play.css';

import PlayIcon from '/img/icons/play-fill.svg';

function Play({ openURL }: { openURL: (url: string) => void }) {
    return (
        <div className='play'>
            <div className='banner' style={{ backgroundImage: 'url(/img/games/default-bg.png)' }}>
                <div className='coolclick'>
                    <h1 style={{ fontSize: '25px', fontWeight: 'bold', margin: 0 }}>Launch Oak House Murder</h1>
                    <a>
                        <img src={PlayIcon} style={{ height: '20px', width: '20px' }} />
                        Click to Play!
                    </a>
                </div>
            </div>


            <div className='under'>
                <div className='news'>
                    <h1>NEWS!</h1>
                    {new Array(8).fill(0).map((news, index) => {
                        return <img key={index} src='/img/news-template.png' className='coolclick glass' />
                    })}
                </div>

                <div className='team'>
                    <h1>OUR TEAM</h1>
                    {Object.keys(CreatorDetailList).map((creatorID, index) => {
                        let creator = CreatorDetailList[creatorID as CreatorList];

                        return <div key={index} className='coolclick' onClick={(e) => { e.preventDefault(); openURL(`https://youtube.com/${creator.youtube}`) }}>
                            <img src={`/heads/${creator.minecraft}.png`} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <h2 style={{ fontSize: '16px', width: '100%', margin: 0 }}>{creatorID}</h2>
                                <a style={{ fontSize: '12px', width: '100%' }}>{creator.roles.join(', ')}</a>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Play;