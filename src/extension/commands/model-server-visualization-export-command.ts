import {ExtensionCommand} from "./command-utils.js";
import {LanguageClient} from "vscode-languageclient/node.js";
import vscode from "vscode";
import {WebviewPanelManager} from "sprotty-vscode/lib";

export class ModelServerVisualizationExportCommand extends ExtensionCommand {
    private readonly webviewManager: WebviewPanelManager;

    constructor(client: LanguageClient, logger: vscode.OutputChannel, webViewManager: WebviewPanelManager) {
        super("model-modeling-language.msvis.diagram.export", client, logger);
        this.webviewManager = webViewManager;
    }

    execute(...args: any[]): any {
        const activeWebview = this.webviewManager.findActiveWebview();
        if (activeWebview) {
            activeWebview.sendAction({
                kind: 'requestExportSvg'
            });
        }
    }
}