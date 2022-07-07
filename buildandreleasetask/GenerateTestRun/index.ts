import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        const sTestPlanID = tl.getInput('testPlan', true)!;
        const sTestSuiteID = tl.getInput('testSuite', true)!;

        const iTestPlanID: number = parseInt(sTestPlanID);
        const iTestSuiteID: number = parseInt(sTestSuiteID);
        console.log(`Test plan id: ${iTestPlanID}`);
        console.log(`Test suite id: ${iTestSuiteID}`);
    }
    catch (err) {
        let errorMessage = "Failed to do something exceptional";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        tl.setResult(tl.TaskResult.Failed, errorMessage);
    }
}

run();