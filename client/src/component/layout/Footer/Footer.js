import React from "react";
import "./Footer.css"

const Footer = () => {
    return (
        <footer id="footer">
            <div className="leftFooter">
                <h4>Our mobile app will be coming soon</h4>
                <p>Send an email to get notification</p>
            </div>

            <div className="midFooter">
                <h1>INAYAH</h1>
                <p>Modest Fashion for Modern Women</p>
                <p>Copyrights 2023 &copy; Inayah</p>
            </div>

            <div className="rightFooter">
                <h4>Follow Us</h4>
                <a href="https://www.facebook.com/inayahbd">Facebook</a>
                <a href="inayahbd@gmail.com">Email</a>
            </div>
        </footer>
    );
};

export default Footer;