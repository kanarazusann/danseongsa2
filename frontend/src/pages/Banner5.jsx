import './Banner5.css';

function Banner5() {
  return (
    <div className="banner-page">
      <div className="banner-page-container">
        <div className="banner-page-header">
          <h1>다섯 번째 배너</h1>
          <p>다섯 번째 배너 광고 페이지입니다</p>
        </div>
        <div className="banner-page-content">
          <div className="banner-page-image">
            <img src="https://via.placeholder.com/1920x600/CCCCCC/000000?text=BANNER5" alt="배너 5" />
          </div>
          <div className="banner-page-text">
            <h2>특별한 혜택</h2>
            <p>다섯 번째 배너의 특별한 혜택을 만나보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner5;

