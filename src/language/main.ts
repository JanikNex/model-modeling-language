import {AstNode, LangiumDocument, startLanguageServer, URI, UriUtils} from 'langium';
import {NodeFileSystem} from 'langium/node';
import {createConnection, ProposedFeatures} from 'vscode-languageserver/node.js';
import {ConstraintDocument, Model} from "./generated/ast.js";
import {serializeModel} from "./serializer/mml-serializer.js";
import {MmlGeneratorRequest, SerializedDocument, SerializedWorkspace} from "../shared/MmlConnectorTypes.js";
import {createMmlAndGclServices} from "./main-module.js";
import {GclSerializerRequest, GclSerializerResponse} from "../shared/GclConnectorTypes.js";
import {serializeConstraintDocument} from "./constraints/gcl-serializer.js";

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const {shared, mmlServices, gclServices} = createMmlAndGclServices({connection, ...NodeFileSystem});

connection.onRequest("model-modeling-language-get-serialized-workspace", (params: MmlGeneratorRequest) => {
    return new Promise<SerializedWorkspace>(resolve => {
        let serializedDocuments: SerializedDocument[] = [];
        if (shared.workspace.LangiumDocuments.all.isEmpty()) {
            resolve({
                success: false,
                data: `The workspace ${params.wsName} does not contain any managed MML files!`,
                documents: []
            });
        }

        shared.workspace.LangiumDocuments.all.forEach(doc => {
            const docModel: Model = doc.parseResult.value as Model;
            const serializedDoc: SerializedDocument = {
                uri: doc.uri.toString(),
                content: serializeModel(docModel, mmlServices),
                diagnostics: doc.diagnostics ?? []
            };
            serializedDocuments.push(serializedDoc);
        });

        resolve({
            success: true,
            data: "",
            documents: serializedDocuments
        });
    })
});

connection.onRequest("graph-constraint-language-serialize-constraint-file", (params: GclSerializerRequest) => {
    return new Promise<GclSerializerResponse>(resolve => {
        const castedUri: URI = URI.file(params.uri.fsPath);
        if (!shared.workspace.LangiumDocuments.hasDocument(castedUri)) {
            resolve({
                success: false,
                data: "Unknown document",
                filename: "",
                parentDirPath: ""
            })
        } else {
            const cLangiumDoc: LangiumDocument<AstNode> = shared.workspace.LangiumDocuments.getOrCreateDocument(castedUri);
            const cDoc: ConstraintDocument = cLangiumDoc.parseResult.value as ConstraintDocument;
            const sDoc = serializeConstraintDocument(cDoc, gclServices);
            resolve({
                success: sDoc != "",
                data: sDoc,
                filename: UriUtils.basename(cLangiumDoc.uri),
                parentDirPath: UriUtils.dirname(cLangiumDoc.uri).fsPath
            })
        }
    })
});

// Start the language server with the shared services
startLanguageServer(shared);
