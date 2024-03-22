import React, {MouseEventHandler} from "react"
import {ConstraintAssertion} from "../../generated/de/nexus/modelserver/ModelServerConstraints_pb.js";
import {VSCodeButton, VSCodeTag} from "@vscode/webview-ui-toolkit/react";
import "./AssertionContainer.css";
import {FixProposalOptionContainer} from "./FixProposalOptionContainer.js";

export function AssertionContainer(props: { assertion: ConstraintAssertion }) {
    let {assertion} = props

    const [assertionExpanded, setAssertionExpanded] = React.useState(false);
    const [foldIcon, setFoldIcon] = React.useState("codicon codicon-chevron-right");
    const [awaitReevaluation, setAwaitReevaluation] = React.useState(false);

    const toggleExpand = () => {
        if (assertionExpanded) {
            setAssertionExpanded(false);
            setFoldIcon("codicon codicon-chevron-right");
        } else {
            setAssertionExpanded(true);
            setFoldIcon("codicon codicon-chevron-down");
        }
    }

    const handleFixedAssertion = () => {
        if (assertionExpanded) {
            toggleExpand();
        }
        setAwaitReevaluation(true);
    }

    const proposalContainer = assertion.proposalContainer == undefined ? <span>No proposal container!</span> :
        <FixProposalOptionContainer fixProposalContainer={assertion.proposalContainer}
                                    notifyFixedContainerOption={handleFixedAssertion}/>;

    return (
        <>
            <div className="ms-assertion-container-wrapper">
                <AssertionContainerHeader assertionTerm={assertion.expression} assertionViolated={assertion.violated}
                                          awaitingReevaluation={awaitReevaluation}
                                          foldIcon={foldIcon} onToggleFoldButton={toggleExpand}/>

                {assertion.violated && assertionExpanded && (<div className="ms-assertion-container-content-wrapper">
                    <div className="ms-assertion-container-content-visualbox"/>
                    <div className="ms-assertion-container-content">
                        {proposalContainer}
                    </div>
                </div>)}
            </div>
        </>
    )
}


function AssertionContainerHeader(props: {
    assertionTerm: string;
    assertionViolated: boolean;
    awaitingReevaluation: boolean;
    foldIcon: string;
    onToggleFoldButton: MouseEventHandler;
}) {
    let {
        assertionTerm,
        assertionViolated,
        awaitingReevaluation,
        foldIcon,
        onToggleFoldButton
    } = props;

    const computedStyle: CSSStyleDeclaration = getComputedStyle(document.documentElement);

    const iconColor: string = computedStyle.getPropertyValue("--button-primary-foreground");
    const assertionClass = assertionViolated ? awaitingReevaluation ? "ms-assertion-container-header-await-reevaluation" : "ms-assertion-container-header-violated" : "ms-assertion-container-header-fulfilled"

    return (
        <>
            <div className={`ms-assertion-container-header ${assertionClass}`}>
                {assertionViolated && (<div className="ms-assertion-container-button-wrapper">
                    <VSCodeButton appearance="icon" onClick={onToggleFoldButton} disabled={awaitingReevaluation}>
                        <i className={foldIcon} style={{color: iconColor}}></i>
                    </VSCodeButton>
                </div>)}
                <div className="ms-assertion-container-title-wrapper">
                    <div className="ms-assertion-container-title">
                        <VSCodeTag>Assertion</VSCodeTag>
                        <span className="ms-assertion-container-term">{assertionTerm}</span>
                    </div>
                </div>
            </div>
        </>
    )
}