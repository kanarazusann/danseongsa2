import './Banner3.css';

function Banner3() {
  return (
    <div className="banner-page">
      <div className="banner-page-container">
        <div className="banner-page-header">
          <h1>세 번째 배너</h1>
          <p>세 번째 배너 광고 페이지입니다</p>
        </div>
        <div className="banner-page-content">
          <div className="banner-page-image">
            <img src="https://via.placeholder.com/1920x600/666666/FFFFFF?text=BANNER3" alt="배너 3" />
          </div>
          <div className="banner-page-text">
            <h2>특별한 혜택</h2>
            <p>세 번째 배너의 특별한 혜택을 만나보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner3;

