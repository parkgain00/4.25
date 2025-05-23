import '../styles/globals.css'
import { useEffect } from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  // 클라이언트 측에서 에러 처리
  useEffect(() => {
    const handleError = (error) => {
      console.error('Application Error:', error)
      // 여기에 사용자에게 에러 알림을 보여주는 코드를 추가할 수 있습니다.
    }

    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>홍연 사주 궁합 계산기</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 