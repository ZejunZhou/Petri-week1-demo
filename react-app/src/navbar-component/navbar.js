import React from 'react';
import logoImage from "../images/logo.png"
import styles from './navbar.module.css'

const Navbar = ({userImage}) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <a className="navbar-brand" href="#">
                <img src={logoImage} alt="Product Logo" width="30" height="30" />
            </a>

            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="file">File</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="edit">Edit</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="view">View</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="window">Window</a>
                    </li>
                </ul>

                <ul className={`navbar-nav ms-auto ${styles['image-margin']}`}>
                    <li className="nav-item">
                         {userImage ? <img src={userImage} alt="user-profile" className={styles['user-image']}/> : <img src="https://ulsum.com/static/img/unlogin-icon.ce0192e1.png" alt="user-image" className={styles['user-image']}/>}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
