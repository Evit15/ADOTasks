# How to debug in Visual Studio Code
1. Create "launch.json" file in workspace folder (".vscode") with below sample:
```
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/buildandreleasetask/GenerateTestRun/index.js",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ],
            "env": {
                "INPUT_uiSelection": "false",
                "INPUT_linkToArtifact": "false",
                "INPUT_getRecursive": "true",
                "INPUT_testPlanString": "",
                "INPUT_testSuiteString": "",
                "INPUT_outputTestRunID": "out",
                "INPUT_testRunName": "test extension",
                "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI": "https://dev.azure.com/MyOrgnization/",
                "DEBUG_PAT": "",
                "SYSTEM_TEAMPROJECT": "MyProject"
            },
            "cwd": "${workspaceFolder}/buildandreleasetask/GenerateTestRun",
            "console":"integratedTerminal",
            "preLaunchTask": "npm: ci-build - buildandreleasetask/GenerateTestRun"
        }
    ]
}
```
2. Create "tasks.json" file in workspace folder (".vscode") with below sample:
```
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "npm",
			"script": "ci-build",
			"path": "buildandreleasetask/GenerateTestRun",
			"group": "build",
			"problemMatcher": [],
			"label": "npm: ci-build - buildandreleasetask/GenerateTestRun",
			"detail": "npx tsc"
		}
	]
}
```
3. Press "F5" to debug in js file