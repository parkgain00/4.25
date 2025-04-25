function Error({ statusCode }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px 20px',
      fontFamily: 'Noto Serif KR, serif'
    }}>
      <h1 style={{ color: '#c3142d' }}>
        {statusCode 
          ? `${statusCode} 오류가 발생했습니다` 
          : '오류가 발생했습니다'}
      </h1>
      <p>페이지를 새로고침 하거나 잠시 후 다시 시도해주세요.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          backgroundColor: '#c3142d',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        페이지 새로고침
      </button>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error 