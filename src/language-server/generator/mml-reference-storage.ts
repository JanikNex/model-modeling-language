import {AstNode, getDocument, LangiumServices, Reference} from "langium";

export class MmlReferenceStorage {
    private referenceMap: Map<string, AstNode> = new Map<string, AstNode>;
    private nodeMap: Map<AstNode, string> = new Map<AstNode, string>;
    private astLocator;

    constructor(services: LangiumServices) {
        this.astLocator = services.workspace.AstNodeLocator;
    }

    private storeReference(ref: Reference<AstNode>): string {
        const node = ref.ref;
        if (node != undefined) {
            const referenceId = this.getNodeReferenceId(node);
            this.referenceMap.set(referenceId, node);
            this.nodeMap.set(node, referenceId);
            return referenceId;
        } else {
            console.error("Undefined node!")
            return "$$ERROR$$";
        }
    }

    public getNodeReferenceId(node: AstNode): string {
        const doc = getDocument(node);
        const path = this.astLocator.getAstNodePath(node);
        return doc.uri.path + node.$type + path;
    }

    public resolveReference(ref: Reference<AstNode>): string {
        const node = ref.ref;
        if (node != undefined && ref.$nodeDescription != undefined) {
            const lookup = this.nodeMap.get(node);
            if (lookup != undefined) {
                return lookup;
            }
            return this.storeReference(ref);
        } else {
            console.error("Undefined node!")
            return "$$ERROR$$";
        }
    }
}