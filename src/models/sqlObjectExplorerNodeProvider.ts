
// import * as vscode from 'vscode';
import ConnectionManager from '../controllers/connectionManager';

import { TreeExplorerNodeProvider } from 'vscode';

import * as fs from 'fs';
import * as path from 'path';


class SqlObjectExplorerNodeProvider implements TreeExplorerNodeProvider<ObjectExplorerNode> {
    public static providerId = 'sqlObjectExplorer';

    constructor(private _connectionManager: ConnectionManager) {

    }

    getLabel(node: ObjectExplorerNode): string {
        switch (node.kind) {
            case 'root':
                return '';
            case 'node':
                return 'node';
            case 'leaf':
                return 'leaf';
            default:
                // unexpected
                throw new Error('Unsupported node type in tree');
        }
    }

    getHasChildren(node: ObjectExplorerNode): boolean {
        return node.kind !== 'leaf';
    }

    getClickCommand(node: ObjectExplorerNode): string {
        if (node.kind === 'leaf') {
            return 'extension.openPackageOnNpm';
        } else {
            return undefined;
        }
    }

    provideRootNode(): ObjectExplorerNode {
        return new Root();
    }

    resolveChildren(node: ObjectExplorerNode): Thenable<ObjectExplorerNode[]> {
        return new Promise((resolve, reject) => {
            switch (node.kind) {
                case 'root':
                    resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'package.json')));
                    break;
                case 'node':
                    resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', node.moduleName, 'package.json')));
                    break;
                case 'leaf':
                    resolve([]);
                    break;
                default:
                    throw new Error('Unsupported node type in tree');
            }
        });
    }

    private getDepsInPackageJson(filePath: string): ObjectExplorerNode[] {
        try {
            fs.accessSync(filePath);

            const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            const deps = Object.keys(packageJson.dependencies).map(d => {
                try {
                    fs.accessSync(path.join(this.workspaceRoot, 'node_modules', d));
                    return new ConnectionNode(d);
                } catch (err) {
                    return new Leaf(d);
                }
            });
            const devDeps = Object.keys(packageJson.devDependencies).map(d => {
                try {
                    fs.accessSync(path.join(this.workspaceRoot, 'node_modules', d));
                    return new ConnectionNode(d);
                } catch (err) {
                    return new Leaf(d);
                }
            });

            return deps.concat(devDeps);
        } catch (err) { // No package.json at root
            return [];
        }
    }
}

type ObjectExplorerNode = Root | ConnectionNode | FolderNode | Leaf;

class Root {
    kind: "root" = 'root';
}

class ConnectionNode {
    kind: "connectionNode" = 'connectionNode';

    constructor(public name: string) {

    }
}
class FolderNode {
    kind: "folderNode" = 'folderNode';

    constructor(public name: string) {

    }
}

class Leaf {
    kind: "leaf" = 'leaf';

    constructor(public name: string) {

    }
}

export { SqlObjectExplorerNodeProvider, ObjectExplorerNode }
