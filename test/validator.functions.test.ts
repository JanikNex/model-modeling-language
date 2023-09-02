import {describe, expect, test} from "vitest";
import {getValidation} from "./testutils";
import {IssueCodes} from "../src/language-server/model-modeling-language-validator";

describe('Function validator tests', () => {
    test('Validator should notice non-unique function name', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
        }
        
        function F1() {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionNameNotUnique);
    });

    test('Validator should notice missing return statement', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() returns int {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionReturnStatementMissing);
    });

    test('Validator should notice missing return signature', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            return 42
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionReturnTypeSignatureMissing);
    });

    test('Validator should notice non-matching return statement signature pair', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() returns string {
            return 42
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionReturnSignatureTypeMismatch);
    });

    test('Validator should notice missing macro call parameters', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[A.B x] {
        }
        
        function F1() {
            T1[]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentLengthMismatch);
    });

    test('Validator should notice to many macro call parameters', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            T1[42]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentLengthMismatch);
    });

    test('Validator should notice macro call parameter type mismatch 1', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[A.B x] {
        }
        
        function F1() {
            T1[42]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
    });

    test('Validator should notice macro call parameter type mismatch 2', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[A.B x, int y, A.D z] {
        }
        
        function F1() {
            T1[1,2,3]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(2);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
        expect(validationResult.diagnostics.at(1).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
    });

    test('Validator should notice macro call parameter type mismatch 3', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[A.B x, int y, A.D z] {
        }
        
        function F1() {
            T1[A.D::X,2,3]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(2);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
        expect(validationResult.diagnostics.at(1).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
    });

    test('Validator should notice macro call parameter type mismatch 4', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[A.B x, int y, A.D z] {
        }
        
        function F1() {
            T1[1,2,A.D::X]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionMacroCallArgumentTypeMismatch);
    });

    test('Validator should notice missing function call parameters', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2()
        }
        
        function F2(int x) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentLengthMismatch);
    });

    test('Validator should notice to many function call parameters', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2(42)
        }
        
        function F2() {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentLengthMismatch);
    });

    test('Validator should notice function call parameter type mismatch 1', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2(42)
        }
        
        function F2(string x) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
    });

    test('Validator should notice function call parameter type mismatch 2', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2(1,2,3)
        }
        
        function F2(A.B x, int y, A.D z) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(2);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
        expect(validationResult.diagnostics.at(1).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
    });

    test('Validator should notice function call parameter type mismatch 3', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2(A.D::X,2,3)
        }
        
        function F2(A.B x, int y, A.D z) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(2);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
        expect(validationResult.diagnostics.at(1).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
    });

    test('Validator should notice function call parameter type mismatch 4', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            F2(1,2,A.D::X)
        }
        
        function F2(A.B x, int y, A.D z) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionCallArgumentTypeMismatch);
    });

    test('Validator should notice tuple assignment of macro call instance', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x{
            }
        }
        
        function F1() {
            tuple x = T1[].x
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTupleHandlingMismatch);
    });

    test('Validator should notice variable assignment of macro call tuple', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x{
            }
        }
        
        function F1() {
            A.B x = T1[]
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTupleHandlingMismatch);
    });

    test('Validator should notice macro call assignment type mismatch 1', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x{
            }
        }
        
        function F1() {
            A.C x = T1[].x
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTypeMismatch);
    });

    test('Validator should notice macro call assignment type mismatch 2', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x{
            }
        }
        
        function F1() {
            string x = T1[].x
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTypeMismatch);
    });

    test('Validator should notice assignment of void type function', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            string x = F2()
        }
        
        function F2() {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentWithVoidFunction);
    });

    test('Validator should notice tuple assignment of function call', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            tuple x = F2()
        }
        
        function F2() {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTupleHandlingMismatch);
    });

    test('Validator should notice assignment instance selector on function call', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            string x = F2().x
        }
        
        function F2() {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(2);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTupleHandlingMismatch);
        expect(validationResult.diagnostics.at(1).code).toEqual(IssueCodes.FunctionAssignmentWithVoidFunction);
    });

    test('Validator should notice function call assignment type mismatch 1', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            int x = F2()
        }
        
        function F2() returns string{
            return "Hello World"
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTypeMismatch);
    });

    test('Validator should notice function call assignment type mismatch 2', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x {
            }
        }
        
        function F1() {
            A.C y = F2()
        }
        
        function F2() returns A.B {
            A.B x = T1[].x
            return x
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTypeMismatch);
    });

    test('Validator should notice function call assignment type mismatch 3', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            A.C e = F2()
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionAssignmentTypeMismatch);
    });

    test('Validator should notice function loop boundary mismatch', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x {
            }
        }
        
        function F1() {
            for i in 5:1 {
                A.B x = T1[].x
            }
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionLoopBoundaryMismatch);
    });

    test('Validator should notice non-unique function variables 1', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1(int x, A.B x) {
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });

    test('Validator should notice non-unique function variables 2', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.C y {
            }
        }
        
        function F1() {
            tuple y = T1[]
            A.C y = T1[].y
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });

    test('Validator should notice non-unique function variables 3', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.C y {
            }
        }
        
        function F1(A.B y) {
            tuple t = T1[]
            A.C y = T1[].y
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });

    test('Validator should notice non-unique function variables 4', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1(A.B i) {
            for i in 1:5 {
                A.D e = F2()
            }
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });

    test('Validator should notice non-unique function variables 5', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            A.D e = F2()
            for i in 1:5 {
                A.D e = F2()
            }
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });

    test('Validator should notice non-unique function variables 6', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
        }
        
        function F1() {
            for i in 1:5 {
                A.D i = F2()
            }
        }
        
        function F2() returns A.D {
            return A.D::X
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(1);
        expect(validationResult.diagnostics.at(0).code).toEqual(IssueCodes.FunctionVariableNameNotUnique);
    });


    test('Validator should succeed', async () => {
        const validationResult = await getValidation(`
        package A {
            class B {
            }
            class C {
            }
            enum D {
                X
            }
        }    
        macro T1[] {
            A.B x {
            }
            A.C y {
            }
        }
        
        macro T2[int z, A.C x] {
            x {
            }
        }
        
        function F1() {
            T1[]
            tuple t = T1[]
            A.C y = T1[].y
            T2[42,y]
            A.B z = F2()
            A.B p = F3("ABC", A.D::X, z)
            for i in 1:5 {
                A.B x = F2()
            }
        }
        
        function F2() returns A.B {
            A.B x = T1[].x
            return x
        }
        
        function F3(string t, A.D enm, A.B x) returns A.B {
            return x
        }
        `);

        expect(validationResult.diagnostics.length).toEqual(0);
    });
});