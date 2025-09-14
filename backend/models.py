from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

#USER
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    provider = db.Column(db.Text)
    company = db.Column(db.Text)
    job_title = db.Column(db.Text)
    profile_photo = db.Column(db.Text)
    account_status = db.Column(db.Text, default="active")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    settings = db.relationship("UserSettings", backref="user", uselist=False, cascade="all, delete-orphan")
    integrations = db.relationship("Integration", backref="user", cascade="all, delete-orphan")
    projects = db.relationship("Project", backref="owner", cascade="all, delete-orphan")
    project_memberships = db.relationship("ProjectMember", backref="user", cascade="all, delete-orphan")
    meetings = db.relationship("Meeting", backref="creator", cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="assignee", foreign_keys="Task.assignee_user_id", cascade="all, delete-orphan")
    decisions = db.relationship("Decision", backref="decider", foreign_keys="Decision.decided_by", cascade="all, delete-orphan")
    conversations = db.relationship("Conversation", backref="creator", foreign_keys="Conversation.created_by", cascade="all, delete-orphan")


class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    theme_mode = db.Column(db.Text)
    accent_color = db.Column(db.Text)
    font_size = db.Column(db.Text)
    language = db.Column(db.Text)
    time_zone = db.Column(db.Text)
    reminder_minutes = db.Column(db.Integer)
    summaries_on = db.Column(db.Boolean, default=True)
    actions_on = db.Column(db.Boolean, default=True)
    updates_on = db.Column(db.Boolean, default=True)
    email_on = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Integration(db.Model):
    __tablename__ = "integrations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type = db.Column(db.Text, nullable=False)
    external_account = db.Column(db.Text)
    status = db.Column(db.Text)
    last_sync = db.Column(db.DateTime)
    meta_data = db.Column(db.JSON)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


#Project and Members
class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = db.relationship("ProjectMember", backref="project", cascade="all, delete-orphan")
    meetings = db.relationship("Meeting", backref="project", cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="project", cascade="all, delete-orphan")
    decisions = db.relationship("Decision", backref="project", cascade="all, delete-orphan")
    conversations = db.relationship("Conversation", backref="project", cascade="all, delete-orphan")


class ProjectMember(db.Model):
    __tablename__ = "project_members"

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    role = db.Column(db.Text)


#Meetings
class Meeting(db.Model):
    __tablename__ = "meetings"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    title = db.Column(db.Text, nullable=False)
    platform = db.Column(db.Text)
    meeting_link = db.Column(db.Text)
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    raw_metadata = db.Column(db.JSON)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    attendees = db.relationship("MeetingAttendee", backref="meeting", cascade="all, delete-orphan")
    segments = db.relationship("MeetingSegment", backref="meeting", cascade="all, delete-orphan")
    transcripts = db.relationship("MeetingTranscript", backref="meeting", cascade="all, delete-orphan")
    artifacts = db.relationship("MeetingArtifact", backref="meeting", cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="meeting", cascade="all, delete-orphan")
    decisions = db.relationship("Decision", backref="meeting", cascade="all, delete-orphan")
    conversations = db.relationship("Conversation", backref="meeting", cascade="all, delete-orphan")


class MeetingAttendee(db.Model):
    __tablename__ = "meeting_attendees"

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    display_name = db.Column(db.Text)
    email = db.Column(db.Text)
    join_time = db.Column(db.DateTime)
    leave_time = db.Column(db.DateTime)


class MeetingSegment(db.Model):
    __tablename__ = "meeting_segments"

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"), nullable=False)
    t_start_ms = db.Column(db.Integer)
    t_end_ms = db.Column(db.Integer)
    speaker_label = db.Column(db.Text)
    speaker_user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    text = db.Column(db.Text)
    confidence = db.Column(db.Float)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MeetingTranscript(db.Model):
    __tablename__ = "meeting_transcripts"

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"), nullable=False)
    full_text = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MeetingArtifact(db.Model):
    __tablename__ = "meeting_artifacts"

    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"), nullable=False)
    type = db.Column(db.Text)
    title = db.Column(db.Text)
    content = db.Column(db.Text)
    relevance_score = db.Column(db.Float)
    model_information = db.Column(db.JSON)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


#Tasks
class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"))
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Text)
    priority = db.Column(db.Text)
    assignee_user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    assignee_email = db.Column(db.Text)
    due_at = db.Column(db.DateTime)
    source_artifact = db.Column(db.Integer, db.ForeignKey("meeting_artifacts.id"))
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


#Decisions
class Decision(db.Model):
    __tablename__ = "decisions"

    id = db.Column(db.Integer, primary_key=True)
    statement = db.Column(db.Text, nullable=False)
    decided_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    effective_date = db.Column(db.DateTime)
    source_artifact = db.Column(db.Integer, db.ForeignKey("meeting_artifacts.id"))
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


#Messages
class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"))
    meeting_id = db.Column(db.Integer, db.ForeignKey("meetings.id"))
    title = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    messages = db.relationship("ConversationMessage", backref="conversation", cascade="all, delete-orphan")


class ConversationMessage(db.Model):
    __tablename__ = "conversation_messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    sender = db.Column(db.Text)
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)