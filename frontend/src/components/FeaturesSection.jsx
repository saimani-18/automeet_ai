import React from 'react';
import aiImage from '../assets/image.png';  // Image must be in src/assets/

function FeaturesSection() {
  return (
    <div style={{
      background: 'none',
      color: '#fff',
      maxWidth: 400,
      padding: 24
    }}>
      {/* AI robot image */}
      <div style={{
        width: 200,
        height: 250,
        margin: '0 auto 20px auto',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #141b2d 60%, #222 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img
          src={aiImage}
          alt="AI Robot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 12
          }}
        />
      </div>
      <h3 style={{ marginBottom: 18 }}>Enhance your meetings with AI</h3>
      <ul style={{
        listStyle: 'none',
        paddingLeft: 0,
        fontSize: 15,
        color: '#bcd3fa'
      }}>
        <li>• Automatic meeting transcription and summarization</li>
        <li>• Smart action item extraction and assignment</li>
        <li>• Searchable knowledge base from all your meetings</li>
        <li>• Seamless calendar integration</li>
      </ul>
      <div style={{
        marginTop: 32,
        fontSize: 13,
        color: '#bbb',
        display: 'flex',
        gap: 14
      }}>
        <a href="#" style={{ color: '#58a' }}>Help</a>
        <a href="#" style={{ color: '#58a' }}>Privacy</a>
        <a href="#" style={{ color: '#58a' }}>Terms</a>
      </div>
    </div>
  );
}

export default FeaturesSection;
