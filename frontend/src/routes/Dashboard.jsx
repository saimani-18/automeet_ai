import React from 'react';
import Header from '../components/Header';
import UpcomingMeetings from '../components/UpcomingMeetings';
import MeetingAnalytics from '../components/MeetingAnalytics';
import MeetingSummary from '../components/MeetingSummary';
import CalendarConnections from '../components/CalendarConnections';

function Dashboard() {
  return (
    <main style={{ flex: 1, padding: 24 }}>
      <Header />
      <div style={{ display: 'flex', gap: 24 }}>
        <section style={{ flex: 2 }}>
          <div style={liveMeetingBannerStyle}>
            <div>
              Your meeting with Product Team is currently live<br />
              <span style={{ fontSize: 12 }}>Started 15 minutes ago · 5 participants</span>
            </div>
            <button style={downloadBtnStyle}>Download Extension</button>
          </div>
          <UpcomingMeetings />
          <MeetingAnalytics />
        </section>
        <aside style={{ flex: 1 }}>
          <MeetingSummary />
          <CalendarConnections />
        </aside>
      </div>
    </main>
  );
}

const liveMeetingBannerStyle = {
  background: '#233056',
  borderRadius: 7,
  padding: 12,
  color: '#bcd3fa',
  marginBottom: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const downloadBtnStyle = {
  background: '#468afa',
  color: 'white',
  padding: '8px 14px',
  borderRadius: 5,
  border: 'none',
  fontWeight: 600
};

export default Dashboard;
