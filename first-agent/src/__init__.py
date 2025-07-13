"""
QA Context Generator

A CrewAI-powered application that automatically generates comprehensive QA testing 
context from GitHub Pull Requests. Integrated with W&B Weave for observability.
"""

__version__ = "1.0.0"
__author__ = "QA Context Generator Team"
__description__ = "CrewAI-powered QA testing context generator"

from .main import QAContextGenerator
from .config import config
from .models import QAReport, PRData, DocumentationData, DeploymentInfo
from .report_formatter import ReportFormatter

__all__ = [
    "QAContextGenerator",
    "config", 
    "QAReport",
    "PRData",
    "DocumentationData", 
    "DeploymentInfo",
    "ReportFormatter",
] 