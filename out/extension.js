"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "boilerPlateForTS" is now active!');
    const command = 'boilerPlateForTS.create_unit_test_boiler_plate';
    function commandHandler(filepath) {
        vscode.window.showInformationMessage(`Hii Boiler plate extension has been added${filepath}`);
    }
    ;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json	
    context.subscriptions.push(vscode.commands.registerCommand(command, (uri) => {
        commandHandler(uri.fsPath);
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map