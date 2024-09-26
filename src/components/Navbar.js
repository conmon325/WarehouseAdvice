import logo from '../images/logo.png'

const Navbar = ({ web3Handler, account, explorerURL }) => {
    return (
        <nav className="navbar fixed-top mx-3">
            <a
                className="navbar-brand col-sm-3 col-md-2 mr-0 mx-4"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img src={logo} className="App-logo" alt="logo" />
                NJ Warehouse Finder
            </a>

           
            
            <a
            
                className="button nav-button btn-sm mx-4"
                href="#about"
                target="_blank"
                rel="noopener noreferrer"
            >CONTACT US
            </a>
           
        </nav>
    )
}

export default Navbar;