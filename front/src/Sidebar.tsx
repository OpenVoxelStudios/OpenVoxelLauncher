import './Sidebar.css';

import { Pages } from './App.tsx';
import React from 'react';


function Sidebar({ page, setPage }: { page: Pages, setPage: React.Dispatch<React.SetStateAction<Pages>> }) {
    return (
        <div className="sidebar">
            <div className='tab'>
                <div className='selector' style={{ left: page == 'play' ? '0' : '-9px' }} />
                <img className='tabicon coolclick' src={`/img/icons/play-${page == 'play' ? 'fill' : 'stroke'}.svg`} onClick={() => setPage('play')} />
            </div>

            <div className='tab'>
                <div className='selector' style={{ left: page == 'games' ? '0' : '-9px' }} />
                <img className='tabicon coolclick' src={`/img/icons/games-${page == 'games' ? 'fill' : 'stroke'}.svg`} onClick={() => setPage('games')} />
            </div>

            <div className='tab'>
                <div className='selector' style={{ left: page == 'instances' ? '0' : '-9px' }} />
                <img className='tabicon coolclick' src={`/img/icons/instances-${page == 'instances' ? 'fill' : 'stroke'}.svg`} onClick={() => setPage('instances')} />
            </div>

            <img style={{ cursor: 'pointer' }} className='tabicon coolclick' src={`/img/icons/globe.svg`} onClick={() => console.log('open website')} />

            <div className='spacer' />


            <div className='tab'>
                <div className='selector' style={{ left: page == 'infos' ? '0' : '-9px' }} />
                <img className='tabicon coolclick' src={`/img/icons/infos-${page == 'infos' ? 'fill' : 'stroke'}.svg`} onClick={() => setPage('infos')} />
            </div>

            <div className='tab'>
                <div className='selector' style={{ left: page == 'settings' ? '0' : '-9px' }} />
                <img className='tabicon coolclick' src={`/img/icons/settings-${page == 'settings' ? 'fill' : 'stroke'}.svg`} onClick={() => setPage('settings')} />
            </div>

            <a style={{ width: '50px', textAlign: 'center', color: '#C4C4C4', fontWeight: 'bold', fontSize: '10px', paddingBottom: '5px' }}>v1.2.0</a>
        </div>
    )
}

export default Sidebar;