import * as vscode from 'vscode';
import { OpenAddToColUI, OpenAttachVariableUI, OpenCopyToColUI, OpenExistingItem, OpenRunAllUI, OpenVariableUI } from '../../extension';
import { IHistory, IVariable } from '../../fetch-client-ui/components/SideBar/redux/types';
import { getNonce, requestTypes } from '../../utils/configuration';
import { AddToCollection, AttachVariable, DeleteAllCollectionItems, DeleteCollection, DeleteCollectionItem, GetAllCollections, NewRequestToCollection, RenameCollection, RenameCollectionItem } from '../../utils/db/collectionDBUtil';
import { DeleteAllHistory, DeleteHistory, GetAllHistory, RenameHistory } from '../../utils/db/historyDBUtil';
import { Export, Import, SaveRequest } from '../db/mainDBUtil';
import { ChangeVariableStatus, DeleteVariable, DuplicateVariable, ExportVariable, GetAllVariable, ImportVariable, RenameVariable, SaveVariable } from '../db/varDBUtil';
import { formatDate } from '../helper';

export class SideBarProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'fetch-client.sideBar';

  public view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) { }

  public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(reqData => {
      switch (reqData.type) {
        case requestTypes.getAllHistoryRequest:
          GetAllHistory(webviewView);
          break;
        case requestTypes.deleteAllHistoryRequest:
          this.showConfirmationBox("Do you want to clear all history?").then((data: any) => {
            if (data === "Yes") {
              DeleteAllHistory(webviewView);
            }
          });
          break;
        case requestTypes.deleteHistoryRequest:
          DeleteHistory(webviewView, reqData.data);
          break;
        case requestTypes.renameHistoryRequest:
          this.showInputBox().then((data: any) => {
            if (data) {
              RenameHistory(webviewView, reqData.data, data);
            }
          });
          break;
        case requestTypes.openHistoryItemRequest:
          OpenExistingItem(reqData.data.id, reqData.data.name, reqData.data.varId);
          break;
        case requestTypes.addToCollectionsRequest:
          OpenAddToColUI(reqData.data);
          break;
        case requestTypes.getAllCollectionsRequest:
          GetAllCollections(webviewView.webview);
          break;
        case requestTypes.renameCollectionItemRequest:
          this.showInputBox().then((name: any) => {
            if (name) {
              RenameCollectionItem(webviewView, reqData.data.colId, reqData.data.historyId, name);
            }
          });
          break;
        case requestTypes.deleteCollectionItemRequest:
          DeleteCollectionItem(webviewView, reqData.data.colId, reqData.data.historyId);
          break;
        case requestTypes.renameCollectionRequest:
          this.showInputBox().then((name: any) => {
            if (name) {
              RenameCollection(webviewView, reqData.data, name);
            }
          });
          break;
        case requestTypes.deleteCollectionRequest:
          this.showConfirmationBox("Do you want to delete the collection?").then((data: any) => {
            if (data === "Yes") {
              DeleteCollection(webviewView, reqData.data);
            }
          });
          break;
        case requestTypes.newRequest:
          OpenExistingItem();
          break;
        case requestTypes.duplicateCollectionsRequest:
          AddToCollection(reqData.data, null, webviewView);
          break;
        case requestTypes.exportRequest:
          vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file("fetch-client-" + reqData.data.cols.name + ".json") }).then((uri: vscode.Uri | undefined) => {
            if (uri) {
              const value = uri.fsPath;
              Export(value, reqData.data.cols, reqData.data.hisId);
            }
          });
          break;
        case requestTypes.clearRequest:
          this.showConfirmationBox("Do you want to clear all items?").then((data: any) => {
            if (data === "Yes") {
              DeleteAllCollectionItems(webviewView, reqData.data);
            }
          });
          break;
        case requestTypes.importRequest:
          vscode.window.showOpenDialog({ filters: { 'Json Files': ['json'] } }).then((uri: vscode.Uri[] | undefined) => {
            if (uri && uri.length > 0) {
              const value = uri[0].fsPath;
              Import(webviewView, value);
            }
          });
          break;
        case requestTypes.copyToCollectionsRequest:
          OpenCopyToColUI(reqData.data.id, reqData.data.name);
          break;
        case requestTypes.getAllVariableRequest:
          GetAllVariable(webviewView.webview);
          break;
        case requestTypes.renameVariableRequest:
          this.showInputBox().then((name: any) => {
            if (name) {
              RenameVariable(webviewView, reqData.data, name);
            }
          });
          break;
        case requestTypes.deleteVariableRequest:
          this.showConfirmationBox("Do you want to delete the variable?").then((data: any) => {
            if (data === "Yes") {
              DeleteVariable(webviewView, reqData.data);
            }
          });
          break;
        case requestTypes.newVariableRequest:
          OpenVariableUI();
          break;
        case requestTypes.openVariableItemRequest:
          OpenVariableUI(reqData.data);
          break;
        case requestTypes.attachVariableRequest:
          OpenAttachVariableUI(reqData.data.id, reqData.data.name);
          break;
        case requestTypes.removeVariableRequest:
          this.showConfirmationBox("Do you want to remove the variable from the collection?").then((data: any) => {
            if (data === "Yes") {
              AttachVariable(reqData.data.id, "", null, webviewView);
            }
          });
          break;
        case requestTypes.activeVariableRequest:
          ChangeVariableStatus(reqData.data.id, reqData.data.status, webviewView);
          break;
        case requestTypes.exportVariableRequest:
          vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file("fetch-client-" + reqData.vars.name + ".json") }).then((uri: vscode.Uri | undefined) => {
            if (uri) {
              const value = uri.fsPath;
              ExportVariable(value, reqData.vars);
            }
          });
          break;
        case requestTypes.importVariableRequest:
          vscode.window.showOpenDialog({ filters: { 'Json Files': ['json'] } }).then((uri: vscode.Uri[] | undefined) => {
            if (uri && uri.length > 0) {
              const value = uri[0].fsPath;
              ImportVariable(webviewView, value);
            }
          });
          break;
        case requestTypes.duplicateVariableRequest:
          DuplicateVariable(reqData.id, null, webviewView);
          break;
        case requestTypes.runAllUIOpenRequest:
          OpenRunAllUI(reqData.data.id, reqData.data.name, reqData.data.varId);
          break;
        case requestTypes.createNewRequest:
          SaveRequest(reqData.data.request);
          let item: IHistory = {
            id: reqData.data.request.id,
            method: reqData.data.request.method,
            name: reqData.data.request.name ? reqData.data.request.name : reqData.data.request.url,
            url: reqData.data.request.url,
            createdTime: reqData.data.request.createdTime ? reqData.data.request.createdTime : formatDate()
          };
          NewRequestToCollection(item, reqData.data.colId, webviewView);
          break;
      }
    });
  }

  private async showInputBox() {
    const res = await vscode.window.showInputBox({
      value: "", prompt: "Enter new name", placeHolder: "Enter new name", ignoreFocusOut: false,
      validateInput: text => {
        return text !== "" && text.length <= 50 ? null : "Enter the valid name (length should be <=50)";
      }
    });

    return res;
  }

  private async showConfirmationBox(text: string) {
    const res = await vscode.window.showWarningMessage(text, "Yes", "No");
    return res;
  }

  private getHtmlForWebview(webview: vscode.Webview) {

    const nonce = getNonce();

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist/fetch-client-ui.js")
    );

    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "/dist/main.css"));

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="${styleUri}" rel="stylesheet" type="text/css"/>
        <title>sideBar</title>
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>`;;
  }
}
