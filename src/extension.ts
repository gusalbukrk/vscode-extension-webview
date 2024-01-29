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

		console.log('log from inside `helloWorld` command implementation.')

		// Display a message box to the user
		const msg = 'Hello World from First extension!';
		vscode.window.showInformationMessage(msg);
	});

	context.subscriptions.push(disposable1);

	let disposable2 = vscode.commands.registerCommand('first-extension.another', () => {
		console.log('log from inside `another` command implementation.')

		// Display a message box to the user
		const msg = 'meh...';
		vscode.window.showErrorMessage(msg);
	});
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('log from inside `deactivate` function.');
}
