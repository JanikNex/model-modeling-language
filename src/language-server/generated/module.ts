/******************************************************************************
 * This file was generated by langium-cli 1.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module } from 'langium';
import { ModelModelingLanguageAstReflection } from './ast';
import { ModelModelingLanguageGrammar } from './grammar';

export const ModelModelingLanguageLanguageMetaData: LanguageMetaData = {
    languageId: 'model-modeling-language',
    fileExtensions: ['.mml'],
    caseInsensitive: false
};

export const ModelModelingLanguageGeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
    AstReflection: () => new ModelModelingLanguageAstReflection()
};

export const ModelModelingLanguageGeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {
    Grammar: () => ModelModelingLanguageGrammar(),
    LanguageMetaData: () => ModelModelingLanguageLanguageMetaData,
    parser: {}
};
