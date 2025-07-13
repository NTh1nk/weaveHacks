import os
from dotenv import load_dotenv
import openai
import weave

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the QA Context Generator."""
    
    def __init__(self):
        # W&B Configuration
        self.wandb_api_key = os.getenv("WANDB_API_KEY")
        self.wandb_team = os.getenv("WANDB_TEAM")
        self.wandb_project = os.getenv("WANDB_PROJECT")
        
        # GitHub Configuration
        self.github_token = os.getenv("GITHUB_TOKEN")
        
        # OpenAI Configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openai_base_url = os.getenv("OPENAI_BASE_URL", "https://api.inference.wandb.ai/v1")
        
        # Application Configuration
        self.model_name = os.getenv("MODEL_NAME", "meta-llama/Llama-3.1-8B-Instruct")
        self.max_deployment_wait_minutes = int(os.getenv("MAX_DEPLOYMENT_WAIT_MINUTES", "10"))
        self.min_comments_for_deployment = int(os.getenv("MIN_COMMENTS_FOR_DEPLOYMENT", "2"))
        
        # Validate required configs
        self._validate_config()
    
    def _validate_config(self):
        """Validate that all required configuration values are present."""
        required_configs = [
            ("WANDB_API_KEY", self.wandb_api_key),
            ("WANDB_TEAM", self.wandb_team),
            ("WANDB_PROJECT", self.wandb_project),
            ("GITHUB_TOKEN", self.github_token),
            ("OPENAI_API_KEY", self.openai_api_key),
        ]
        
        missing_configs = [name for name, value in required_configs if not value]
        
        if missing_configs:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_configs)}")
    
    def initialize_weave(self):
        """Initialize W&B Weave for observability."""
        project_name = f"{self.wandb_team}/{self.wandb_project}"
        weave.init(project_name)
        return project_name
    
    def get_openai_client(self):
        """Get configured OpenAI client using W&B Inference."""
        return openai.OpenAI(
            base_url=self.openai_base_url,
            api_key=self.openai_api_key,
            project=f"{self.wandb_team}/{self.wandb_project}",
        )

# Global config instance
config = Config() 