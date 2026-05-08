import './ErrorMessage.scss';

export function ErrorMessage() {
  return (
    <div className="error-section">
      <div className="skull">
        <div className="head">
          <div className="crack"></div>
        </div>
        <div className="mouth">
          <div className="teeth"></div>
        </div>
      </div>
      <p className="strong">Sorry, looks like something went wrong!</p>
      <p>Try going back to <a href="/news/1">Hacker News</a></p>
    </div>
  );
}
