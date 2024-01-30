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
						{
							enableScripts: true,

							// root paths from which the webview can load local resources using `asWebviewUri`
							// default is current workspace and extension's install directory
							// to disallow all local resources, just set to an empty array
							localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src')],
						},
					);

					// to load resources or any content from the user's current workspace
					// you must use the Webview.asWebviewUri function to convert a local `file:` URI
					// into a special URI that VS Code can use to load a subset of local resources
					const path = vscode.Uri.joinPath(context.extensionUri, 'src', 'cat.gif');
					const uri = currentPanel.webview.asWebviewUri(path);

					// https://code.visualstudio.com/api/extension-guides/webview#updating-webview-content
					let iteration = 0;
					const updateWebview = () => { // will keep running even after panel is closed
						console.log('from `updateWebview`');
						currentPanel!.webview.html = getWebviewContent(currentPanel!.webview, iteration++ % 2 ? 'compiling' : 'coding', uri);
					};
					//
					// Set initial content
					updateWebview();
					//
					// And schedule updates to the content every second
					// const interval = setInterval(updateWebview, 1000);

					// https://code.visualstudio.com/api/extension-guides/webview#lifecycle
					// currentPanel.onDidDispose(
					// 	() => {
					// 		// When the panel is closed, cancel any future updates to the webview content
					// 		clearInterval(interval);
					// 		currentPanel = undefined;
					// 	},
					// 	null,
					// 	context.subscriptions
					// );

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

	// https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension
	let disposable4 = vscode.commands.registerCommand('catCoding.doRefactor', () => {
      if (!currentPanel) {
        return;
      }

      // send a message to our webview.
      // you can send any JSON serializable data.
      currentPanel.webview.postMessage({ command: 'refactor' });
    });
	context.subscriptions.push(disposable3);
}

function getWebviewContent(webview: vscode.Webview, activity: string, imgSrc: vscode.Uri) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
		
		<!-- https://code.visualstudio.com/api/extension-guides/webview#content-security-policy -->
		<!-- "default-src 'none';" disallows all content, the directives afterwards -->
		<!-- allow loading local scripts and stylesheets and loading images over https -->
		<!-- it also implicitly disables inline scripts and styles -->
		<!-- <meta
			http-equiv="Content-Security-Policy"
			content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};"
		/> -->

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
		<style>
		 	/* https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content */
			/* webview can use CSS to change their appearance based on VS Code's current theme */
			/* VS Code groups themes into three categories */
			/* and adds a special class to the body element to indicate the current theme  */
			body.vscode-light { background-color: lightblue; }
			body.vscode-dark { background-color: blue; }
			body.vscode-high-contrast { background-color: white; }
		</style>
</head>
<body>
		<h1>${activity}</h1>
    <!-- <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" /> -->
    <img src="${imgSrc}" width="200" /><br />

		<!-- if 'preventDefaultContextMenuItems' were set to false,
		custom menu itens will appear below default menu itens (cut, copy, paste) -->
		<textarea data-vscode-context='{"webviewSection": "editor", "preventDefaultContextMenuItems": true}'></textarea>

		<button data-vscode-context='{"preventDefaultContextMenuItems": true }' onClick='((e) => {
						e.preventDefault();
						e.target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
						e.stopPropagation();
				})(event)'>Create</button>

		<script type="module">
			// to see log output, open the developer tools in VS Code using
			// 'Developer: Toggle Developer Tools' command;
			// to be able to evaluate a expression in the context of the webview
			// (to, for instance, use the 'x' variable defined below)
			// you need to change the JavaScript context from 'top' (default) to 'pending-frame (index.html)'
			let x = 13;
			console.log(x);

			const vscode = acquireVsCodeApi();

			// https://code.visualstudio.com/api/extension-guides/webview#persistence
			// webviews contents are created when the webview becomes visible and destroyed
			// when moved into the background; any state inside the webview will be lost
			// when the webview is moved to a background tab;
			// webview can use the getState and setState methods
			// to save off and restore a JSON serializable state object;
			// an alternative is 'retainContextWhenHidden' which is much heavier and should only be used in extensions with complex state
			// https://code.visualstudio.com/api/extension-guides/webview#retaincontextwhenhidden
			if (vscode.getState() === undefined) vscode.setState({ title: 'coding' })
			
			// this line will make sure to display the correct title after regained focus
			document.querySelector('h1').textContent = vscode.getState().title;

			// handle the message inside the webview
			window.addEventListener('message', event => {

					const message = event.data; // The JSON data our extension sent

					switch (message.command) {
							case 'refactor':
								vscode.setState({ title: vscode.getState().title + '!' });
								document.querySelector('h1').textContent = vscode.getState().title;
					}
			});

			const article = await (await fetch('https://jsonplaceholder.typicode.com/posts/1')).json();
			console.log(article);
			console.log('!!!');
		</script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('log from inside `deactivate` function.');
}
