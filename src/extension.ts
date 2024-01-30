// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('log from inside `activate` function.');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand('first-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		console.log('log from inside `helloWorld` command implementation.');

		// Display a message box to the user
		const msg = 'Hello World from First extension!';
		vscode.window.showInformationMessage(msg);
	});

	context.subscriptions.push(disposable1);

	let disposable2 = vscode.commands.registerCommand('first-extension.another', () => {
		console.log('log from inside `another` command implementation.');

		// Display a message box to the user
		const msg = 'meh...';
		vscode.window.showErrorMessage(msg);
	});
	context.subscriptions.push(disposable2);

	// https://code.visualstudio.com/api/extension-guides/webview#visibility-and-moving
	// track the current panel with a webview
	// make impossible to open multiple panels of same type at once
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// https://code.visualstudio.com/api/extension-guides/webview#webviews-api-basics
	let disposable3 = vscode.commands.registerCommand('catCoding.start', () => {
		// the effects of this will be visible only when the editor is splitted in multiple columns,
		// if command is called when already there's a currentPanel but it's in a different column
		// currentPanel will be moved to the column where the command was called;
		// if instead `currentPanel.reveal()` were to be called without an argument,
		// currentPanel wouldn't be moved to current column
		// instead the focus would be moved to the column where the panel is
      const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

				if (currentPanel) { // if we already have a panel, show it in the target column
					currentPanel.reveal(columnToShowIn);
				} else { // otherwise, create a new panel
					// Create and show a new webview
					currentPanel = vscode.window.createWebviewPanel(
						'catCoding', // Identifies the type of the webview. Used internally
						'Cat Coding', // Title of the panel displayed to the user
						vscode.ViewColumn.One, // Editor column to show the new webview panel in.
						{} // Webview options. More on these later.
					);

					// https://code.visualstudio.com/api/extension-guides/webview#updating-webview-content
					let iteration = 0;
					const updateWebview = () => { // will keep running even after panel is closed
						console.log('from `updateWebview`');
						currentPanel!.webview.html = getWebviewContent(iteration++ % 2 ? 'compiling' : 'coding');
					};
					//
					// Set initial content
					updateWebview();
					//
					// And schedule updates to the content every second
					const interval = setInterval(updateWebview, 1000);

					// https://code.visualstudio.com/api/extension-guides/webview#lifecycle
					currentPanel.onDidDispose(
						() => {
							// When the panel is closed, cancel any future updates to the webview content
							clearInterval(interval);
							currentPanel = undefined;
						},
						null,
						context.subscriptions
					);

					// it's also possible to programmatically close webviews by calling dispose() on them
					// panel.dispose();

					// currentPanel.onDidChangeViewState(
					// 	e => {
					// 		console.log('panel visibility changed or it was move from a column to another');
					// 	},
					// 	null,
					// 	context.subscriptions
					// );
				}
    });

	context.subscriptions.push(disposable3);
}

function getWebviewContent(activity: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
		<h1>${activity}</h1>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('log from inside `deactivate` function.');
}
