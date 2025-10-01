# backend/enhanced_test_data.py
import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, User, Project, Meeting
from services.ingest import ingest_transcript

def create_enhanced_test_data():
    app = create_app()
    
    with app.app_context():
        print("🗄️ Creating enhanced test data...")
        
        # Create test user
        user = User(
            name="Tech Lead User",
            email="techlead@example.com",
            password_hash="test_hash_123",
            provider="local",
            company="Tech Corp",
            job_title="Senior Developer"
        )
        db.session.add(user)
        db.session.commit()
        
        # Create technical project
        project = Project(
            name="Flask Application Development",
            description="Development of new customer portal using Flask and React",
            owner_id=user.id
        )
        db.session.add(project)
        db.session.commit()
        
        # Create technical discussion meeting
        technical_meeting = Meeting(
            project_id=project.id,
            title="Flask App Architecture Discussion",
            platform="zoom",
            meeting_link="https://zoom.us/flask-architecture",
            started_at=datetime.utcnow(),
            created_by=user.id
        )
        db.session.add(technical_meeting)
        db.session.commit()
        
        # Technical discussion transcript
        technical_transcript = """
        MEETING: Flask Application Architecture Review
        DATE: September 28, 2024
        ATTENDEES: Sarah (Tech Lead), Mike (Backend), Emily (Frontend), John (DevOps)
        
        Sarah: Let's review our Flask application architecture. We need to decide between monolithic vs microservices.
        Mike: For our scale, I recommend starting with a modular monolith. We can use Blueprints for separation.
        Emily: We should consider React for frontend with a clean API separation. What database should we use?
        Mike: PostgreSQL for production, SQLite for development. We need proper connection pooling.
        John: For deployment, I suggest Docker containers with Nginx reverse proxy. We need CI/CD from day one.
        
        TECHNICAL DECISIONS:
        1. Use Flask Blueprints for modular architecture
        2. PostgreSQL with SQLAlchemy ORM
        3. React frontend with REST API
        4. Docker containerization
        5. GitHub Actions for CI/CD
        
        Sarah: Let's also establish coding standards and review process.
        Mike: We should use Flask-Migrate for database migrations and Pytest for testing.
        Emily: For frontend, we'll use React with TypeScript and Vite for building.
        
        ACTION ITEMS:
        1. Mike: Set up Flask project structure with Blueprints by Oct 5
        2. Emily: Create React prototype with API integration by Oct 7
        3. John: Prepare Docker setup and CI/CD pipeline by Oct 10
        4. Sarah: Document architecture decisions and coding standards
        """
        
        print("📝 Ingesting technical transcript...")
        ingest_transcript(
            meeting_id=technical_meeting.id,
            raw_text=technical_transcript,
            source_platform="zoom",
            transcript_format="plain_text"
        )
        
        # Create decision-making meeting
        decision_meeting = Meeting(
            project_id=project.id,
            title="Vendor Selection and Technology Choices",
            platform="teams",
            meeting_link="https://teams.microsoft.com/vendor-selection",
            started_at=datetime.utcnow(),
            created_by=user.id
        )
        db.session.add(decision_meeting)
        db.session.commit()
        
        # Decision-making transcript
        decision_transcript = """
        MEETING: Vendor Selection & Technology Stack Finalization
        DATE: September 29, 2024
        ATTENDEES: Sarah, Mike, Emily, John, David (CTO)
        
        David: We need to finalize our cloud provider and key technology choices.
        Sarah: We're comparing AWS vs Google Cloud. AWS has better enterprise support.
        Mike: Google Cloud has better ML services and pricing for our scale.
        Emily: For monitoring, we're considering Datadog vs New Relic vs self-hosted Prometheus.
        John: Datadog is easier to setup but expensive. Prometheus gives us more control.
        
        DECISION FACTORS CONSIDERED:
        - Cost efficiency at scale
        - Developer experience and documentation
        - Enterprise support and SLAs
        - Integration with existing tools
        - Long-term maintainability
        
        FINAL DECISIONS:
        1. Cloud Provider: Google Cloud Platform (better pricing for our expected growth)
        2. Monitoring: Prometheus + Grafana (cost-effective, more control)
        3. CI/CD: GitHub Actions (already using GitHub, good integration)
        4. Container Registry: Google Container Registry (native GCP integration)
        
        RISKS IDENTIFIED:
        - GCP learning curve for team (mitigation: training sessions)
        - Prometheus maintenance overhead (mitigation: dedicated DevOps resource)
        - Vendor lock-in with GCP (mitigation: multi-cloud design where possible)
        
        Sarah: We'll review these decisions in 3 months to ensure they're still optimal.
        """
        
        print("📝 Ingesting decision-making transcript...")
        ingest_transcript(
            meeting_id=decision_meeting.id,
            raw_text=decision_transcript,
            source_platform="teams",
            transcript_format="plain_text"
        )
        
        return {
            "user_id": user.id,
            "project_id": project.id,
            "technical_meeting_id": technical_meeting.id,
            "decision_meeting_id": decision_meeting.id
        }

if __name__ == "__main__":
    ids = create_enhanced_test_data()
    print(f"\n🎉 Enhanced test data created successfully!")
    print(f"📋 IDs: {ids}")