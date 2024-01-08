import {ValidationAcceptor, ValidationChecks} from 'langium';
import {GraphConstraintLanguageServices} from "./graph-constraint-language-module.js";
import {
    AbstractElement,
    Class,
    CompactBindingStatement,
    ConstraintDocument,
    CReference,
    isClass,
    isIInstance,
    ModelModelingLanguageAstType,
    Pattern,
    PatternObject,
    PatternObjectReference,
    TypedVariable,
    VariableType
} from "./generated/ast.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: GraphConstraintLanguageServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.GraphConstraintLanguageValidator;
    const checks: ValidationChecks<ModelModelingLanguageAstType> = {
        ConstraintDocument: [
            validator.checkUniquePatternNames
        ],
        Pattern: [
            validator.checkUniquePatternObjectNames
        ],
        CompactBindingStatement: [
            validator.checkCompactBindingTypeValidity
        ],
        PatternObject: [
            validator.checkPatternObjectVariableTypeValidity
        ],
        PatternObjectReference: [
            validator.checkPatternObjectReferenceTypeMatch
        ]
    };
    registry.register(checks, validator);
}

/**
 * Register issue codes, which are used to attach code actions.
 */
export namespace IssueCodes {
    export const CompactBindingTypeDoesNotMatch = "compact-binding-type-does-not-match";
    export const PatternObjectVariableHasPrimitiveType = "pattern-object-variable-has-primitive-type";
    export const PatternObjectVariableIsInterface = "pattern-object-variable-is-interface";
    export const PatternNameNotUnique = "pattern-name-not-unique";
    export const PatternObjectNameNotUnique = "pattern-object-name-not-unique";
    export const PatternObjectReferenceTypeDoesNotMatch = "pattern-object-reference-type-does-not-match";
}

/**
 * Implementation of custom validations.
 */
export class GraphConstraintLanguageValidator {
    services: GraphConstraintLanguageServices;

    constructor(services: GraphConstraintLanguageServices) {
        this.services = services;
    }

    checkPatternObjectVariableTypeValidity(po: PatternObject, accept: ValidationAcceptor) {
        if (po.var.typing.dtype != undefined && po.var.typing.type == undefined) {
            accept('error', `You cannot use primitive types here!`, {
                node: po.var.typing,
                property: 'dtype',
                code: IssueCodes.PatternObjectVariableHasPrimitiveType
            })
        } else if (po.var.typing.dtype == undefined && po.var.typing.type != undefined && po.var.typing.type.ref != undefined) {
            const patternTypeElement: AbstractElement = po.var.typing.type.ref;
            if (isIInstance(patternTypeElement)) {
                accept('error', `You cannot define patterns using interfaces!'.`, {
                    node: po.var.typing,
                    property: 'type',
                    code: IssueCodes.PatternObjectVariableIsInterface
                })
            }
        }
    }

    checkCompactBindingTypeValidity(cbs: CompactBindingStatement, accept: ValidationAcceptor) {
        if (cbs.selfVar == undefined || cbs.otherVar == undefined) {
            return;
        }
        if (cbs.selfVar.ref != undefined && cbs.otherVar.ref != undefined) {
            const selfVarTyping: VariableType = cbs.selfVar.ref.typing;
            const otherVarTyping: VariableType = cbs.otherVar.ref.typing;
            if (selfVarTyping.type != undefined && otherVarTyping.type != undefined && selfVarTyping.type.ref != undefined && otherVarTyping.type.ref != undefined) {
                if (selfVarTyping.type.ref != otherVarTyping.type.ref) {
                    accept('error', `You cannot bind "${cbs.selfVar.ref.name}" [type: ${selfVarTyping.type.ref.name}] to "${cbs.otherVar.ref.name}" [type: ${otherVarTyping.type.ref.name}]`, {
                        node: cbs,
                        property: 'selfVar',
                        code: IssueCodes.CompactBindingTypeDoesNotMatch
                    })
                }
            }
        }
    }

    checkUniquePatternNames(cDoc: ConstraintDocument, accept: ValidationAcceptor): void {
        const reportedElements = new Set();
        cDoc.patterns.forEach(pattern => {
            if (reportedElements.has(pattern.name)) {
                accept('error', `${pattern.$type} has non-unique name '${pattern.name}'.`, {
                    node: pattern,
                    property: 'name',
                    code: IssueCodes.PatternNameNotUnique
                })
            }
            reportedElements.add(pattern.name);
        });
    }

    checkUniquePatternObjectNames(pattern: Pattern, accept: ValidationAcceptor): void {
        const reportedElements = new Set();
        pattern.objs.forEach(elmt => {
            if (reportedElements.has(elmt.var.name)) {
                accept('error', `${elmt.$type} has non-unique name '${elmt.var.name}'.`, {
                    node: elmt.var,
                    property: 'name',
                    code: IssueCodes.PatternObjectNameNotUnique
                })
            }
            reportedElements.add(elmt.var.name);
        });
    }

    checkPatternObjectReferenceTypeMatch(pRef: PatternObjectReference, accept: ValidationAcceptor) {
        const selectedRef: CReference | undefined = pRef.ref.ref;
        const selectedPatternObjVar: TypedVariable | undefined = pRef.patternObj.ref;
        if (selectedRef != undefined && selectedPatternObjVar != undefined) {
            const refClass: Class | undefined = selectedRef.type.ref;
            const patternObjVarType: VariableType = selectedPatternObjVar.typing;
            if (refClass != undefined && patternObjVarType.type != undefined && patternObjVarType.type.ref != undefined && isClass(patternObjVarType.type.ref)) {
                const varTypeClass: Class = patternObjVarType.type.ref;
                if (varTypeClass != refClass) {
                    accept('error', `${selectedPatternObjVar.name} [type: ${varTypeClass.name}] does not match reference [type: ${refClass.name}].`, {
                        node: pRef,
                        property: 'patternObj',
                        code: IssueCodes.PatternObjectReferenceTypeDoesNotMatch
                    })
                }
            }
        }
    }
}
