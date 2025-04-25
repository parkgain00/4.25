import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
      </div>
      
      <style jsx>{`
        .footer {
          width: 100%;
          margin-top: 4rem;
          padding: 1.5rem 0;
          text-align: center;
        }
        
        .footer-content {
          max-width: 900px;
          margin: 0 auto;
          color: #666;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .footer {
            margin-top: 3rem;
            padding: 1rem 0;
          }
          
          .footer-content {
            font-size: 0.8rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer; 