import re
import time
from typing import Optional, Tuple, List
from datetime import datetime
import requests
from github import Github, PullRequest
from src.models import PRData, DocumentationData, DeploymentInfo, FileChange
from src.config import config

class GitHubService:
    """Service for interacting with GitHub API."""
    
    def __init__(self):
        self.github = Github(config.github_token)
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {config.github_token}',
            'Accept': 'application/vnd.github.v3+json'
        })
    
    def parse_pr_url(self, pr_url: str) -> Tuple[str, str, int]:
        """Parse PR URL to extract owner, repo, and PR number."""
        pattern = r'https://github\.com/([^/]+)/([^/]+)/pull/(\d+)'
        match = re.match(pattern, pr_url)
        
        if not match:
            raise ValueError(f"Invalid GitHub PR URL: {pr_url}")
        
        owner, repo, pr_number = match.groups()
        return owner, repo, int(pr_number)
    
    def get_pr_data(self, pr_url: str) -> PRData:
        """Fetch comprehensive PR data from GitHub."""
        owner, repo_name, pr_number = self.parse_pr_url(pr_url)
        
        repo = self.github.get_repo(f"{owner}/{repo_name}")
        pr = repo.get_pull(pr_number)
        
        # Get files changed with detailed information
        files_changed = []
        file_changes = []
        
        pr_files = pr.get_files()
        for file in pr_files:
            files_changed.append(file.filename)
            
            # Create detailed file change info
            file_change = FileChange(
                filename=file.filename,
                additions=file.additions,
                deletions=file.deletions,
                changes=file.changes,
                patch=file.patch,  # This contains the actual diff!
                status=file.status
            )
            file_changes.append(file_change)
        
        # Get PR comments for additional context
        pr_comments = []
        try:
            comments = list(pr.get_issue_comments())
            for comment in comments:
                pr_comments.append(comment.body)
        except Exception as e:
            print(f"Could not fetch PR comments: {e}")
        
        # Get labels
        labels = [label.name for label in pr.labels]
        
        # Create diff summary
        diff_summary = self._create_diff_summary(file_changes, pr.title, pr.body)
        
        return PRData(
            title=pr.title,
            description=pr.body,
            labels=labels,
            files_changed=files_changed,
            file_changes=file_changes,
            additions=pr.additions,
            deletions=pr.deletions,
            commits_count=pr.commits,
            created_at=pr.created_at,
            updated_at=pr.updated_at,
            pr_url=pr_url,
            repo_name=repo_name,
            repo_owner=owner,
            diff_summary=diff_summary,
            pr_comments=pr_comments
        )
    
    def _create_diff_summary(self, file_changes: List[FileChange], title: str, description: str) -> str:
        """Create a summary of what changed in the PR."""
        summary_parts = []
        
        summary_parts.append(f"PR Title: {title}")
        if description:
            summary_parts.append(f"Description: {description}")
        
        summary_parts.append(f"Files changed: {len(file_changes)}")
        
        for file_change in file_changes:
            summary_parts.append(f"\n📁 {file_change.filename} ({file_change.status})")
            summary_parts.append(f"   +{file_change.additions} -{file_change.deletions} lines")
            
            if file_change.patch:
                # Extract key changes from the patch
                lines = file_change.patch.split('\n')
                added_lines = [line[1:] for line in lines if line.startswith('+') and not line.startswith('+++')]
                removed_lines = [line[1:] for line in lines if line.startswith('-') and not line.startswith('---')]
                
                if added_lines:
                    summary_parts.append(f"   Added: {', '.join(added_lines[:3])}")
                if removed_lines:
                    summary_parts.append(f"   Removed: {', '.join(removed_lines[:3])}")
        
        return '\n'.join(summary_parts)
    
    def get_documentation_data(self, owner: str, repo_name: str) -> DocumentationData:
        """Fetch repository documentation."""
        repo = self.github.get_repo(f"{owner}/{repo_name}")
        
        doc_data = DocumentationData()
        
        # Get README
        try:
            readme = repo.get_readme()
            doc_data.readme_content = readme.decoded_content.decode('utf-8')
            doc_data.setup_instructions = self._extract_setup_instructions(doc_data.readme_content)
            doc_data.key_features = self._extract_key_features(doc_data.readme_content)
        except Exception as e:
            print(f"Could not fetch README: {e}")
        
        # Look for additional documentation
        try:
            contents = repo.get_contents("docs")
            if contents:
                doc_data.api_documentation = "Documentation folder exists in repo"
        except Exception:
            pass
        
        # Check for testing guidelines
        try:
            testing_files = ['TESTING.md', 'TEST.md', 'test/README.md']
            for test_file in testing_files:
                try:
                    test_content = repo.get_contents(test_file)
                    doc_data.testing_guidelines = test_content.decoded_content.decode('utf-8')
                    break
                except Exception:
                    continue
        except Exception:
            pass
        
        return doc_data
    
    def monitor_deployment_comments(self, pr_url: str) -> DeploymentInfo:
        """Monitor PR comments for deployment links."""
        owner, repo_name, pr_number = self.parse_pr_url(pr_url)
        repo = self.github.get_repo(f"{owner}/{repo_name}")
        pr = repo.get_pull(pr_number)
        
        deployment_info = DeploymentInfo()
        
        # Check comments for deployment links
        comments = list(pr.get_issue_comments())
        
        # Wait for deployment if not enough comments yet
        if len(comments) < config.min_comments_for_deployment:
            print(f"Waiting for deployment comments... ({len(comments)}/{config.min_comments_for_deployment})")
            time.sleep(60)  # Wait 1 minute before checking again
            comments = list(pr.get_issue_comments())
        
        # Look for deployment URLs in comments
        deployment_patterns = [
            r'https://[^/]+\.fly\.dev[^\s]*',
            r'https://[^/]+\.vercel\.app[^\s]*',
            r'https://[^/]+\.netlify\.app[^\s]*',
            r'https://[^/]+\.herokuapp\.com[^\s]*',
        ]
        
        for comment in comments:
            for pattern in deployment_patterns:
                matches = re.findall(pattern, comment.body)
                if matches:
                    deployment_info.url = matches[0]
                    deployment_info.status = "deployed"
                    deployment_info.deployment_time = comment.created_at
                    
                    # Determine provider
                    if 'fly.dev' in deployment_info.url:
                        deployment_info.provider = "fly.io"
                    elif 'vercel.app' in deployment_info.url:
                        deployment_info.provider = "vercel"
                    elif 'netlify.app' in deployment_info.url:
                        deployment_info.provider = "netlify"
                    elif 'herokuapp.com' in deployment_info.url:
                        deployment_info.provider = "heroku"
                    
                    break
            
            if deployment_info.url:
                break
        
        return deployment_info
    
    def _extract_setup_instructions(self, readme_content: str) -> Optional[str]:
        """Extract setup/installation instructions from README."""
        if not readme_content:
            return None
        
        # Look for common setup section headers
        patterns = [
            r'## Installation(.*?)(?=##|\Z)',
            r'## Setup(.*?)(?=##|\Z)',
            r'## Getting Started(.*?)(?=##|\Z)',
            r'## Quick Start(.*?)(?=##|\Z)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, readme_content, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _extract_key_features(self, readme_content: str) -> List[str]:
        """Extract key features from README."""
        if not readme_content:
            return []
        
        features = []
        
        # Look for features section
        patterns = [
            r'## Features(.*?)(?=##|\Z)',
            r'## What it does(.*?)(?=##|\Z)',
            r'## Functionality(.*?)(?=##|\Z)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, readme_content, re.DOTALL | re.IGNORECASE)
            if match:
                feature_text = match.group(1)
                # Extract bullet points
                bullet_points = re.findall(r'[-*]\s+(.+)', feature_text)
                features.extend(bullet_points)
                break
        
        return features[:10]  # Limit to top 10 features 