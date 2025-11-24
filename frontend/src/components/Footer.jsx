import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>고객센터</h4>
            <p>1588-1234</p>
            <p>평일 10:00 - 18:00</p>
          </div>
          <div className="footer-section">
            <h4>ABOUT</h4>
            <a href="#">회사소개</a>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
          </div>
          <div className="footer-section">
            <h4>SOCIAL</h4>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Youtube</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 DANSUNGSA Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;