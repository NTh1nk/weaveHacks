import { Stagehand, type ConstructorParams } from "@browserbasehq/stagehand";
import { z } from "zod";

// Stagehand configuration
const stagehandConfig = (): ConstructorParams => {
	return {
		env: "BROWSERBASE",
		verbose: 1,
		modelName: "google/gemini-2.5-flash-preview-05-20",
		modelClientOptions: {
			apiKey: process.env.GOOGLE_API_KEY,
		},
		localBrowserLaunchOptions: {
			headless: true,
		},
	};
};

// Validation function to check extracted job data
function validateJobs(
	jobs: Array<{
		company?: string;
		jobTitle?: string;
		location?: string;
		jobType?: string;
		postedTime?: string;
	}>
) {
	const bugs: string[] = [];

	jobs.forEach((job, index) => {
		if (!job.jobTitle || job.jobTitle.trim() === "") {
			bugs.push(`Job #${index + 1} missing job title.`);
		}
		if (!job.company || job.company.trim() === "") {
			bugs.push(`Job #${index + 1} missing company name.`);
		}
		if (!job.location || job.location.trim() === "") {
			bugs.push(`Job #${index + 1} missing location.`);
		}
		if (!job.jobType || job.jobType.trim() === "") {
			bugs.push(`Job #${index + 1} missing job type.`);
		}
		if (!job.postedTime || job.postedTime.trim() === "") {
			bugs.push(`Job #${index + 1} missing posted time.`);
		}
	});

	return bugs;
}

async function runWorkflow() {
	let stagehand: Stagehand | null = null;

	try {
		// Initialize Stagehand
		console.log("Initializing Stagehand...");
		stagehand = new Stagehand(stagehandConfig());
		await stagehand.init();
		console.log("Stagehand initialized successfully.");

		// Get the page instance
		const page = stagehand.page;
		if (!page) {
			throw new Error("Failed to get page instance from Stagehand");
		}

		// Step 1: Navigate to URL
		console.log("Navigating to: https://www.ycombinator.com/jobs");
		await page.goto("https://www.ycombinator.com/jobs");

		// Step 2: Extract data
		console.log(
			"Extracting: extract all job listings from the first page including company name, job title, location, job type, and when it was posted"
		);
		const extractedData2 = await page.extract({
			instruction:
				"extract all job listings from the first page including company name, job title, location, job type, and when it was posted",
			schema: z.object({
				jobs: z.array(
					z.object({
						company: z.string().optional(),
						jobTitle: z.string().optional(),
						location: z.string().optional(),
						jobType: z.string().optional(),
						postedTime: z.string().optional(),
					})
				),
			}),
		});
		console.log("Extracted:", extractedData2);

		// Step 3: Validate extracted data for bugs
		const jobs = extractedData2.jobs || [];
		console.log(`Validating ${jobs.length} extracted jobs...`);

		const bugs = validateJobs(jobs);
		if (bugs.length > 0) {
			console.warn("Potential bugs detected in extracted data:");
			bugs.forEach((bug) => console.warn(`- ${bug}`));
			return { success: false, bugs };
		}

		console.log("No bugs detected. Workflow completed successfully.");
		return { success: true };
	} catch (error) {
		console.error("Workflow failed:", error);
		return { success: false, error };
	} finally {
		// Clean up
		if (stagehand) {
			console.log("Closing Stagehand connection.");
			try {
				await stagehand.close();
			} catch (err) {
				console.error("Error closing Stagehand:", err);
			}
		}
	}
}

// Single execution
runWorkflow().then((result) => {
	console.log("Execution result:", result);
	process.exit(result.success ? 0 : 1);
});

export default runWorkflow;
