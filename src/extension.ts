'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let benchPath = null;

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.benchActivate', () => {
        benchPath = tryAndGetBenchPath();
        vscode.window.showInformationMessage('Bench Commands will run in ' + benchPath);
    });

    let benchKill = vscode.commands.registerCommand('extension.benchKill', () => {
        runCommand('sudo pkill python node redis');
    });

    let benchBuild = vscode.commands.registerCommand('extension.benchBuild', () => {
        runBenchCommand('build');
    });

    let benchConsole = vscode.commands.registerCommand('extension.benchConsole', () => {
        runSiteCommand('console');
    });

    let benchMigrate = vscode.commands.registerCommand('extension.benchMigrate', () => {
        runSiteCommand('migrate');
    });

    let benchUpdate = vscode.commands.registerCommand('extension.benchUpdate', () => {
        vscode.window.showInformationMessage('Are you sure you want to BENCH UPDATE?', 'Yes', 'No')
            .then(value => {
                if (value === 'Yes') {
                    runBenchCommand('update');
                } else {
                    vscode.window.showInformationMessage('Good decision!');
                }
            });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function tryAndGetBenchPath() {
    let currentFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let benchPath = currentFolder;

    while (!hasValues(fs.readdirSync(benchPath), ['apps', 'sites', 'Procfile'])) {
        benchPath = path.resolve(benchPath, '..');
    }

    return benchPath;
}

function runSiteCommand(command) {
    vscode.window.showQuickPick(getSiteList(), {
        placeHolder: 'Select Site'
    }).then(site_name => {
        runBenchCommand(`--site ${site_name} ${command}`)
    });
}

function runBenchCommand(command) {
    const term = vscode.window.createTerminal('Bench');
    term.show();
    term.sendText('cd ' + benchPath, true);
    term.sendText(`bench ${command}`);
}

function runCommand(command) {
    const term = vscode.window.createTerminal('Bench');
    term.show();
    term.sendText(`${command}`);
}

function getSiteList() {
    let sites = fs.readdirSync(path.resolve(benchPath, 'sites'));
    return sites.filter(
        value => !['apps.txt', 'currentsite.txt', 'common_site_config.json'].includes(value)
            && !value.startsWith('.')
    );
}

function hasValues(array, values) {
    return values.reduce((hasAll, value) => {
        return array.includes(value) && hasAll;
    }, true);
}
