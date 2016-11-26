'use strict';

let displayItems: IDisplayItems = require('./objectExplorerDisplayItems.json');

class DisplayItemGenerator {
    private static _instance: DisplayItemGenerator = undefined;

    private _reverseDependencyMap: { [key: string]: string[] };
    public static get instance(): DisplayItemGenerator {
        if (!this._instance) {
            this._instance = new DisplayItemGenerator();
        }
        return this._instance;
    }

    constructor() {
        this.initReverseDependencies(displayItems.ServerExplorerTree.ReverseDependencyList);
    }

    private initReverseDependencies(reverseDependencies: IReverseDependency[]): void {
        this._reverseDependencyMap = {};
        for (let dep of reverseDependencies) {
            let dependsOn = dep.DependsOn.split(';');
            this._reverseDependencyMap[dep.Type] = dependsOn;
        }
    }

}


interface IDisplayItems {
    ServerExplorerTree: IServerExplorerTree;
}

interface IServerExplorerTree {
    Nodes: INode[];
    CodeGenOptions: ICodeGenOptions;
    ReverseDependencyList: IReverseDependency[];
}

interface INode {
    Name: string;
    LocLabel: string;
    Image?: string;
    BaseClass?: string;
    ValidFor?: string;
    Strategy?: string;
    TypesToReverse?: string;
    DisplayItem?: string;
    Children?: string[];
}

interface ICodeGenOptions {
    UniqueDisplayItem: string[];
}

interface IReverseDependency {
    Type: string;
    DependsOn: string;
}
