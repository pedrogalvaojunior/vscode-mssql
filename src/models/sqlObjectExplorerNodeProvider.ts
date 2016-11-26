'use strict';
// import * as vscode from 'vscode';
import ConnectionManager from '../controllers/connectionManager';
import { ConnectionStore } from './ConnectionStore';
import { IConnectionCredentials } from './interfaces';
import * as Utils from './utils';

import { TreeExplorerNodeProvider } from 'vscode';


class SqlObjectExplorerNodeProvider implements TreeExplorerNodeProvider<ObjectExplorerNode> {
    public static providerId = 'sqlObjectExplorer';
    private _connectionStore: ConnectionStore;
    constructor(private _connectionManager: ConnectionManager) {
        this._connectionStore = _connectionManager.connectionStore;
    }


    getLabel(node: ObjectExplorerNode): string {
        return node.displayName;
    }

    getHasChildren(node: ObjectExplorerNode): boolean {
        return !node.isLeaf;
    }

    getClickCommand(node: ObjectExplorerNode): string {
        return node.getClickCommand();
    }

    provideRootNode(): ObjectExplorerNode {
        return new RootNode(this._connectionStore);
    }

    resolveChildren(node: ObjectExplorerNode): Thenable<ObjectExplorerNode[]> {
        return node.resolveChildren();
    }
}

abstract class ObjectExplorerNode {
    private _displayName;

    constructor(public isLeaf: boolean) {

    }

    public get displayName(): string {
        return (this._displayName !== undefined) ? this._displayName : '';
    }

    protected setDisplayName(name: string): void {
        this._displayName = name;
    }
    public abstract getClickCommand(): string;

    public resolveChildren(): Thenable<ObjectExplorerNode[]> {
        let self = this;
        return new Promise((resolve, reject) => {
            if (this.isLeaf) {
                resolve([]);
            } else {
                resolve(self.doResolveChildren());
            }
        });
    }

    protected abstract doResolveChildren(): ObjectExplorerNode[];
}

class RootNode extends ObjectExplorerNode {

    constructor(private _connectionStore: ConnectionStore) {
        super(false);
    }

    getClickCommand(): string {
        return undefined;
    }

    doResolveChildren(): ObjectExplorerNode[] {
        let self = this;
        // For now, just show items saved in the profiles list
        let nodes: ObjectExplorerNode[] = this._connectionStore.getProfilePickListItems(false).map((profile, i) => {
            return new ServerNode(self._connectionStore, profile.connectionCreds);
        });
        return nodes;
    }

}

class ServerNode extends ObjectExplorerNode {
    private _isDatabaseConn: boolean;
    constructor(private _connectionStore: ConnectionStore, private _connInfo: IConnectionCredentials) {
        super(false);
        if (!Utils.isDefaultDatabase(_connInfo.database)) {
            this._isDatabaseConn = true;
        }
        this.setDisplayName(this.calcDisplayName());
    }

    private calcDisplayName(): string {
        let params: string[] = [];

        // TODO ideally we should know the server version.
        if (this._connInfo.user) {
            params.push(this._connInfo.user);
        }
        if (this._isDatabaseConn) {
            params.push(this._connInfo.database);
        }

        let name = this._connInfo.server;
        if (params.length === 1) {
            name += ` (${params[0]})`;
        } else if (params.length > 1) {
            name += ` (${params.join(', ')})`;
        }
        return name;
    }

    getClickCommand(): string {
        return undefined;
    }

    doResolveChildren(): ObjectExplorerNode[] {
        return [];
    }

}

export { SqlObjectExplorerNodeProvider, ObjectExplorerNode }
