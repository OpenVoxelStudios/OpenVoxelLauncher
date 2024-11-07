import { useState } from 'react';

import './App.css';
import Updater from './Updater';
import Header from './Header';
import Sidebar from './Sidebar';
import Login from './Login';
import Play from './Play';


export type Pages = "updater" | "login" | "play" | "games" | "instances" | "infos" | "settings";

function App() {
  const [page, setPage] = useState<Pages>("play");
  function openURL(url: string) {
    ; (window.open(url, '_blank') as Window).focus();
  };

  return (
    <>
      {(page == 'updater' || page == 'login') &&
        <>
          <Header minimalist={true} openURL={openURL} />

          <div className='frame fullframe'>
            {page == 'updater' && <Updater />}
            {page == 'login' && <Login />}
          </div>
        </>
      }

      {(page != 'updater' && page != 'login') &&
        <>
          <Header openURL={openURL} />
          <Sidebar page={page} setPage={setPage} />

          <div className='frame glass'>
            {page == 'play' && <Play openURL={openURL} />}
          </div>
        </>
      }
    </>
  )
}

export default App;