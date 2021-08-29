import { rm, readFile, mkdir, writeFile, access } from 'fs/promises';
import * as vscode from 'vscode';
import * as fg from 'fast-glob';

export function activate(context: vscode.ExtensionContext) {
	let promote = vscode.commands.registerCommand('rust-promote-mod.promoteFile', async (e) => {
		let segments = e.fsPath.split('/');
		let modname = segments.pop().split('.')[0];
		if(modname == "mod") {
			vscode.window.showErrorMessage("Already in a directory mod");
			return;
		}
		let parent = segments.join('/');
		let content = await readFile(e.fsPath, 'utf8');
		await rm(e.fsPath);
		await mkdir(parent + "/" + modname);
		await writeFile(parent + "/" + modname + "/mod.rs", content);
	});

	let downgrade = vscode.commands.registerCommand('rust-promote-mod.downgradeDir', async (e) => {
		let segments = e.fsPath.split('/');
		let modname = segments.pop();
		let parent = segments.join('/');
		let modRs = parent + "/" + modname + "/mod.rs";
		try {
			await access(modRs)
		} catch {
			vscode.window.showErrorMessage("Is not a rust module directory!");
			return;
		}
		let restFiles = await fg([parent + "/" + modname + "/*"], {dot: true});
		if (restFiles.length > 1) {
			vscode.window.showErrorMessage("Cannot downgrade a directory with multiple files now");
			return;
		}
		let targetFile = parent + "/" + modname + ".rs";
		let content = await readFile(modRs, 'utf8');
		await rm(e.fsPath, {recursive: true});
		await writeFile(targetFile, content);
	});

	context.subscriptions.push(promote);
	context.subscriptions.push(downgrade);
}

// this method is called when your extension is deactivated
export function deactivate() {}
