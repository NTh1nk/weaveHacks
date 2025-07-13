import time
from datetime import datetime
from typing import Dict, Any, List
import weave
from crewai import Agent, Task, Crew, Process
from crewai.llm import LLM

from src.config import config
from src.models import PRData, DocumentationData, DeploymentInfo, QAReport, TestingScenario, Priority, AgentResult
from src.github_service import GitHubService

class QAContextAgents:
    """CrewAI agents for generating QA context."""
    
    def __init__(self):
        self.github_service = GitHubService()
        
        # Initialize the LLM with W&B Inference
        self.llm = LLM(
            model=config.model_name,
            base_url=config.openai_base_url,
            api_key=config.openai_api_key,
        )
        
        # Initialize agents
        self.github_collector = self._create_github_collector_agent()
        self.documentation_analyzer = self._create_documentation_analyzer_agent()
        self.deployment_monitor = self._create_deployment_monitor_agent()
        self.qa_context_generator = self._create_qa_context_generator_agent()
        self.output_formatter = self._create_output_formatter_agent()
    
    def _create_github_collector_agent(self) -> Agent:
        """Create the GitHub data collector agent."""
        return Agent(
            role="GitHub Data Collector",
            goal="Extract relevant PR information and repository context for QA testing",
            backstory="You are an expert at analyzing GitHub pull requests and extracting the most relevant information for QA testing. You focus on changes that impact user experience and functionality.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_documentation_analyzer_agent(self) -> Agent:
        """Create the documentation analyzer agent."""
        return Agent(
            role="Documentation Analyzer",
            goal="Analyze repository documentation to provide context for QA testing",
            backstory="You are skilled at reading and summarizing technical documentation, extracting key information that helps QA testers understand the application's purpose and functionality.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_deployment_monitor_agent(self) -> Agent:
        """Create the deployment monitoring agent."""
        return Agent(
            role="Deployment Monitor",
            goal="Monitor and validate deployment information for QA testing",
            backstory="You specialize in tracking deployment status and ensuring QA testers have access to the correct deployment environment for testing.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_qa_context_generator_agent(self) -> Agent:
        """Create the QA context generator agent."""
        return Agent(
            role="QA Context Generator",
            goal="Generate comprehensive testing context and scenarios based on PR changes",
            backstory="You are an experienced QA engineer who can analyze code changes and generate relevant test scenarios, prioritize testing areas, and create actionable testing instructions.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_output_formatter_agent(self) -> Agent:
        """Create the output formatter agent."""
        return Agent(
            role="Output Formatter",
            goal="Format QA information into a comprehensive, readable report",
            backstory="You excel at organizing technical information into clear, actionable reports that help QA testers understand what they need to test and how to test it effectively.",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
        )
    
    @weave.op()
    def collect_github_data(self, pr_url: str) -> AgentResult:
        """Collect GitHub PR and repository data."""
        start_time = time.time()
        
        try:
            # Get PR data
            pr_data = self.github_service.get_pr_data(pr_url)
            
            # Get documentation data
            doc_data = self.github_service.get_documentation_data(
                pr_data.repo_owner, 
                pr_data.repo_name
            )
            
            result = AgentResult(
                agent_name="GitHub Collector",
                success=True,
                data={"pr_data": pr_data, "doc_data": doc_data},
                execution_time=time.time() - start_time
            )
            
            return result
            
        except Exception as e:
            return AgentResult(
                agent_name="GitHub Collector",
                success=False,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    @weave.op()
    def monitor_deployment(self, pr_url: str) -> AgentResult:
        """Monitor deployment status and extract deployment information."""
        start_time = time.time()
        
        try:
            deployment_info = self.github_service.monitor_deployment_comments(pr_url)
            
            result = AgentResult(
                agent_name="Deployment Monitor",
                success=True,
                data=deployment_info,
                execution_time=time.time() - start_time
            )
            
            return result
            
        except Exception as e:
            return AgentResult(
                agent_name="Deployment Monitor",
                success=False,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    @weave.op()
    def generate_qa_context(self, pr_data: PRData, doc_data: DocumentationData, deployment_info: DeploymentInfo) -> AgentResult:
        """Generate comprehensive QA context using CrewAI."""
        start_time = time.time()
        
        try:
            # Extract actual changes from diff
            specific_changes = self._extract_specific_changes(pr_data)
            
            # Create tasks for the crew with SPECIFIC change information
            analysis_task = Task(
                description=f"""
                Analyze the following PR with SPECIFIC code changes and generate QA testing context:
                
                PR Title: {pr_data.title}
                PR Description: {pr_data.description or "No description provided"}
                
                SPECIFIC CHANGES MADE:
                {specific_changes}
                
                PR Comments (additional context):
                {chr(10).join(pr_data.pr_comments) if pr_data.pr_comments else "No comments"}
                
                Files Changed: {', '.join(pr_data.files_changed)}
                Labels: {', '.join(pr_data.labels)}
                
                Repository Features: {', '.join(doc_data.key_features)}
                
                Focus on:
                1. What SPECIFIC functionality changed based on the actual code changes
                2. What UI/UX elements were modified and how
                3. What user behaviors need to be tested based on the changes
                4. Priority level for different testing areas based on impact
                
                Be SPECIFIC about what changed, not generic.
                """,
                agent=self.qa_context_generator,
                expected_output="Specific testing focus areas based on actual code changes"
            )
            
            scenario_task = Task(
                description=f"""
                Based on the SPECIFIC PR changes, create targeted testing scenarios:
                
                PR Title: {pr_data.title}
                
                ACTUAL CHANGES MADE:
                {specific_changes}
                
                PR Comments Context:
                {chr(10).join(pr_data.pr_comments) if pr_data.pr_comments else "No comments"}
                
                Create 3-5 SPECIFIC test scenarios that cover:
                1. Testing the exact changes made (not generic functionality)
                2. Visual/UI changes that were implemented
                3. User experience validation for the specific modifications
                4. Edge cases related to the specific changes
                
                For each scenario, provide:
                - Title (specific to the changes)
                - Description (what exactly to test)
                - Step-by-step testing instructions (based on actual changes)
                - Expected outcomes (specific to the modifications)
                - Priority level (High/Medium/Low)
                
                Be SPECIFIC about what to test, not generic.
                """,
                agent=self.qa_context_generator,
                expected_output="Specific testing scenarios based on actual code changes"
            )
            
            context_task = Task(
                description=f"""
                Generate application context for QA testers:
                
                Repository: {pr_data.repo_name}
                Key Features: {', '.join(doc_data.key_features)}
                README Content: {doc_data.readme_content[:500] if doc_data.readme_content else "No README available"}
                
                SPECIFIC CHANGES IN THIS PR:
                {specific_changes}
                
                Create a focused explanation of:
                1. What this application does
                2. What specific area was changed in this PR
                3. How the changes affect user experience
                4. Technical context specific to the modifications
                
                Keep it focused on the specific changes made.
                """,
                agent=self.documentation_analyzer,
                expected_output="Specific application context for the changes made"
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.qa_context_generator, self.documentation_analyzer],
                tasks=[analysis_task, scenario_task, context_task],
                process=Process.sequential,
                verbose=True
            )
            
            result = crew.kickoff()
            
            return AgentResult(
                agent_name="QA Context Generator",
                success=True,
                data=result,
                execution_time=time.time() - start_time
            )
            
        except Exception as e:
            return AgentResult(
                agent_name="QA Context Generator",
                success=False,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    def _extract_specific_changes(self, pr_data: PRData) -> str:
        """Extract specific changes from PR diff data."""
        changes = []
        
        for file_change in pr_data.file_changes:
            changes.append(f"\n📁 File: {file_change.filename}")
            changes.append(f"   Status: {file_change.status}")
            changes.append(f"   Changes: +{file_change.additions} -{file_change.deletions} lines")
            
            if file_change.patch:
                changes.append(f"   Code changes:")
                # Extract meaningful changes from patch
                lines = file_change.patch.split('\n')
                for line in lines:
                    if line.startswith('+++') or line.startswith('---'):
                        continue
                    if line.startswith('+') and not line.startswith('+++'):
                        changes.append(f"     ADDED: {line[1:].strip()}")
                    elif line.startswith('-') and not line.startswith('---'):
                        changes.append(f"     REMOVED: {line[1:].strip()}")
        
        return '\n'.join(changes)
    
    @weave.op()
    def format_qa_report(self, qa_context: str, pr_data: PRData, doc_data: DocumentationData, deployment_info: DeploymentInfo) -> QAReport:
        """Format the final QA report."""
        
        # Determine priority based on PR characteristics
        priority = Priority.MEDIUM
        if pr_data.additions + pr_data.deletions > 200:
            priority = Priority.HIGH
        elif any(label.lower() in ['critical', 'urgent', 'hotfix'] for label in pr_data.labels):
            priority = Priority.HIGH
        elif pr_data.additions + pr_data.deletions < 50:
            priority = Priority.LOW
        
        # Generate primary focus areas based on actual changes
        focus_areas = self._generate_focus_areas_from_changes(pr_data)
        
        # Generate SPECIFIC testing scenarios based on actual changes
        testing_scenarios = self._generate_specific_scenarios(pr_data, priority)
        
        # Create application context with specific changes
        app_context = self._create_application_context_with_changes(doc_data, pr_data)
        
        # Prepare additional resources
        additional_resources = {}
        
        # Only include setup instructions if there's no deployed URL
        if not deployment_info.url and doc_data.setup_instructions:
            additional_resources["Setup Instructions"] = doc_data.setup_instructions
        
        if doc_data.testing_guidelines:
            additional_resources["Testing Guidelines"] = doc_data.testing_guidelines
        if pr_data.pr_url:
            additional_resources["Pull Request"] = pr_data.pr_url
        
        return QAReport(
            overview={
                "feature": pr_data.title,
                "priority": priority.value,
                "files_changed": len(pr_data.files_changed),
                "lines_changed": pr_data.additions + pr_data.deletions,
                "testing_window": "30-60 minutes"
            },
            primary_focus_areas=focus_areas,
            testing_scenarios=testing_scenarios,
            application_context=app_context,
            deployment_info=deployment_info,
            additional_resources=additional_resources
        )
    
    def _generate_focus_areas_from_changes(self, pr_data: PRData) -> List[str]:
        """Generate focus areas based on actual code changes."""
        focus_areas = []
        
        # Analyze the actual changes to determine focus areas
        for file_change in pr_data.file_changes:
            # Check file type and content
            if file_change.patch:
                patch_content = file_change.patch.lower()
                
                # Look for specific UI/UX changes
                if any(keyword in patch_content for keyword in ['emoji', '✅', '❌', '🟢', '🔴']):
                    focus_areas.append("Emoji/Icon Display")
                if any(keyword in patch_content for keyword in ['align', 'text-align', 'monospace', 'font-family']):
                    focus_areas.append("Text Formatting and Alignment")
                if any(keyword in patch_content for keyword in ['table', 'th', 'td', 'tr']):
                    focus_areas.append("Table Display and Readability")
                if any(keyword in patch_content for keyword in ['yes', 'no', 'true', 'false']):
                    focus_areas.append("Boolean Value Display")
                if any(keyword in patch_content for keyword in ['number', 'digit', 'numeric']):
                    focus_areas.append("Numeric Value Display")
                if any(keyword in patch_content for keyword in ['css', 'style', 'class']):
                    focus_areas.append("Visual Styling Changes")
                if any(keyword in patch_content for keyword in ['responsive', 'mobile', 'width']):
                    focus_areas.append("Responsive Design")
            
            # Fallback to generic categories
            if any(ui_indicator in file_change.filename.lower() for ui_indicator in ['component', 'ui', 'view', 'page', 'template']):
                focus_areas.append("User Interface Changes")
            elif any(style_indicator in file_change.filename.lower() for style_indicator in ['css', 'scss', 'style']):
                focus_areas.append("Visual Styling Changes")
        
        # Remove duplicates and ensure we have at least one focus area
        unique_areas = list(set(focus_areas))
        return unique_areas if unique_areas else ["User Interface Changes"]
    
    def _generate_specific_scenarios(self, pr_data: PRData, priority: Priority) -> List[TestingScenario]:
        """Generate specific testing scenarios based on actual changes."""
        scenarios = []
        
        # Analyze PR title and description for specific changes
        title_lower = pr_data.title.lower()
        description_lower = (pr_data.description or "").lower()
        
        # Look for specific changes mentioned in PR
        if "table" in title_lower or "readability" in title_lower:
            scenarios.append(TestingScenario(
                title="Table Readability Verification",
                description="Verify that table readability improvements have been implemented correctly",
                steps=[
                    "Navigate to the application (deployed URL or local setup)",
                    "Find pages with tables",
                    "Check if Yes/No values are displayed as emojis (✅/❌)",
                    "Verify that numeric values are right-aligned and monospaced",
                    "Check table formatting across different screen sizes",
                    "Compare before/after readability"
                ],
                expected_outcome="Tables display improved readability with emoji indicators and proper number formatting",
                priority=priority
            ))
        
        # Check for emoji-related changes
        has_emoji_changes = any(
            file_change.patch and any(emoji in file_change.patch for emoji in ['✅', '❌', '🟢', '🔴', 'emoji'])
            for file_change in pr_data.file_changes
        )
        
        if has_emoji_changes:
            scenarios.append(TestingScenario(
                title="Emoji Display Testing",
                description="Test that emoji replacements for Yes/No values work correctly",
                steps=[
                    "Open the application in your browser",
                    "Find sections where Yes/No values are displayed",
                    "Verify Yes values show as ✅ or appropriate emoji",
                    "Verify No values show as ❌ or appropriate emoji",
                    "Test emoji display across different browsers",
                    "Check emoji accessibility (screen readers)"
                ],
                expected_outcome="Yes/No values are consistently displayed as appropriate emojis",
                priority=priority
            ))
        
        # Check for number formatting changes
        has_number_formatting = any(
            file_change.patch and any(keyword in file_change.patch.lower() for keyword in ['monospace', 'text-align', 'right', 'font-family'])
            for file_change in pr_data.file_changes
        )
        
        if has_number_formatting:
            scenarios.append(TestingScenario(
                title="Number Formatting Verification",
                description="Test that numeric values are properly formatted for comparison",
                steps=[
                    "Access the application",
                    "Navigate to sections with numeric data",
                    "Verify numbers are displayed in monospace font",
                    "Check that numbers are right-aligned",
                    "Test with different number formats (integers, decimals, percentages)",
                    "Verify alignment consistency across different data"
                ],
                expected_outcome="Numeric values are consistently monospaced and right-aligned for easy comparison",
                priority=priority
            ))
        
        # Add visual regression test
        scenarios.append(TestingScenario(
            title="Visual Regression Testing",
            description="Ensure UI changes don't break existing layout",
            steps=[
                "Access the application",
                "Take screenshots of affected pages",
                "Compare with previous version if available",
                "Check for any layout breaks or misalignments",
                "Test on different screen sizes",
                "Verify no unintended style changes"
            ],
            expected_outcome="UI changes are isolated and don't cause visual regressions",
            priority=Priority.MEDIUM
        ))
        
        # Fallback generic scenario if no specific changes detected
        if not scenarios:
            scenarios.append(TestingScenario(
                title="Core Functionality Verification",
                description="Verify that the main features affected by this PR work correctly",
                steps=[
                    "Access the application",
                    "Identify the areas likely affected by the changes",
                    "Test the primary user flows",
                    "Verify no breaking changes in existing functionality"
                ],
                expected_outcome="All core functionality works as expected without errors",
                priority=priority
            ))
        
        return scenarios
    
    def _create_application_context_with_changes(self, doc_data: DocumentationData, pr_data: PRData) -> str:
        """Create comprehensive application context with specific changes."""
        context_parts = []
        
        context_parts.append(f"**Repository:** {pr_data.repo_name}")
        
        if doc_data.readme_content:
            # Extract first paragraph or summary
            lines = doc_data.readme_content.split('\n')
            summary = ""
            for line in lines:
                if line.strip() and not line.startswith('#'):
                    summary = line.strip()
                    break
            if summary:
                context_parts.append(f"**Application Summary:** {summary}")
        
        # Add specific change information
        if pr_data.diff_summary:
            context_parts.append(f"**Changes Made:** {pr_data.diff_summary}")
        
        if pr_data.pr_comments:
            context_parts.append(f"**PR Comments:** {'; '.join(pr_data.pr_comments)}")
        
        context_parts.append(f"**Files Modified:** {len(pr_data.files_changed)} files")
        context_parts.append(f"**Change Size:** {pr_data.additions} additions, {pr_data.deletions} deletions")
        
        if pr_data.labels:
            context_parts.append(f"**Labels:** {', '.join(pr_data.labels)}")
        
        return "\n\n".join(context_parts) 