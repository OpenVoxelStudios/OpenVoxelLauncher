import './Login.css';


function Login() {
    return (
        <div className='login'>
            <div className='container'>
                <h1>Log In to Continue</h1>

                <a style={{ color: "#CACACA" }}>
                    You need to login to be able to connect and play Minecraft with our Launcher.
                    <br />
                    Your login is ONLY stored on YOUR computer.
                </a>

                <a className='log coolclick'>Login</a>
            </div>
        </div>
    )
}

export default Login;