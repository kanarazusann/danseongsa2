import './Banner2.css';

function Banner2() {
  return (
    <div className="banner-page">
      <div className="banner-page-container">
        <div className="banner-page-header">
          <h1>두 번째 배너</h1>
          <p>두 번째 배너 광고 페이지입니다</p>
        </div>
        <div className="banner-page-content">
          <div className="banner-page-image">
            <img src="/bannerImage/패딩배너.png" alt="패딩 배너" />
          </div>
          <div className="banner-page-text">
            <h2>특별한 혜택</h2>
            <p>두 번째 배너의 특별한 혜택을 만나보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner2;

