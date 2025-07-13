from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Priority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class FileChange(BaseModel):
    """Model for individual file changes."""
    filename: str
    additions: int
    deletions: int
    changes: int
    patch: Optional[str] = None  # The actual diff content
    status: str  # modified, added, removed, etc.

class PRData(BaseModel):
    """Model for GitHub Pull Request data."""
    title: str
    description: Optional[str] = None
    labels: List[str] = []
    files_changed: List[str] = []
    file_changes: List[FileChange] = []  # Detailed file changes with diffs
    additions: int = 0
    deletions: int = 0
    commits_count: int = 0
    created_at: datetime
    updated_at: datetime
    pr_url: str
    repo_name: str
    repo_owner: str
    # Debug fields
    diff_summary: Optional[str] = None  # Summary of what changed
    pr_comments: List[str] = []  # PR comments for additional context

class DocumentationData(BaseModel):
    """Model for repository documentation."""
    readme_content: Optional[str] = None
    setup_instructions: Optional[str] = None
    api_documentation: Optional[str] = None
    key_features: List[str] = []
    testing_guidelines: Optional[str] = None
    known_issues: List[str] = []

class DeploymentInfo(BaseModel):
    """Model for deployment information."""
    url: Optional[HttpUrl] = None
    environment: str = "unknown"
    version: Optional[str] = None
    status: str = "pending"
    deployment_time: Optional[datetime] = None
    provider: Optional[str] = None  # fly.io, vercel, etc.

class TestingScenario(BaseModel):
    """Model for individual testing scenarios."""
    title: str
    description: str
    steps: List[str]
    expected_outcome: str
    priority: Priority

class QAReport(BaseModel):
    """Model for the complete QA report."""
    overview: Dict[str, Any]
    primary_focus_areas: List[str]
    testing_scenarios: List[TestingScenario]
    application_context: str
    deployment_info: DeploymentInfo
    additional_resources: Dict[str, str]
    generated_at: datetime = Field(default_factory=datetime.now)

class AgentResult(BaseModel):
    """Model for agent execution results."""
    agent_name: str
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.now) 